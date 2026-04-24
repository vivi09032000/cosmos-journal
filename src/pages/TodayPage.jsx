import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMoonPhaseInfo } from "../angelEngine";
import {
  LeafDecor,
  SunRays,
  Tag,
  WaveDivider,
} from "../components/CosmosDecor";
import OrderCoverArt from "../components/OrderCoverArt";
import { useDailyQuestion } from "../hooks/useDailyQuestion";
import { getActionProgress } from "../lib/orderActions";
import { daysSince, getOrderTheme, orderStatusLabels } from "../lib/orderTheme";

const MOON_COPY = {
  new: {
    title: "今天適合種下新的意圖",
    description: "把注意力放回你最想實現的一件事，讓願望有一個清晰起點。",
  },
  waxCrescent: {
    title: "今天適合把願望說得更具體",
    description: "你的能量正在累積，愈清楚的畫面，愈容易被宇宙接住。",
  },
  firstQuarter: {
    title: "今天適合跨過心裡的小阻力",
    description: "有些遲疑不是退步，而是願望成形前必經的對準過程。",
  },
  waxGibbous: {
    title: "今天適合微調，靠近結果",
    description: "距離顯化高峰只差最後一段，把感受再校準一點點。",
  },
  full: {
    title: "今天適合接收與放大顯化",
    description: "滿月把情緒和意圖都照亮了，請打開雙手接住此刻的回應。",
  },
  waneGibbous: {
    title: "今天適合感謝已經開始的流動",
    description: "當你先感謝，豐盛更容易往你靠近，今天適合承認自己的進展。",
  },
  lastQuarter: {
    title: "今天適合清理舊有的卡點",
    description: "把不再適合你的念頭放下，願望才有新的空間長出來。",
  },
  waneCrescent: {
    title: "今天適合安靜蓄能",
    description: "先不用急著衝刺，休息與沉澱也是顯化的一部分。",
  },
};

const DAILY_QUESTION_BANK = [
  "此刻，你最期待發生的一件事是什麼？",
  "如果今天有一個小奇蹟，你希望它長什麼樣子？",
  "現在的你，最需要被安撫的是哪一部分？",
  "今天哪個瞬間最值得你停下來深呼吸？",
  "如果今天有一種顏色，它會是什麼？",
  "你現在最想靠近的感受，是平靜、自由還是喜悅？",
  "今天有哪件小事，已經在默默支持你？",
  "如果把今天想成一段旅程，你現在走到哪裡了？",
  "你心裡最想實現的畫面，今天有沒有更清楚一點？",
  "此刻，你身體哪個部位是完全放鬆的？",
  "你最想為今天留下一句什麼樣的註解？",
  "今天有沒有一個念頭，值得你溫柔地相信？",
  "如果宇宙正在回應你，你希望它提醒你什麼？",
  "哪一個小細節，讓你覺得今天其實很有希望？",
  "如果今天只做一件對自己好的事，那會是什麼？",
  "你今天最想感謝自己的哪一個選擇？",
  "你現在的心，比昨天更接近哪一種狀態？",
  "今天最適合你放慢的，是哪一件事？",
  "此刻的你，最值得被珍惜的是哪個感受？",
  "如果今天的風景是一張照片，主角會是什麼？",
  "你今天最不想辜負的是哪一個願望？",
  "什麼樣的畫面，能讓你馬上想起未來的自己？",
  "今天有沒有一個訊號，在提醒你繼續相信？",
  "如果把今天說成一句短短的咒語，會是什麼？",
  "你今天最渴望被看見的是哪一面？",
  "有哪件事正在變好，只是你還沒完全發現？",
  "如果今天是一封信，你希望宇宙在最後寫什麼？",
  "今天最適合你靠近的，是哪種生活感？",
  "你現在最想把注意力放回哪一件重要的事？",
  "什麼樣的回答，會讓今天的你感到更安心？",
];

