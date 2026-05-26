# LINE AI Reply Bot — Product Spec

## 概念
一個私人 LINE Bot，你把對方的訊息轉傳給它，它分析語氣和上下文，回你三個可以直接複製使用的回覆選項。

---

## 使用流程

```
1. 對方傳訊息給你
2. 你長按那則訊息 → 轉傳 → 選 Bot
3. Bot 分析後回覆三個選項
4. 你複製其中一個，貼回原本的對話
```

可選：直接把整段對話文字貼給 Bot，它一樣分析。

---

## 技術架構

### Stack
- **Runtime**: Node.js
- **Framework**: Express（或 Next.js API Routes）
- **部署**: Vercel
- **LINE**: LINE Messaging API（Webhook）
- **AI**: Anthropic Claude API（claude-sonnet-4-20250514）

### 資料政策
- **不存任何資料**
- 訊息進來 → 送 Claude → 回覆 → 結束
- 沒有 database，沒有 log，沒有 session

---

## API 流程

```
LINE Webhook → Vercel Function
  → 接收轉傳訊息文字
  → 組成 Claude prompt
  → 取得三個回覆選項
  → 用 LINE Reply API 回傳給用戶
```

---

## Claude Prompt 設計

### System Prompt
```
你是一個回覆助手。分析以下對話的語氣、情境和關係，
給出三個風格不同的回覆選項。

規則：
- 用繁體中文，台灣朋友的日常語氣
- 每個選項不超過 30 字
- 不能讓人覺得是 AI 寫的
- 三個選項風格要明顯不同

格式（嚴格照這個輸出，不要加其他文字）：
A｜[回覆內容]
B｜[回覆內容]
C｜[回覆內容]
```

### 三個選項的預設風格方向
| 選項 | 風格 | 目的 |
|------|------|------|
| A | 簡短同理，話題收尾 | 省力但不冷漠 |
| B | 給建議或方向 | 有在聽的感覺 |
| C | 最短，emoji 或一句話 | 極省力備用 |

---

## LINE Bot 回覆格式

```
收到！以下三個回覆選項：

A｜好，走程序比較保險
B｜立案了就等吧，慢慢來
C｜👍

長按複製你要的那個 ✌️
```

---

## 多語言支援

Bot 自動偵測對話語言，切換回覆語言：
- 中文對話 → 中文選項
- 英文對話（交友軟體）→ 英文選項，語氣自然不做作
- 混合 → 跟對話語言一致

---

## 環境變數

```env
LINE_CHANNEL_SECRET=xxx
LINE_CHANNEL_ACCESS_TOKEN=xxx
ANTHROPIC_API_KEY=xxx
```

---

## 部署步驟

1. 建立 LINE Developers 帳號，新增 Messaging API channel
2. 設定 Webhook URL = `https://your-app.vercel.app/api/webhook`
3. 部署到 Vercel，設定環境變數
4. 在 LINE 加 Bot 為好友（掃 QR code）
5. 測試：轉傳一則訊息給 Bot

---

## MVP 範圍（第一版）

- [x] 接收轉傳訊息
- [x] Claude 分析 + 三選一回覆
- [x] 繁體中文 + 英文支援
- [ ] 記憶前幾則上下文（第二版）
- [ ] 自訂語氣偏好（第二版）
- [ ] 給其他人用的公開版（第三版）
