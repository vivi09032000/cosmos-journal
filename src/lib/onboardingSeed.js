import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

const ONBOARDING_SEED_VERSION = 1;

function daysAgo(days) {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return Timestamp.fromDate(date);
}

function getTodayKey() {
  return new Date().toLocaleDateString("sv-SE");
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString("sv-SE");
}

function getStarterContent(locale) {
  if (locale === "en") {
    return {
      orders: [
        {
          title: "A calmer morning rhythm",
          subtitle: "A starter goal you can edit, archive, or turn into your own wish.",
          category: "health",
          tags: ["wellness", "daily rhythm"],
          keywords: ["gentle mornings", "steady energy", "more space"],
          angelNumber: "444",
          journal: [
            {
              q1: "I wake up with enough time to breathe before the day starts.",
              q2: "The room is quiet, and my body feels less rushed.",
              q3: "One small choice today can make tomorrow easier.",
              recordedAt: daysAgo(1),
            },
          ],
          actionItems: [
            { id: "starter-1", title: "Choose tomorrow's first gentle action", completed: false },
            { id: "starter-2", title: "Put one comforting object near the bed", completed: false },
            { id: "starter-3", title: "Drink water before opening notifications", completed: true },
          ],
        },
        {
          title: "Money that feels steady",
          subtitle: "Use this sample to practice turning an intention into tiny steps.",
          category: "wealth",
          tags: ["abundance", "security"],
          keywords: ["ease", "choice", "room to breathe"],
          angelNumber: "888",
          journal: [],
          actionItems: [
            { id: "starter-1", title: "Name one number that would feel supportive this month", completed: false },
            { id: "starter-2", title: "Save one small amount, even symbolic", completed: false },
          ],
        },
      ],
      angelLog: {
        number: "444",
        mood: "steady",
        note: "A first signal to remind me I can begin gently.",
        decodedMessage: "You are allowed to build slowly. The foundation is already forming.",
      },
      gratitude: {
        item1: "One quiet place to return to",
        item2: "The part of me that still wants to try",
        item3: "Small signs that something is moving",
      },
      dailyLog: {
        mood: "hopeful",
        questionAnswer: "One step at a time",
        questionPrompt: "What would make today feel steadier?",
        questionCategory: "Self",
        questionNote: "I can begin without having it all figured out.",
      },
    };
  }

  return {
    orders: [
      {
        title: "更平靜的早晨節奏",
        subtitle: "這是示範目標，你可以點開練習投射、編輯，或改成自己的願望。",
        category: "health",
        tags: ["健康", "日常節奏"],
        keywords: ["溫柔起床", "能量穩定", "多一點空間"],
        angelNumber: "444",
        journal: [
          {
            q1: "我醒來時，有足夠的時間先呼吸，再開始一天。",
            q2: "房間很安靜，身體沒有急著追趕什麼。",
            q3: "今天一個很小的選擇，就能讓明天輕一點。",
            recordedAt: daysAgo(1),
          },
        ],
        actionItems: [
          { id: "starter-1", title: "先選一件明早最溫柔的小行動", completed: false },
          { id: "starter-2", title: "把一個讓你安心的物品放在床邊", completed: false },
          { id: "starter-3", title: "滑手機前先喝一口水", completed: true },
        ],
      },
      {
        title: "讓金錢變得更安穩",
        subtitle: "用這張示範卡，練習把意圖拆成今天能靠近的一小步。",
        category: "wealth",
        tags: ["豐盛", "安全感"],
        keywords: ["餘裕", "選擇", "安心呼吸"],
        angelNumber: "888",
        journal: [],
        actionItems: [
          { id: "starter-1", title: "寫下一個本月會讓你安心的金額", completed: false },
          { id: "starter-2", title: "存下一筆很小但有象徵感的金額", completed: false },
        ],
      },
    ],
    angelLog: {
      number: "444",
      mood: "steady",
      note: "第一個訊號，提醒自己可以慢慢開始。",
      decodedMessage: "你可以慢慢建立，地基已經在形成。",
    },
    gratitude: {
      item1: "有一個安靜的地方可以回來",
      item2: "心裡還願意嘗試的那個自己",
      item3: "事情正在移動的小訊號",
    },
    dailyLog: {
      mood: "hopeful",
      questionAnswer: "一步一步來",
      questionPrompt: "今天怎麼做，會讓你更安穩一點？",
      questionCategory: "自我",
      questionNote: "不用全部想清楚，也可以先開始。",
    },
  };
}

export async function createOnboardingSeed(db, userId, defaultIdentity, locale = "zh-TW") {
  const batch = writeBatch(db);
  const userRef = doc(db, "users", userId);
  const content = getStarterContent(locale);

  batch.set(userRef, {
    createdAt: serverTimestamp(),
    displayName: defaultIdentity.displayName,
    avatarKey: defaultIdentity.avatarKey,
    onboardingSeedVersion: ONBOARDING_SEED_VERSION,
    lastSeen: serverTimestamp(),
  }, { merge: true });

  content.orders.forEach((order, index) => {
    const orderRef = doc(collection(db, "users", userId, "orders"));
    const createdAt = daysAgo(index + 2);

    batch.set(orderRef, {
      ...order,
      status: index === 0 ? "aligning" : "packing",
      imageUrl: "",
      createdAt,
      updatedAt: serverTimestamp(),
      deliveredAt: null,
    });

    if (index === 0) {
      batch.set(doc(collection(db, "users", userId, "angelLogs")), {
        ...content.angelLog,
        linkedOrderId: orderRef.id,
        recordedAt: daysAgo(1),
      });
    }
  });

  batch.set(doc(collection(db, "users", userId, "gratitude")), {
    date: getYesterdayKey(),
    ...content.gratitude,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  });

  batch.set(doc(db, "users", userId, "dailyLogs", getTodayKey()), {
    date: getTodayKey(),
    ...content.dailyLog,
    questionId: 0,
    questionIndex: 0,
    checkedIn: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}