function formatToday() {
  return new Date().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 44 44" className="h-12 w-12 shrink-0">
      <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(181,120,58,0.2)" strokeWidth="0.5" />
      <path d="M22 6A16 16 0 0 1 22 38A10 16 0 0 1 22 6" fill="#e8c99a" opacity="0.6" />
      <circle cx="22" cy="22" r="14" fill="none" stroke="#b5783a" strokeWidth="0.5" />
      <circle cx="16" cy="18" r="1.5" fill="#b5783a" opacity="0.4" />
      <circle cx="26" cy="26" r="1" fill="#b5783a" opacity="0.3" />
      <line x1="8" y1="22" x2="36" y2="22" stroke="rgba(181,120,58,0.15)" strokeWidth="0.5" />
    </svg>
  );
}

function getMoonRhythm(moonAge) {
  const roundedAge = Math.round(moonAge);
  const daysUntilFull = Math.max(0, Math.round(14.77 - moonAge));
  const daysUntilNew = moonAge <= 14.77
    ? Math.round(29.53 - moonAge)
    : Math.round(29.53 - moonAge);

  return {
    ageLabel: `月齡 ${moonAge.toFixed(1)}`,
    rhythmLabel: moonAge <= 14.77 ? `距滿月 ${daysUntilFull} 天` : `距新月 ${Math.max(0, daysUntilNew)} 天`,
    shortLabel: `Day ${roundedAge + 1}`,
  };
}

function getDailyQuestion(date = new Date()) {
  const start = new Date("2026-01-01T00:00:00");
  const diffDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % DAILY_QUESTION_BANK.length) + DAILY_QUESTION_BANK.length) % DAILY_QUESTION_BANK.length;
  return DAILY_QUESTION_BANK[index];
}

