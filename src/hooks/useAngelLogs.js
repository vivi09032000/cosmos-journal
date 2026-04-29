import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";

const ANGEL_DATA_BY_LOCALE = {
  "zh-TW": {
    "111": {
      title: "新的起點正在開啟",
      message: "你的思想正在快速成真，保持積極的念頭。",
      energy: "創造",
    },
    "222": {
      title: "信任這個過程",
      message: "一切正在按照神聖計劃發展。你所播下的種子正在生根。",
      energy: "平衡",
    },
    "333": {
      title: "宇宙三位一體",
      message: "你的守護者就在身旁，確認你走在正確的道路上。",
      energy: "支持",
    },
    "444": {
      title: "天使正圍繞著你",
      message: "你有強大的保護與支持。地基已為你打好，相信這個基礎。",
      energy: "穩定",
    },
    "555": {
      title: "重大轉變即將到來",
      message: "巨大改變正在臨近，將把你帶往更高的自我。擁抱未知。",
      energy: "蛻變",
    },
    "777": {
      title: "宇宙在為你喝彩",
      message: "奇蹟與幸運正向你聚集。這是對齊的最高時刻。",
      energy: "奇蹟",
    },
    "888": {
      title: "豐盛之門已打開",
      message: "財富與繁榮正在流向你。打開雙手接受所有美好。",
      energy: "豐盛",
    },
    "999": {
      title: "一個循環的完成",
      message: "某個章節已寫完。放下舊有，為靈魂的新使命騰出空間。",
      energy: "完成",
    },
  },
  en: {
    "111": {
      title: "A new beginning is opening",
      message: "Your thoughts are forming quickly. Keep your attention aligned with what you want.",
      energy: "Creation",
    },
    "222": {
      title: "Trust the process",
      message: "Things are unfolding in the right order. What you planted is taking root now.",
      energy: "Balance",
    },
    "333": {
      title: "You are supported",
      message: "Your guides are close and confirming that you are moving on the right path.",
      energy: "Support",
    },
    "444": {
      title: "You are strongly protected",
      message: "Support is around you. The foundation under this path is stronger than you think.",
      energy: "Stability",
    },
    "555": {
      title: "A major shift is near",
      message: "A meaningful change is approaching. Let the unknown expand you instead of shrinking you.",
      energy: "Change",
    },
    "777": {
      title: "The universe is applauding you",
      message: "Luck and alignment are gathering around you. Keep moving with trust.",
      energy: "Miracle",
    },
    "888": {
      title: "The gate of abundance is open",
      message: "Prosperity is moving toward you. Stay open enough to receive it.",
      energy: "Abundance",
    },
    "999": {
      title: "A cycle is complete",
      message: "One chapter has reached its end. Let go of what is finished so the next one can arrive.",
      energy: "Completion",
    },
  },
};

export const ANGEL_DATA = ANGEL_DATA_BY_LOCALE["zh-TW"];

export function getAngelData(locale = "zh-TW") {
  return ANGEL_DATA_BY_LOCALE[locale] || ANGEL_DATA_BY_LOCALE["zh-TW"];
}

export function useAngelLogs(userId) {
  const [angelLogs, setAngelLogs] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !userId) {
      setAngelLogs([]);
      setLoading(false);
      return;
    }

    const angelLogsQuery = query(
      collection(db, "users", userId, "angelLogs"),
      orderBy("recordedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      angelLogsQuery,
      (snapshot) => {
        setAngelLogs(
          snapshot.docs.map((angelLogDoc) => ({
            id: angelLogDoc.id,
            ...angelLogDoc.data(),
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

  const latestNumber = useMemo(
    () => angelLogs[0]?.number || "444",
    [angelLogs],
  );

  const createAngelLog = async ({
    number,
    mood,
    note,
    linkedOrderId,
    decodedMessage,
  }) => {
    if (!db) return;
    await addDoc(collection(db, "users", userId, "angelLogs"), {
      number,
      mood,
      note: note || "",
      linkedOrderId: linkedOrderId || "",
      decodedMessage,
      recordedAt: serverTimestamp(),
    });
  };

  return {
    angelLogs,
    latestNumber,
    loading,
    error,
    createAngelLog,
  };
}
