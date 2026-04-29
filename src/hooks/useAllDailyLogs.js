import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

export function useAllDailyLogs(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !userId) {
      setEntries([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const logsQuery = query(
      collection(db, "users", userId, "dailyLogs"),
      orderBy("date", "desc"),
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        setEntries(
          snapshot.docs.map((logDoc) => ({
            id: logDoc.id,
            ...logDoc.data(),
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

  return { entries, loading, error };
}
