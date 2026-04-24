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

    if (imageFile && storage) {
      const imageRef = ref(storage, `users/${userId}/orders/${orderRef.id}/cover-${Date.now()}-${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      await updateDoc(orderRef, {
        imageUrl,
        updatedAt: serverTimestamp(),
      });
    }
  };

  const updateOrderImage = async (orderId, imageFile) => {
    if (!db || !storage || !imageFile) return;

    const orderRef = doc(db, "users", userId, "orders", orderId);
    const imageRef = ref(storage, `users/${userId}/orders/${orderId}/cover-${Date.now()}-${imageFile.name}`);

    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);

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
