import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

function getTodayKey() {
  return new Date().toLocaleDateString("sv-SE");
}

export function useDailyQuestion(userId) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !userId) {
      setEntry(null);
      setLoading(false);
      return;
    }

    const entryRef = doc(db, "users", userId, "dailyQuestions", getTodayKey());
    const unsubscribe = onSnapshot(
      entryRef,
      (snapshot) => {
        setEntry(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const saveAnswer = async ({ prompt, answer }) => {
    if (!db || !userId) return;

    await setDoc(
      doc(db, "users", userId, "dailyQuestions", getTodayKey()),
      {
        date: getTodayKey(),
        prompt,
        answer,
        updatedAt: serverTimestamp(),
        createdAt: entry?.createdAt || serverTimestamp(),
      },
      { merge: true },
    );
  };

  return {
    entry,
    loading,
    error,
    saveAnswer,
  };
}
