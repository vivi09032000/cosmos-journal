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

function getStorageErrorMessage(error, locale = "zh-TW") {
  const copy = locale === "en"
    ? {
      unauthorized: "Firebase Storage access is not allowed yet. Check your Storage rules.",
      canceled: "Image upload was canceled.",
      unknown: "Firebase Storage returned an unknown error. Confirm Storage is enabled.",
      quota: "Firebase Storage quota has been exceeded.",
      fallback: "Image upload failed.",
      storageMissing: "Firebase Storage is not configured yet. Confirm storageBucket and the Storage service.",
    }
    : {
      unauthorized: "Firebase Storage 權限尚未開放，請先檢查 Storage 規則。",
      canceled: "圖片上傳已取消。",
      unknown: "Firebase Storage 發生未知錯誤，請確認 Storage 已啟用。",
      quota: "Firebase Storage 配額已超過。",
      fallback: "圖片上傳失敗。",
      storageMissing: "Firebase Storage 尚未完成設定，請先確認 storageBucket 和 Storage 服務。",
    };

  switch (error?.code) {
    case "storage/not-configured":
      return copy.storageMissing;
    case "storage/unauthorized":
      return copy.unauthorized;
    case "storage/canceled":
      return copy.canceled;
    case "storage/unknown":
      return copy.unknown;
    case "storage/quota-exceeded":
      return copy.quota;
    default:
      return error?.message || copy.fallback;
  }
}

async function uploadOrderImage(userId, orderId, imageFile, locale) {
  if (!storage) {
    throw new Error(getStorageErrorMessage({ code: "storage/not-configured" }, locale));
  }

  if (!userId || !orderId) {
    throw new Error(getStorageErrorMessage({ code: "storage/unauthorized" }, locale));
  }

  try {
    const preparedImageFile = await prepareImageForUpload(imageFile, locale);
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

    throw new Error(getStorageErrorMessage(error, locale));
  }
}

export function useOrders(userId, locale = "zh-TW") {
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

    await setDoc(orderRef, {
      title,
      subtitle: subtitle || "",
      status: "packing",
      angelNumber: angelNumber || "",
      imageUrl: "",
      journal: [],
      actionItems: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deliveredAt: null,
    });

    if (!imageFile) return;

    const imageUrl = await uploadOrderImage(userId, orderRef.id, imageFile, locale);

    await updateDoc(orderRef, {
      imageUrl,
      updatedAt: serverTimestamp(),
    });
  };

  const updateOrderImage = async (orderId, imageFile) => {
    if (!db || !userId || !imageFile) return;

    const orderRef = doc(db, "users", userId, "orders", orderId);
    const imageUrl = await uploadOrderImage(userId, orderId, imageFile, locale);

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
