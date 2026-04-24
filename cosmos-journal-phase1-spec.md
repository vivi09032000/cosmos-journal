# 宇宙手帳 Cosmos Journal — Phase 1 骨架規格書

> **給 AI 的說明**
> 這個階段的目標是：功能能動、資料能存、四個 Tab 能切換。
> **不需要做任何視覺設計**。所有顏色使用預設、所有圖片位置用灰色 placeholder div 代替。
> 視覺主題會在 Phase 3 統一套入，現在不要花時間在 UI 上。

---

## 技術棧

- **前端**：React 18 + Vite
- **樣式**：Tailwind CSS（只用基本 utility，不要自訂主題）
- **後端**：Firebase（Firestore + Auth）
- **部署**：Vercel + GitHub
- **語言**：繁體中文介面

---

## Firebase 初始化

```
專案名稱：cosmos-journal
Auth：啟用匿名登入（Anonymous）
Firestore：建立以下 collections（見資料結構章節）
Storage：暫時不需要
```

---

## Firestore 資料結構

### Collection: `users/{userId}`
```
{
  createdAt: Timestamp,
  lastSeen: Timestamp
}
```

### Collection: `users/{userId}/orders`（顯化訂單）
```
{
  id: string,                    // auto-generated
  title: string,                 // 願望標題，例如「在日本滑雪」
  subtitle: string,              // 副標題，可空白
  status: "packing" | "aligning" | "delivered",
  angelNumber: string,           // 對應的天使數字，例如 "444"，可空白
  imageUrl: string,              // 圖片 URL，Phase 1 先留空字串
  createdAt: Timestamp,
  updatedAt: Timestamp,
  deliveredAt: Timestamp | null,
  journal: [                     // 感官日記陣列，用 arrayUnion 新增
    {
      recordedAt: Timestamp,
      q1: string,                // 感官問題 1 的回答
      q2: string,                // 感官問題 2 的回答
      q3: string                 // 感官問題 3 的回答
    }
  ]
}
```

### Collection: `users/{userId}/angelLogs`（天使數字紀錄）
```
{
  id: string,
  number: string,                // 使用者輸入的數字，例如 "444"
  mood: "calm" | "sad" | "anxious" | "confused" | "excited" | "touched",
  note: string,                  // 心情筆記，可空白
  linkedOrderId: string,         // 連結的訂單 ID，可空白
  decodedMessage: string,        // AI 解碼結果（Phase 1 先用靜態文字）
  recordedAt: Timestamp
}
```

### Collection: `users/{userId}/gratitude`（感恩日記）
```
{
  id: string,
  date: string,                  // "2026-04-23"（YYYY-MM-DD，每天一筆）
  item1: string,
  item2: string,
  item3: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## App 結構

```
src/
├── main.jsx
├── App.jsx                      // Router + Auth 初始化
├── firebase.js                  // Firebase 設定
├── hooks/
│   ├── useAuth.js               // 匿名登入邏輯
│   ├── useOrders.js             // 訂單 CRUD
│   ├── useAngelLogs.js          // 天使數字 CRUD
│   └── useGratitude.js          // 感恩日記 CRUD
├── pages/
│   ├── TodayPage.jsx
│   ├── OrdersPage.jsx
│   ├── AngelPage.jsx
│   └── GratitudePage.jsx
└── components/
    ├── BottomNav.jsx
    ├── OrderCard.jsx
    ├── OrderDetail.jsx          // 包含逐題感官日記對話
    ├── AngelDecoder.jsx
    └── GratitudeEntry.jsx
```

---

## 四個 Tab 的功能規格

### Tab 1：今日（TodayPage）

**顯示內容：**
- 今日日期與星期
- 今日天使能量數字（先 hardcode 顯示 444，之後改成從 angelLogs 取最近一筆）
- 訂單狀態摘要：打包中 N件 / 對準中 N件 / 已送達 N件
- 今日感恩快速輸入（一個 textarea，送出後寫入 gratitude collection 的 item1）
- 快速行動按鈕：「寫下感恩」「新增訂單」「開始解碼」（各自跳到對應 Tab）

**資料需求：**
- 讀取 orders collection（計算各狀態數量）
- 讀取今日 gratitude 文件（判斷是否已填）
- 寫入 gratitude（快速感恩）

---

### Tab 2：訂單（OrdersPage）

**列表頁顯示：**
- 所有訂單卡片，依 createdAt 降冪排列
- 每張卡片顯示：
  - 圖片 placeholder（灰色 div，標註「圖片」）
  - 訂單天使號碼 badge（例如 #444）
  - 標題
  - 狀態（打包中 / 對準中 / 已送達）
  - 建立至今天數
- 右下角「+」按鈕 → 新增訂單 modal

**新增訂單 Modal：**
```
欄位：
- 願望標題（必填）
- 副標題（選填）
- 天使號碼（選填，下拉選擇：111/222/333/444/555/777/888/999）
```
送出後寫入 Firestore，status 預設為 "packing"。

**訂單詳情頁（OrderDetail）：**
點擊卡片進入，顯示：
1. 圖片 placeholder
2. 標題 + 天使號碼 + 建立天數
3. **逐題感官日記對話**（重要，見下方詳細說明）
4. 狀態更新按鈕：
   - 若 status = "packing" → 顯示「對準中，繼續投射」按鈕 → 更新為 "aligning"
   - 若 status = "aligning" → 顯示「✨ 已實現，點此收貨」按鈕 → 更新為 "delivered" + 記錄 deliveredAt
5. 過去的日記紀錄（依時間軸顯示 journal 陣列）

**逐題感官日記對話邏輯：**
```
Phase 1 先用 3 個靜態問題（之後 Phase 4 換成 Gemini 生成）：
Q1：「當這一刻真實發生時，你的腳踩在哪裡？地板是什麼感覺？」
Q2：「你身邊的空氣聞起來像什麼？溫度是涼還是暖？」
Q3：「此刻你臉上的表情是什麼樣子的？」

