import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db, firebaseErrorMessage } from "../firebase";

function reduceToLifePath(value) {
  let current = value;

  while (current > 9 && ![11, 22, 33].includes(current)) {
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return current;
}

export function calculateLifePathNumber(birthday) {
  const digits = birthday.replace(/\D/g, "");

  if (digits.length === 0) {
    return null;
  }

  const sum = digits
    .split("")
    .reduce((total, digit) => total + Number(digit), 0);

  return reduceToLifePath(sum);
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth || !db) {
      setError(firebaseErrorMessage || "Firebase 尚未設定完成。");
      setLoading(false);
      return undefined;
    }

    let unsubscribeProfile = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      unsubscribeProfile();

      if (nextUser) {
        setUser(nextUser);
        const userRef = doc(db, "users", nextUser.uid);
        const snapshot = await getDoc(userRef);

        await setDoc(
          userRef,
          {
            ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
            lastSeen: serverTimestamp(),
          },
          { merge: true },
        );

        unsubscribeProfile = onSnapshot(
          userRef,
          (userSnapshot) => {
            setProfile(userSnapshot.exists() ? userSnapshot.data() : null);
            setLoading(false);
          },
          (profileError) => {
            setError(profileError.message);
            setLoading(false);
          },
        );
        return;
      }

      setUser(null);
      setProfile(null);

      try {
        await signInAnonymously(auth);
      } catch (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeProfile();
      unsubscribe();
    };
  }, []);

  const saveBirthday = async (birthday) => {
    if (!db || !user?.uid) return;

    const lifePathNumber = calculateLifePathNumber(birthday);

    await setDoc(
      doc(db, "users", user.uid),
      {
        birthday,
        lifePathNumber,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  return { user, profile, loading, error, saveBirthday };
}
