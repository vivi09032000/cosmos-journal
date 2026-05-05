import { NavLink } from "react-router-dom";
import { useI18n } from "../lib/i18n";

const tabs = [
  {
    to: "/",
    icon: "sun",
    labels: { "zh-TW": "今日", en: "Today" },
  },
  {
    to: "/orders",
    icon: "box",
    labels: { "zh-TW": "目標", en: "Goals" },
  },
  {
    to: "/angel",
    icon: "angel",
    labels: { "zh-TW": "天使", en: "Angel" },
  },
  {
    to: "/gratitude",
    icon: "heart",
    labels: { "zh-TW": "感恩", en: "Gratitude" },
  },
];

function Icon({ name, active }) {
  const className = active ? "stroke-[#c79d61]" : "stroke-[#78684f]";
  const common = {
    className,
    fill: "none",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "sun":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="4" {...common} />
          <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" {...common} />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="m4.5 7.5 7.5-4 7.5 4-7.5 4-7.5-4Z" {...common} />
          <path d="M4.5 7.5V16.5L12 20.5L19.5 16.5V7.5" {...common} />
          <path d="M12 11.5V20.5" {...common} />
        </svg>
      );
    case "journal":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...common} />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...common} />
          <path d="M8 7h8M8 11h6" {...common} />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M19.5 5.2c-1.9-1.9-5-1.6-6.6.6L12 7l-.9-1.2C9.5 3.6 6.4 3.3 4.5 5.2c-2 2-1.9 5.2.2 7.4L12 20l7.3-7.4c2.1-2.2 2.2-5.4.2-7.4Z" {...common} />
        </svg>
      );
    case "angel":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" {...common} />
          <path d="M5 17l.8 2.4 2.4.8-2.4.8L5 23l-.8-2.4L1.8 19.8l2.4-.8L5 17z" {...common} />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="8" r="4" {...common} />
          <path d="M5.5 21c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" {...common} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="8" {...common} />
        </svg>
      );
  }
}

export default function BottomNav() {
  const { locale } = useI18n();

  return (
    <nav className="bottom-nav-shell" aria-label={locale === "en" ? "Main navigation" : "主要導覽"}>
      <div className="grid grid-cols-4 px-2 py-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) => `flex flex-col items-center gap-1 rounded-2xl py-3 text-[0.68rem] font-medium tracking-[0.04em] [font-family:var(--font-ui)] ${isActive ? "text-[color:var(--gold)]" : "text-[color:var(--ink-faint)]"}`}
          >
            {({ isActive }) => (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-full">
                  <Icon name={tab.icon} active={isActive} />
                </div>
                <span className="tracking-[0.18em]">{tab.labels[locale] || tab.labels["zh-TW"]}</span>
                {isActive ? (
                  <span className="mt-0.5 h-px w-4 rounded-full bg-[color:var(--gold)]" aria-hidden="true" />
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