互動流程：
- 一次只顯示一個問題 + 一個 textarea
- 使用者輸入超過 5 個字後，自動顯示下一題（或按 Enter 繼續）
- 三題全部回答完 → 顯示「發送給宇宙」按鈕
- 點擊後將 {q1, q2, q3, recordedAt} 用 arrayUnion 加入 journal 陣列
```

---

### Tab 3：天使（AngelPage）

**主要功能：**
- 數字輸入框（大字體顯示）
- 快速選擇 pill：111 / 222 / 333 / 444 / 555 / 777 / 888 / 999
- 「解碼訊息」按鈕

**解碼結果顯示（Phase 1 用靜態文字）：**
```javascript
// 靜態解碼資料，Phase 4 換成 Gemini API
const ANGEL_DATA = {
  "111": { title: "新的起點正在開啟", message: "你的思想正在快速成真，保持積極的念頭。", energy: "創造" },
  "222": { title: "信任這個過程", message: "一切正在按照神聖計劃發展。你所播下的種子正在生根。", energy: "平衡" },
  "333": { title: "宇宙三位一體", message: "你的守護者就在身旁，確認你走在正確的道路上。", energy: "支持" },
  "444": { title: "天使正圍繞著你", message: "你有強大的保護與支持。地基已為你打好，相信這個基礎。", energy: "穩定" },
  "555": { title: "重大轉變即將到來", message: "巨大改變正在臨近，將把你帶往更高的自我。擁抱未知。", energy: "蛻變" },
  "777": { title: "宇宙在為你喝彩", message: "奇蹟與幸運正向你聚集。這是對齊的最高時刻。", energy: "奇蹟" },
  "888": { title: "豐盛之門已打開", message: "財富與繁榮正在流向你。打開雙手接受所有美好。", energy: "豐盛" },
  "999": { title: "一個循環的完成", message: "某個章節已寫完。放下舊有，為靈魂的新使命騰出空間。", energy: "完成" }
}
```

**解碼後顯示：**
- 數字大字標題
- 標題 + 訊息
- 情緒選擇（6個選項）：平靜 / 難過 / 焦慮 / 迷惘 / 期待 / 感動
- 心情筆記 textarea（選填）
- 「連結到我的訂單」展開區（列出所有 orders，點選後記錄 linkedOrderId）
- 「記錄這個時刻」按鈕 → 寫入 angelLogs collection

**紀錄頁：**
- 列出所有 angelLogs，依 recordedAt 降冪
- 每筆顯示：數字、情緒、日期、訊息摘要

---

### Tab 4：感恩（GratitudePage）

**今日填寫區：**
- 三個輸入欄（item1 / item2 / item3）
- 每欄有各自的 placeholder：
  - 「此刻最想感謝的是...」
  - 「今天一個小小的美好...」
  - 「一件讓你微笑的事...」
- 「記錄感恩」按鈕
- 若今日已填過 → 顯示已填內容，可編輯更新

**邏輯說明：**
```
每天只存一筆（以 date 欄位 YYYY-MM-DD 為 key）
判斷今日是否已填：query gratitude where date == today
若已存在 → update；若不存在 → create
```

**連續天數顯示：**
- 從 gratitude collection 取全部 date，計算連續天數
- 顯示：「連續感恩第 N 天」

**歷史時間軸：**
- 依 date 降冪列出過去所有紀錄
- 每筆顯示：日期 + item1/2/3

---

## Auth 邏輯

```javascript
// App 啟動時自動匿名登入
// 若已有 uid（localStorage 或 Firebase 緩存）直接使用
// 不需要任何登入介面，靜默執行

import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth);
  }
});
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Phase 1 完成標準（Checklist）

完成以下全部才算 Phase 1 結束：

```
□ Firebase 專案建立，Firestore 規則部署完成
□ 匿名登入自動執行，userId 可取得
□ 底部導航四個 Tab 可切換
□ 訂單：可新增、可看列表、可進入詳情
□ 訂單：逐題感官日記可填寫並儲存到 journal 陣列
□ 訂單：狀態可從 packing → aligning → delivered 更新
□ 天使數字：可輸入數字取得靜態解碼結果
□ 天使數字：可記錄情緒 + 筆記到 angelLogs
□ 天使數字：可連結到某一筆訂單
□ 感恩：今日三欄可填寫並儲存
□ 感恩：連續天數計算正確
□ 今日頁：訂單狀態統計數字正確
□ 部署到 Vercel，有可訪問的 HTTPS 網址
```

---

## 注意事項

1. **圖片欄位**：所有需要圖片的地方用 `<div className="bg-gray-200 w-full h-40 flex items-center justify-center text-gray-400">圖片</div>` 代替，不要串接任何圖片 API

2. **AI 功能**：感官問題和天使解碼 Phase 1 全部用靜態資料，不要呼叫任何 AI API

3. **中文**：所有介面文字使用繁體中文

4. **錯誤處理**：每個 Firestore 操作都要有基本的 try/catch，失敗時用 console.error 記錄

5. **不要做的事**：客製化字體、複雜動畫、漸層色彩、任何讓 UI 變好看的事情——留給 Phase 3
