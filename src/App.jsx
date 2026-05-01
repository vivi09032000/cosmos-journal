import { lazy, Suspense, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import SideDrawer from "./components/SideDrawer";
import { useAngelLogs } from "./hooks/useAngelLogs";
import { useAllDailyLogs } from "./hooks/useAllDailyLogs";
import { useAuth } from "./hooks/useAuth";
import { useCheckinStreak } from "./hooks/useCheckinStreak";
import { useDailyLog } from "./hooks/useDailyLog";
import { useGratitude } from "./hooks/useGratitude";
import { useOrders } from "./hooks/useOrders";
import { firebaseErrorMessage, missingFirebaseKeys } from "./firebase";
import { I18nProvider, useI18n } from "./lib/i18n";

const AngelPage = lazy(() => import("./pages/AngelPage"));
const GratitudePage = lazy(() => import("./pages/GratitudePage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TimeCapsulePage = lazy(() => import("./pages/TimeCapsulePage"));
const TodayPage = lazy(() => import("./pages/TodayPage"));
const WallPage = lazy(() => import("./pages/WallPage"));

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

function LanguageSwitch({ className = "" }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[rgba(181,120,58,0.22)] bg-[rgba(250,246,240,0.94)] p-1 shadow-[0_10px_24px_rgba(46,35,24,0.08)] ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale("zh-TW")}
        className={`rounded-full px-3 py-1.5 text-[0.72rem] tracking-[0.14em] transition ${
          locale === "zh-TW"
            ? "bg-[rgba(181,120,58,0.14)] text-[color:var(--gold)]"
            : "text-[color:var(--ink-faint)]"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1.5 text-[0.72rem] tracking-[0.14em] transition ${
          locale === "en"
            ? "bg-[rgba(181,120,58,0.14)] text-[color:var(--gold)]"
            : "text-[color:var(--ink-faint)]"
        }`}
      >
        EN
      </button>
    </div>
  );
}

function LoadingScreen({ label }) {
  const { locale } = useI18n();

  return (
    <div className="cosmos-stage flex items-center justify-center">
      <div className="paper-card max-w-sm px-6 py-8 text-center">
        <LanguageSwitch className="mx-auto mb-5" />
        <p className="gold-kicker">Cosmos Journal</p>
        <h1 className="section-title mt-3 text-[1.8rem]">
          {locale === "en" ? "Preparing your journal" : "宇宙正在整理你的頁面"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{label}</p>
      </div>
    </div>
  );
}

function SetupScreen({ label }) {
  const { locale } = useI18n();

  return (
    <div className="cosmos-stage flex items-center justify-center">
      <div className="paper-card max-w-lg px-6 py-8">
        <div className="flex justify-end">
          <LanguageSwitch />
        </div>
        <p className="gold-kicker">Firebase Setup</p>
        <h1 className="section-title mt-3 text-[1.8rem]">
          {locale === "en"
            ? "The app is blocked by missing initialization, not a blank screen."
            : "目前不是白屏，是初始化被設定擋住了。"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{label}</p>
        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
          {locale === "en"
            ? "Create a `.env` file in the project root, fill in the Firebase values from `.env.example`, then refresh."
            : "請在專案根目錄建立 `.env`，並把 `.env.example` 裡的欄位填上 Firebase 專案參數後重新整理。"}
        </p>
        <p className="mt-3 text-xs tracking-[0.2em] text-[color:var(--ink-faint)]">
          {locale === "en" ? "Path" : "檔案位置"}：/Users/heyvienne/Documents/宇宙手帳/.env
        </p>
      </div>
    </div>
  );
}

function BirthdayOnboarding({ onConfirm }) {
  const { locale } = useI18n();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dayOptions = Array.from(
    { length: getDaysInMonth(Number(year), Number(month)) },
    (_, index) => index + 1,
  );

  const copy = locale === "en"
    ? {
      title: "The universe needs your birthday to calculate today's energy",
      year: "Year",
      month: "Month",
      day: "Day",
      submit: "Confirm",
      saving: "Saving...",
      missing: "Please choose your birthday first.",
      failed: "Saving your birthday failed. Please try again.",
    }
    : {
      title: "宇宙需要知道你的生日，才能為你計算今日能量",
      year: "年份",
      month: "月份",
      day: "日期",
      submit: "確認",
      saving: "確認中...",
      missing: "請先選擇生日。",
      failed: "生日儲存失敗，請再試一次。",
    };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!year || !month || !day) {
      setError(copy.missing);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const birthday = `${year}-${padDateUnit(month)}-${padDateUnit(day)}`;
      await onConfirm(birthday);
    } catch (saveError) {
      setError(saveError.message || copy.failed);
      setSaving(false);
    }
  };

  return (
    <div className="cosmos-stage flex items-center justify-center">
      <form onSubmit={handleSubmit} className="paper-card w-full max-w-lg px-6 py-8">
        <div className="flex justify-end">
          <LanguageSwitch />
        </div>
        <p className="gold-kicker">Birthday Onboarding</p>
        <h1 className="section-title mt-3 text-[1.8rem] leading-[1.35]">
          {copy.title}
        </h1>
        <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
          <select
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setError("");
            }}
            className="cosmos-select"
            required
          >
            <option value="">{copy.year}</option>
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
            <option value="">{copy.month}</option>
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
            <option value="">{copy.day}</option>
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
          {saving ? copy.saving : copy.submit}
        </button>
      </form>
    </div>
  );
}

