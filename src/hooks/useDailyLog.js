import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

function getTodayKey() {
  return new Date().toLocaleDateString("sv-SE");
}

export function useDailyLog(userId) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !userId) {
      setEntry(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const entryRef = doc(db, "users", userId, "dailyLogs", getTodayKey());
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

  const saveMood = async (mood) => {
    if (!db || !userId || !mood) return;

    await setDoc(
      doc(db, "users", userId, "dailyLogs", getTodayKey()),
      {
        date: getTodayKey(),
        mood,
        checkedIn: true,
        updatedAt: serverTimestamp(),
        createdAt: entry?.createdAt || serverTimestamp(),
      },
      { merge: true },
    );
  };

  const saveQuestionAnswer = async (questionId, prompt, answer, note = null, category = "") => {
    if (!db || !userId) return;

    await setDoc(
      doc(db, "users", userId, "dailyLogs", getTodayKey()),
      {
        date: getTodayKey(),
        questionId,
        questionIndex: questionId,
        questionPrompt: prompt,
        questionAnswer: answer,
        questionNote: note || null,
        questionCategory: category,
        checkedIn: true,
        updatedAt: serverTimestamp(),
        createdAt: entry?.createdAt || serverTimestamp(),
      },
      { merge: true },
    );
  };

  const saveNumberSignal = async (signal, note) => {
    if (!db || !userId) return;

    await setDoc(
      doc(db, "users", userId, "dailyLogs", getTodayKey()),
      {
        date: getTodayKey(),
        numberSignal: signal || "",
        numberNote: note || "",
        checkedIn: true,
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
    saveMood,
    saveQuestionAnswer,
    saveNumberSignal,
  };
}
