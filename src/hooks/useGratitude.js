import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";

function getToday() {
  return new Date().toLocaleDateString("sv-SE");
}

export function useGratitude(userId) {
  const [entries, setEntries] = useState([]);
  const [todayEntry, setTodayEntry] = useState(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !userId) {
      setEntries([]);
      setTodayEntry(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const entriesRef = collection(db, "users", userId, "gratitude");
    const unsubscribeAll = onSnapshot(
      entriesRef,
      (snapshot) => {
        const nextEntries = snapshot.docs.map((entryDoc) => ({
          id: entryDoc.id,
          ...entryDoc.data(),
        }));
        setEntries(nextEntries);
      },
      (entriesError) => setError(entriesError.message),
    );

    const todayQuery = query(entriesRef, where("date", "==", getToday()));
    const unsubscribeToday = onSnapshot(
      todayQuery,
      (snapshot) => {
        setTodayEntry(
          snapshot.docs[0]
            ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
            : null,
        );
        setLoading(false);
      },
      (todayError) => {
        setError(todayError.message);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeAll();
      unsubscribeToday();
    };
  }, [userId]);

  const streak = useMemo(() => {
    const sortedDates = [...entries]
      .map((entry) => entry.date)
      .filter(Boolean)
      .sort((left, right) => right.localeCompare(left));

    let count = 0;
    const cursor = new Date();

    while (sortedDates.includes(cursor.toLocaleDateString("sv-SE"))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return count;
  }, [entries]);

  const saveGratitude = async ({ item1, item2 = "", item3 = "" }) => {
    if (!db) return;
    if (todayEntry) {
      await updateDoc(doc(db, "users", userId, "gratitude", todayEntry.id), {
        item1,
        item2,
        item3,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    await addDoc(collection(db, "users", userId, "gratitude"), {
      date: getToday(),
      item1,
      item2,
      item3,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const saveQuickGratitude = async (value) => {
    if (!db) return;
    await saveGratitude({
      item1: value,
      item2: todayEntry?.item2 || "",
      item3: todayEntry?.item3 || "",
    });
  };

  return {
    todayEntry,
    entries,
    streak,
    loading,
    error,
    saveGratitude,
    saveQuickGratitude,
  };
}
