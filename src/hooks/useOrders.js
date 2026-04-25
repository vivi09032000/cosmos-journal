import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { db, storage } from "../firebase";
import { prepareImageForUpload } from "../lib/imageUpload";

function getStorageErrorMessage(error) {
  switch (error?.code) {
    case "storage/unauthorized":
      return "Firebase Storage 權限尚未開放，請先檢查 Storage 規則。";
    case "storage/canceled":
      return "圖片上傳已取消。";
    case "storage/unknown":
      return "Firebase Storage 發生未知錯誤，請確認 Storage 已啟用。";
    case "storage/quota-exceeded":
      return "Firebase Storage 配額已超過。";
    default:
      return error?.message || "圖片上傳失敗。";
  }
}

async function uploadOrderImage(userId, orderId, imageFile) {
  if (!storage) {
    throw new Error("Firebase Storage 尚未完成設定，請先確認 storageBucket 和 Storage 服務。");
  }

  try {
    const preparedImageFile = await prepareImageForUpload(imageFile);
    const imageRef = ref(storage, `users/${userId}/orders/${orderId}.webp`);

    await uploadBytes(imageRef, preparedImageFile, {
      contentType: preparedImageFile.type,
      cacheControl: "public,max-age=31536000,immutable",
    });
    const downloadUrl = await getDownloadURL(imageRef);
    const separator = downloadUrl.includes("?") ? "&" : "?";

    return `${downloadUrl}${separator}v=${Date.now()}`;
  } catch (error) {
    if (error instanceof Error && !error?.code) {
      throw error;
    }

    throw new Error(getStorageErrorMessage(error));
  }
}

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const ordersQuery = query(
      collection(db, "users", userId, "orders"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(
          snapshot.docs.map((orderDoc) => ({
            id: orderDoc.id,
            ...orderDoc.data(),
          })),
        );
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const stats = useMemo(
    () =>
      orders.reduce(
        (accumulator, order) => {
          accumulator[order.status] += 1;
          return accumulator;
        },
        { packing: 0, aligning: 0, delivered: 0 },
      ),
    [orders],
  );

  useEffect(() => {
    const preloadUrls = orders
      .map((order) => order.imageUrl)
      .filter(Boolean)
      .slice(0, 6);

    preloadUrls.forEach((imageUrl) => {
      const image = new Image();
      image.decoding = "async";
      image.src = imageUrl;
    });
  }, [orders]);

  const createOrder = async ({ title, subtitle, angelNumber, imageFile }) => {
    if (!db) return;
    const ordersRef = collection(db, "users", userId, "orders");
    const orderRef = doc(ordersRef);
    let imageUrl = "";

    if (imageFile) {
      imageUrl = await uploadOrderImage(userId, orderRef.id, imageFile);
    }

    await setDoc(orderRef, {
      title,
      subtitle: subtitle || "",
      status: "packing",
      angelNumber: angelNumber || "",
      imageUrl,
      journal: [],
      actionItems: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deliveredAt: null,
    });
  };

  const updateOrderImage = async (orderId, imageFile) => {
    if (!db || !imageFile) return;

    const orderRef = doc(db, "users", userId, "orders", orderId);
    const imageUrl = await uploadOrderImage(userId, orderId, imageFile);

    await updateDoc(orderRef, {
      imageUrl,
      updatedAt: serverTimestamp(),
    });
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!db) return;
    const payload = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "delivered") {
      payload.deliveredAt = serverTimestamp();
    }

    await updateDoc(doc(db, "users", userId, "orders", orderId), payload);
  };

  const addJournalEntry = async (orderId, entry) => {
    if (!db) return;
    await updateDoc(doc(db, "users", userId, "orders", orderId), {
      journal: arrayUnion({
        ...entry,
        recordedAt: Timestamp.now(),
      }),
      updatedAt: serverTimestamp(),
    });
  };

  const saveActionItems = async (orderId, actionItems) => {
    if (!db) return;
    await updateDoc(doc(db, "users", userId, "orders", orderId), {
      actionItems,
      updatedAt: serverTimestamp(),
    });
  };

  return {
    orders,
    stats,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    addJournalEntry,
    saveActionItems,
    updateOrderImage,
  };
}