export default function TodayPage({
  orders,
  todayEntry,
  userId,
}) {
  const navigate = useNavigate();
  const moonPhase = useMemo(() => getMoonPhaseInfo(new Date()), []);
  const moonCopy = MOON_COPY[moonPhase.phase] || MOON_COPY.new;
  const moonRhythm = useMemo(() => getMoonRhythm(moonPhase.moonAge), [moonPhase.moonAge]);
  const featuredOrder = useMemo(
    () => orders.find((order) => order.status !== "delivered") || orders[0] || null,
    [orders],
  );
  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === "delivered").length,
    [orders],
  );
  const featuredTheme = featuredOrder ? getOrderTheme(featuredOrder) : null;
  const gratitudeItems = [todayEntry?.item1, todayEntry?.item2, todayEntry?.item3].filter(Boolean);
  const dailyQuestion = useMemo(() => getDailyQuestion(new Date()), []);
  const { entry: dailyQuestionEntry, saveAnswer: saveDailyQuestionAnswer } = useDailyQuestion(userId);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [questionSaving, setQuestionSaving] = useState(false);

  useEffect(() => {
    setQuestionAnswer(dailyQuestionEntry?.answer || "");
    setShowQuestionForm(false);
  }, [dailyQuestionEntry]);

  const handleSaveDailyQuestion = async () => {
    if (!questionAnswer.trim()) return;

    setQuestionSaving(true);
    await saveDailyQuestionAnswer({
      prompt: dailyQuestion,
      answer: questionAnswer.trim(),
    });
    setQuestionSaving(false);
    setShowQuestionForm(false);
  };

  return (
    <div className="space-y-5">
      <section className="screen-header">
        <SunRays size={78} className="absolute -right-3 -top-4" />
        <div>
          <p className="gold-kicker">Cosmos Journal</p>
          <h1 className="section-title mt-2 text-[2rem] leading-[1.28]">
            今天宇宙說什麼？
          </h1>
          <p className="mt-2 text-[0.68rem] tracking-[0.22em] text-[color:var(--ink-faint)]">{formatToday()}</p>
        </div>
        <WaveDivider className="wave-divider" />
      </section>

      <section className="relative overflow-hidden rounded-[1.55rem] bg-[linear-gradient(145deg,rgba(44,58,80,0.98),rgba(35,48,69,0.98))] px-5 py-5 text-[#f6ead1] shadow-[0_18px_40px_rgba(31,41,72,0.18)]">
        <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at 12% 24%, rgba(255,245,220,0.22) 0 1px, transparent 1.4px), radial-gradient(circle at 32% 18%, rgba(255,245,220,0.18) 0 1px, transparent 1.5px), radial-gradient(circle at 78% 22%, rgba(255,245,220,0.22) 0 1px, transparent 1.4px), radial-gradient(circle at 90% 10%, rgba(255,245,220,0.18) 0 1px, transparent 1.5px)" }} />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(181,120,58,0.28)] bg-[rgba(255,245,220,0.05)]">
            <MoonIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.58rem] tracking-[0.3em] text-[#d8c5a1]">今日月相</p>
            <p className="mt-2 font-[var(--font-display)] text-[2rem] leading-none text-[#fff3dd]">
              {moonPhase.label}
            </p>
            <p className="mt-2 text-[0.88rem] leading-7 text-[#ecdcbf]">
              {moonCopy.title}
            </p>
            <p className="mt-1 text-[0.82rem] leading-6 text-[#cdb995]">
              {moonCopy.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-[var(--font-display)] text-[2.25rem] leading-none text-[color:var(--gold-soft)]">
              {moonRhythm.shortLabel.replace("Day ", "")}
            </p>
            <p className="mt-2 text-[0.62rem] tracking-[0.18em] text-[#caa97b]">
              {moonRhythm.shortLabel}
            </p>
            <p className="mt-1 text-[0.62rem] tracking-[0.16em] text-[#b99a71]">
              {moonRhythm.rhythmLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="paper-card overflow-hidden px-0 py-0">
        <div className="flex items-center justify-between gap-3">
          <div className="sr-only">今日投射</div>
        </div>
        {featuredOrder ? (
          <>
            <div
              className="relative h-32 overflow-hidden"
              style={{ background: featuredTheme?.background }}
            >
              <OrderCoverArt order={featuredOrder} />
              <div className="absolute inset-0 opacity-80" style={{ backgroundImage: "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.35) 0 1px, transparent 1.4px), radial-gradient(circle at 68% 10%, rgba(255,255,255,0.3) 0 1px, transparent 1.5px), radial-gradient(circle at 85% 24%, rgba(255,255,255,0.45) 0 1px, transparent 1.5px), radial-gradient(circle at 38% 34%, rgba(255,255,255,0.28) 0 0.8px, transparent 1.4px), radial-gradient(circle at 72% 41%, rgba(255,255,255,0.34) 0 1.2px, transparent 1.6px)" }} />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,rgba(245,239,230,0),rgba(245,239,230,0.98))]" />
              <span className="absolute left-4 top-3 text-[0.58rem] tracking-[0.16em] text-[rgba(255,247,230,0.72)]">
                第 {daysSince(featuredOrder.createdAt)} 天
              </span>
              <span className="absolute right-4 top-3 rounded-full border border-[rgba(181,120,58,0.4)] bg-[rgba(245,239,230,0.88)] px-3 py-1 text-[0.58rem] tracking-[0.2em] text-[color:var(--gold)]">
                今日投射
              </span>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-2">
                <Tag>{featuredOrder.angelNumber ? `#${featuredOrder.angelNumber}` : "Manifest"}</Tag>
                <span className="text-[0.58rem] tracking-[0.2em] text-[color:var(--ink-faint)]">
                  {orderStatusLabels[featuredOrder.status]}
                </span>
              </div>
              <h2 className="mt-3 font-[var(--font-display)] text-[1.55rem] leading-[1.25] text-[color:var(--ink)]">
                {featuredOrder.title}
              </h2>
              {featuredOrder.subtitle ? (
                <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)] italic">
                  {featuredOrder.subtitle}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-7 text-[color:var(--ink-faint)]">
                {moonPhase.label}的能量正在推著這張訂單往前，很適合今天再投射一次。
              </p>
              <div className="mt-4 h-[2px] rounded-full bg-[rgba(181,120,58,0.15)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(to_right,var(--gold-soft),var(--gold))]"
                  style={{ width: `${getActionProgress(featuredOrder)}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate("/orders", {
                  state: { selectedOrderId: featuredOrder.id },
                })
              }
              className="primary-button mx-5 mb-5 w-[calc(100%-2.5rem)]"
            >
              ✦ 今日投射
            </button>
          </>
        ) : (
          <>
            <div className="px-5 py-5">
              <Tag>今日投射</Tag>
              <h2 className="mt-3 font-[var(--font-display)] text-[1.7rem] leading-[1.35] text-[color:var(--ink)]">
                今天還沒有可以推進的訂單
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                建立一張新的顯化訂單，讓宇宙知道你此刻最想實現的是什麼。
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="primary-button mx-5 mb-5 w-[calc(100%-2.5rem)]"
            >
              前往訂單
            </button>
          </>
        )}
      </section>

      <button
        type="button"
        onClick={() => navigate("/wall")}
        className="paper-card-soft flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
      >
        <p className="font-[var(--font-display)] text-[1.45rem] text-[color:var(--navy-deep)]">
          你已實現了 {deliveredCount} 個願望
        </p>
        <span className="text-[0.78rem] tracking-[0.14em] text-[color:var(--gold)]">
          前往戰績牆 →
        </span>
      </button>

      <section className="grid grid-cols-2 gap-4">
        <section className="paper-card px-5 py-5">
          <p className="section-label">今日一問</p>
          {!showQuestionForm && !dailyQuestionEntry?.answer ? (
            <>
              <p className="mt-4 font-[var(--font-display)] text-[1.7rem] leading-[1.55] text-[color:var(--ink)]">
                {dailyQuestion}
              </p>
              <button
                type="button"
                onClick={() => setShowQuestionForm(true)}
                className="mt-5 text-[0.88rem] tracking-[0.12em] text-[color:var(--gold)]"
              >
                寫下回答 →
              </button>
            </>
          ) : (
            <>
              <p className="mt-4 font-[var(--font-display)] text-[1.45rem] leading-[1.55] text-[color:var(--ink)]">
                {dailyQuestion}
              </p>
              {showQuestionForm ? (
                <div className="mt-4">
                  <textarea
                    value={questionAnswer}
                    onChange={(event) => setQuestionAnswer(event.target.value)}
                    rows={4}
                    className="cosmos-textarea"
                    placeholder="寫下你此刻的回答..."
                  />
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuestionForm(false);
                        setQuestionAnswer(dailyQuestionEntry?.answer || "");
                      }}
                      className="secondary-button flex-1"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDailyQuestion}
                      disabled={!questionAnswer.trim() || questionSaving}
                      className="primary-button flex-1"
                    >
                      {questionSaving ? "儲存中..." : "存下回答"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-sm italic leading-7 text-[color:var(--ink-soft)]">
                    {dailyQuestionEntry?.answer}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowQuestionForm(true)}
                    className="mt-5 text-[0.88rem] tracking-[0.12em] text-[color:var(--gold)]"
                  >
                    重新編輯 →
                  </button>
                </>
              )}
            </>
          )}
        </section>

        <section className="paper-card relative px-5 py-5">
          <LeafDecor className="absolute bottom-0 right-0" />
          {todayEntry ? (
            <>
              <p className="section-label">今日感恩</p>
              <h2 className="mt-4 font-[var(--font-display)] text-[1.7rem] leading-[1.35] text-[color:var(--ink)]">
                ✓ 已記錄
              </h2>
              <div className="mt-4 space-y-2">
                {gratitudeItems.map((item, index) => (
                  <p key={`${item}-${index}`} className="text-[1.02rem] italic leading-[1.85] text-[color:var(--ink-soft)]">
                    「{item}」
                  </p>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="section-label">今日感恩</p>
              <h2 className="mt-4 font-[var(--font-display)] text-[1.55rem] leading-[1.45] text-[color:var(--ink)]">
                今天還沒記錄
              </h2>
              <button
                type="button"
                onClick={() => navigate("/gratitude")}
                className="mt-5 text-[0.88rem] tracking-[0.12em] text-[color:var(--gold)]"
              >
                前往感恩 →
              </button>
            </>
          )}
        </section>
      </section>
    </div>
  );
}