function AppContent() {
  const { locale } = useI18n();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    user,
    profile,
    loading: authLoading,
    error: authError,
    saveBirthday,
    saveProfileIdentity,
  } = useAuth(locale);
  const {
    orders,
    loading: ordersLoading,
    createOrder,
    updateOrderStatus,
    addJournalEntry,
    saveActionItems,
    updateOrderImage,
  } = useOrders(user?.uid, locale);
  const {
    angelLogs,
    createAngelLog,
  } = useAngelLogs(user?.uid);
  const {
    todayEntry,
    entries: gratitudeEntries,
    streak,
    saveGratitude,
  } = useGratitude(user?.uid);
  const {
    entry: dailyLogEntry,
    saveMood: saveDailyMood,
    saveQuestionAnswer: saveDailyQuestionAnswer,
    saveNumberSignal: saveDailyNumberSignal,
  } = useDailyLog(user?.uid);
  const {
    entries: allDailyLogs,
  } = useAllDailyLogs(user?.uid);

  const checkinStreak = useCheckinStreak(allDailyLogs, gratitudeEntries, orders);

  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === "delivered").length,
    [orders],
  );

  const firebaseLabel = missingFirebaseKeys.length > 0
    ? (locale === "en"
      ? `Missing Firebase configuration: ${missingFirebaseKeys.join(", ")}`
      : firebaseErrorMessage)
    : "";

  if (firebaseLabel) {
    return <SetupScreen label={firebaseLabel} />;
  }

  if (authLoading) {
    return <LoadingScreen label={locale === "en" ? "Initializing anonymous sign-in..." : "正在初始化匿名登入..."} />;
  }

  if (authError) {
    return <LoadingScreen label={`${locale === "en" ? "Sign-in failed" : "登入失敗"}：${authError}`} />;
  }

  if (user && !profile?.birthday) {
    return <BirthdayOnboarding onConfirm={saveBirthday} />;
  }

  const hideBottomNav = location.pathname.startsWith("/capsule/");
  const routeLoadingLabel = locale === "en" ? "Opening page..." : "正在打開頁面...";

  return (
    <div className="cosmos-stage">
      <div className="cosmos-app-shell relative">
        {!hideBottomNav ? (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(181,120,58,0.18)] bg-[rgba(250,246,240,0.9)] shadow-[0_4px_12px_rgba(46,35,24,0.08)] transition hover:bg-[rgba(250,246,240,1)]"
            aria-label="Menu"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
        ) : null}
        <div className="cosmos-screen">
          <main className="cosmos-main pb-24">
            <Suspense
              fallback={
                <section className="paper-card px-5 py-6 text-sm leading-7 text-[color:var(--ink-soft)]">
                  {routeLoadingLabel}
                </section>
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <TodayPage
                      orders={orders}
                      todayEntry={todayEntry}
                      dailyLogEntry={dailyLogEntry}
                      onSaveDailyMood={saveDailyMood}
                      onSaveQuestionAnswer={saveDailyQuestionAnswer}
                      onCreateAngelLog={createAngelLog}
                      onSaveNumberSignal={saveDailyNumberSignal}
                      userId={user?.uid || ""}
                    />
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <OrdersPage
                      orders={orders}
                      angelLogs={angelLogs}
                      loading={ordersLoading}
                      onCreateOrder={createOrder}
                      onUpdateStatus={updateOrderStatus}
                      onAddJournalEntry={addJournalEntry}
                      onSaveActionItems={saveActionItems}
                      onUpdateOrderImage={updateOrderImage}
                    />
                  }
                />
                <Route path="/wall" element={<WallPage orders={orders} />} />
                <Route path="/capsule/:orderId" element={<TimeCapsulePage orders={orders} />} />
                <Route
                  path="/journal"
                  element={
                    <JournalPage
                      allDailyLogs={allDailyLogs}
                      gratitudeEntries={gratitudeEntries}
                      orders={orders}
                      angelLogs={angelLogs}
                      dailyLogEntry={dailyLogEntry}
                      onSaveQuestionAnswer={saveDailyQuestionAnswer}
                      onCreateAngelLog={createAngelLog}
                      onSaveNumberSignal={saveDailyNumberSignal}
                    />
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProfilePage
                      profile={profile}
                      orders={orders}
                      allDailyLogs={allDailyLogs}
                      angelLogs={angelLogs}
                      checkinStreak={checkinStreak}
                    />
                  }
                />
                {/* Keep legacy routes for bookmarks */}
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
                      entries={gratitudeEntries}
                      streak={streak}
                      onSave={saveGratitude}
                    />
                  }
                />
              </Routes>
            </Suspense>
          </main>
          {!hideBottomNav ? <BottomNav /> : null}
        </div>
        <SideDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          profile={profile}
          onSaveProfileIdentity={saveProfileIdentity}
          checkinStreak={checkinStreak}
          deliveredCount={deliveredCount}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
