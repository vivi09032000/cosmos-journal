import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "今日", icon: "sun" },
  { to: "/orders", label: "訂單", icon: "box" },
  { to: "/angel", label: "天使", icon: "wings" },
  { to: "/gratitude", label: "感恩", icon: "heart" },
];

function Icon({ name, active }) {
  const className = active ? "stroke-[#c79d61]" : "stroke-[#78684f]";
  const common = {
    className,
    fill: "none",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "sun":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle cx="12" cy="12" r="4" {...common} />
          <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" {...common} />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="m4.5 7.5 7.5-4 7.5 4-7.5 4-7.5-4Z" {...common} />
          <path d="M4.5 7.5V16.5L12 20.5L19.5 16.5V7.5" {...common} />
          <path d="M12 11.5V20.5" {...common} />
        </svg>
      );
    case "wings":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M12 18c-1.8-3.2-4.8-4.8-7.5-4.8 1.2-2.8 3.7-4.5 6.7-4.5-.4 1.8-.1 3.8.8 5.5Z" {...common} />
          <path d="M12 18c1.8-3.2 4.8-4.8 7.5-4.8-1.2-2.8-3.7-4.5-6.7-4.5.4 1.8.1 3.8-.8 5.5Z" {...common} />
          <path d="M12 7.4V4.5" {...common} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="m12 20-1.4-1.2C5.2 14 2 11.1 2 7.5A4.5 4.5 0 0 1 6.5 3c2 0 3.2 1 4 2.1C11.3 4 12.5 3 14.5 3A4.5 4.5 0 0 1 19 7.5c0 3.6-3.2 6.5-8.6 11.3L12 20Z" {...common} />
        </svg>
      );
  }
}

export default function BottomNav() {
  return (
    <nav className="bottom-nav-shell">
      <div className="grid grid-cols-4 px-2 py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) => `flex flex-col items-center gap-1 rounded-2xl py-2 text-[0.6rem] ${isActive ? "text-[color:var(--gold)]" : "text-[color:var(--ink-faint)]"}`}
          >
            {({ isActive }) => (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-full">
                  <Icon name={tab.icon} active={isActive} />
                </div>
                <span className="tracking-[0.18em]">{tab.label}</span>
                {isActive ? (
                  <span className="mt-0.5 h-px w-4 rounded-full bg-[color:var(--gold)]" />
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
