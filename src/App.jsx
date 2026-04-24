import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { useAngelLogs } from "./hooks/useAngelLogs";
import { useAuth } from "./hooks/useAuth";
import { useGratitude } from "./hooks/useGratitude";
import { useOrders } from "./hooks/useOrders";
import { firebaseErrorMessage } from "./firebase";
import AngelPage from "./pages/AngelPage";
import GratitudePage from "./pages/GratitudePage";
import OrdersPage from "./pages/OrdersPage";
import TimeCapsulePage from "./pages/TimeCapsulePage";
import TodayPage from "./pages/TodayPage";
import WallPage from "./pages/WallPage";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 121 }, (_, index) => CURRENT_YEAR - index);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

function padDateUnit(value) {
  return String(value).padStart(2, "0");
}

function getDaysInMonth(year, month) {
  if (!year || !month) {
    return 31;
  }

  return new Date(year, month, 0).getDate();
}

function LoadingScreen({ label }) {
  return (
    <div className="cosmos-stage flex items-center justify-center">
      <div className="paper-card max-w-sm px-6 py-8 text-center">
        <p className="gold-kicker">Cosmos Journal</p>
        <h1 className="section-title mt-3 text-[1.8rem]">宇宙正在整理你的頁面</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{label}</p>
      </div>
    </div>
  );
}

function SetupScreen({ label }) {
  return (
    <div className="cosmos-stage flex items-center justify-center">
      <div className="paper-card max-w-lg px-6 py-8">
        <p className="gold-kicker">Firebase Setup</p>
        <h1 className="section-title mt-3 text-[1.8rem]">目前不是白屏，是初始化被設定擋住了。</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{label}</p>
        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
          請在專案根目錄建立 `.env`，並把 `.env.example` 裡的欄位填上 Firebase 專案參數後重新整理。
        </p>
        <p className="mt-3 text-xs tracking-[0.2em] text-[color:var(--ink-faint)]">
          檔案位置：/Users/heyvienne/Documents/宇宙手帳/.env
        </p>
      </div>
    </div>
  );
}

function BirthdayOnboarding({ onConfirm }) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dayOptions = Array.from(
    { length: getDaysInMonth(Number(year), Number(month)) },
    (_, index) => index + 1,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!year || !month || !day) {
      setError("請先選擇生日。");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const birthday = `${year}-${padDateUnit(month)}-${padDateUnit(day)}`;
      await onConfirm(birthday);
    } catch (saveError) {
      setError(saveError.message || "生日儲存失敗，請再試一次。");
      setSaving(false);
    }
  };

  return (
    <div className="cosmos-stage flex items-center justify-center">
      <form onSubmit={handleSubmit} className="paper-card w-full max-w-lg px-6 py-8">
        <p className="gold-kicker">Birthday Onboarding</p>
        <h1 className="section-title mt-3 text-[1.8rem] leading-[1.35]">
          宇宙需要知道你的生日，
          <br />
          才能為你計算今日能量
        </h1>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <select
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setError("");
            }}
            className="cosmos-select"
            required
          >
            <option value="">年份</option>
            {YEAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setDay("");
              setError("");
            }}
            className="cosmos-select"
            required
          >
            <option value="">月份</option>
            {MONTH_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={day}
            onChange={(event) => {
              setDay(event.target.value);
              setError("");
            }}
            className="cosmos-select"
            required
          >
            <option value="">日期</option>
            {dayOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {error ? (
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={!year || !month || !day || saving}
          className="primary-button mt-5 w-full"
        >
          {saving ? "確認中..." : "確認"}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const {
    user,
    profile,
    loading: authLoading,
    error: authError,
    saveBirthday,
  } = useAuth();
  const {
    orders,
    loading: ordersLoading,
    createOrder,
    updateOrderStatus,
    addJournalEntry,
    saveActionItems,
    updateOrderImage,
  } = useOrders(user?.uid);
  const {
    angelLogs,
    createAngelLog,
  } = useAngelLogs(user?.uid);
  const {
    todayEntry,
    entries,
    streak,
    saveGratitude,
  } = useGratitude(user?.uid);

  if (firebaseErrorMessage) {
    return <SetupScreen label={firebaseErrorMessage} />;
  }

  if (authLoading) {
    return <LoadingScreen label="正在初始化匿名登入..." />;
  }

  if (authError) {
    return <LoadingScreen label={`登入失敗：${authError}`} />;
  }

  if (user && !profile?.birthday) {
    return <BirthdayOnboarding onConfirm={saveBirthday} />;
  }

  const hideBottomNav = location.pathname.startsWith("/capsule/");

  return (
    <div className="cosmos-stage">
      <div className="cosmos-app-shell">
        <div className="cosmos-screen">
          <main className="cosmos-main">
            <Routes>
              <Route
                path="/"
                element={
                  <TodayPage
                    orders={orders}
                    todayEntry={todayEntry}
                    userId={user?.uid || ""}
                  />
                }
              />
              <Route
                path="/orders"
                element={
                  <OrdersPage
                    orders={orders}
                    loading={ordersLoading}
                    onCreateOrder={createOrder}
                    onUpdateStatus={updateOrderStatus}
                    onAddJournalEntry={addJournalEntry}
                    onSaveActionItems={saveActionItems}
                    onUpdateOrderImage={updateOrderImage}
                  />
                }
              />
              <Route
                path="/wall"
                element={<WallPage orders={orders} />}
              />
              <Route
                path="/capsule/:orderId"
                element={<TimeCapsulePage orders={orders} />}
              />
              <Route
                path="/angel"
                element={
                  <AngelPage
                    orders={orders}
                    angelLogs={angelLogs}
                    onCreateAngelLog={createAngelLog}
                  />
                }
              />
              <Route
                path="/gratitude"
                element={
                  <GratitudePage
                    todayEntry={todayEntry}
                    entries={entries}
                    streak={streak}
                    onSave={saveGratitude}
                  />
                }
              />
            </Routes>
          </main>
          {!hideBottomNav ? <BottomNav /> : null}
        </div>
      </div>
    </div>
  );
}
