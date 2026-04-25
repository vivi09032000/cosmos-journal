import { useEffect, useState } from "react";
import { detectOrderQuestionTheme } from "../lib/orderQuestions";

const loadedImageUrls = new Set();

function Illustration({ category }) {
  if (category === "travel") {
    return (
      <svg viewBox="0 0 320 128" className="absolute inset-0 h-full w-full">
        <circle cx="252" cy="28" r="18" fill="rgba(255,245,220,0.22)" />
        <path d="M0 110L72 48L126 104L178 36L240 108L320 60V128H0Z" fill="rgba(255,255,255,0.16)" />
        <path d="M0 118L54 70L104 114L160 52L224 120L320 84V128H0Z" fill="rgba(255,255,255,0.24)" />
        <path d="M74 78L86 62L98 78" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  if (category === "career") {
    return (
      <svg viewBox="0 0 320 128" className="absolute inset-0 h-full w-full">
        <rect x="36" y="72" width="70" height="40" rx="6" fill="rgba(255,255,255,0.12)" />
        <rect x="122" y="54" width="86" height="58" rx="6" fill="rgba(255,255,255,0.14)" />
        <rect x="222" y="66" width="60" height="46" rx="6" fill="rgba(255,255,255,0.12)" />
        <rect x="140" y="28" width="52" height="18" rx="4" fill="rgba(255,245,220,0.2)" />
        <path d="M0 112H320" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      </svg>
    );
  }

  if (category === "home") {
    return (
      <svg viewBox="0 0 320 128" className="absolute inset-0 h-full w-full">
        <path d="M72 116V64L160 28L248 64V116" fill="rgba(255,255,255,0.12)" />
        <path d="M60 68L160 18L260 68" stroke="rgba(255,255,255,0.28)" strokeWidth="3" fill="none" />
        <rect x="146" y="72" width="28" height="44" fill="rgba(255,245,220,0.18)" />
        <rect x="96" y="74" width="26" height="22" fill="rgba(255,245,220,0.12)" />
        <rect x="198" y="74" width="26" height="22" fill="rgba(255,245,220,0.12)" />
      </svg>
    );
  }

  if (category === "relationship") {
    return (
      <svg viewBox="0 0 320 128" className="absolute inset-0 h-full w-full">
        <circle cx="126" cy="56" r="24" fill="rgba(255,255,255,0.14)" />
        <circle cx="194" cy="56" r="24" fill="rgba(255,255,255,0.14)" />
        <path d="M160 92C138 74 118 62 118 46a14 14 0 0 1 28 0a14 14 0 0 1 28 0c0 16-20 28-42 46Z" fill="rgba(255,245,220,0.22)" />
        <path d="M0 112H320" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      </svg>
    );
  }

  if (category === "wealth") {
    return (
      <svg viewBox="0 0 320 128" className="absolute inset-0 h-full w-full">
        <circle cx="104" cy="72" r="20" fill="rgba(255,245,220,0.18)" />
        <circle cx="154" cy="62" r="24" fill="rgba(255,245,220,0.22)" />
        <circle cx="212" cy="78" r="18" fill="rgba(255,245,220,0.16)" />
        <path d="M74 104H236" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
        <path d="M104 52V92M154 38V86M212 60V96" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      </svg>
    );
  }

  if (category === "health") {
    return (
      <svg viewBox="0 0 320 128" className="absolute inset-0 h-full w-full">
        <circle cx="242" cy="32" r="16" fill="rgba(255,245,220,0.2)" />
        <path d="M0 96C44 80 84 74 118 82C160 92 188 92 222 80C252 70 286 72 320 88V128H0Z" fill="rgba(255,255,255,0.14)" />
        <path d="M118 76C126 58 136 48 150 48C164 48 174 58 182 76" stroke="rgba(255,255,255,0.32)" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 128" className="absolute inset-0 h-full w-full">
      <circle cx="250" cy="28" r="18" fill="rgba(255,245,220,0.18)" />
      <path d="M0 108C40 84 82 80 124 92C154 100 186 100 214 90C248 78 284 76 320 90V128H0Z" fill="rgba(255,255,255,0.14)" />
      <path d="M42 42L48 48L54 42M92 30L98 36L104 30M144 44L150 50L156 44" stroke="rgba(255,255,255,0.32)" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

export default function OrderCoverArt({
  order,
  imageClassName = "h-full w-full object-cover",
  loading = "lazy",
  fetchPriority = "auto",
  sizes = "100vw",
}) {
  const category = detectOrderQuestionTheme(order);
  const [status, setStatus] = useState(() => {
    if (!order.imageUrl) return "idle";
    return loadedImageUrls.has(order.imageUrl) ? "loaded" : "loading";
  });

  useEffect(() => {
    if (!order.imageUrl) {
      setStatus("idle");
      return;
    }

    setStatus(loadedImageUrls.has(order.imageUrl) ? "loaded" : "loading");
  }, [order.imageUrl]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {order.imageUrl && status === "loading" ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(245,239,230,0.96),rgba(237,228,216,0.94))]" />
      ) : null}

      {order.imageUrl && status !== "error" ? (
        <img
          src={order.imageUrl}
          alt={order.title || "manifest cover"}
          className={`${imageClassName} absolute inset-0 transition-opacity duration-150 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          sizes={sizes}
          onLoad={() => {
            loadedImageUrls.add(order.imageUrl);
            setStatus("loaded");
          }}
          onError={() => setStatus("error")}
        />
      ) : null}

      {!order.imageUrl || status === "error" ? <Illustration category={category} /> : null}
    </div>
  );
}
