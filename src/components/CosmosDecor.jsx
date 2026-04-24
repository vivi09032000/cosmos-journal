export const palette = {
  bg: "#f5efe6",
  bg2: "#ede4d8",
  card: "#faf6f0",
  cardDeep: "#f0e8dc",
  amber: "#b5783a",
  amberLt: "#d4954e",
  amberPale: "#e8c99a",
  terracotta: "#b05b3b",
  sage: "#7a8c6e",
  text: "#2e2318",
  textMid: "#6b5540",
  textDim: "#a08870",
  border: "rgba(181,120,58,0.2)",
  borderStrong: "rgba(181,120,58,0.5)",
  shadow: "rgba(46,35,24,0.08)",
};

export function SunRays({ size = 60, className = "", style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={{ opacity: 0.18, ...style }}
    >
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index * 30 * Math.PI) / 180;
        const x1 = 30 + 10 * Math.cos(angle);
        const y1 = 30 + 10 * Math.sin(angle);
        const x2 = 30 + 26 * Math.cos(angle);
        const y2 = 30 + 26 * Math.sin(angle);

        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={palette.amber}
            strokeWidth="0.8"
          />
        );
      })}
      <circle cx="30" cy="30" r="8" fill="none" stroke={palette.amber} strokeWidth="0.8" />
      <circle cx="30" cy="30" r="3" fill={palette.amber} opacity="0.6" />
    </svg>
  );
}

export function LeafDecor({ className = "", style }) {
  return (
    <svg
      width="80"
      height="50"
      viewBox="0 0 80 50"
      className={className}
      style={{ opacity: 0.1, ...style }}
    >
      <path d="M10,40 Q25,5 50,15 Q35,35 10,40Z" fill={palette.sage} />
      <path d="M10,40 Q30,30 50,15" stroke={palette.sage} strokeWidth="0.8" fill="none" />
      <path d="M20,38 Q32,25 50,15" stroke={palette.sage} strokeWidth="0.5" fill="none" />
      <path d="M30,35 Q38,22 50,15" stroke={palette.sage} strokeWidth="0.4" fill="none" />
      <path d="M55,20 Q70,8 72,30 Q60,38 55,20Z" fill={palette.amberPale} opacity="0.6" />
    </svg>
  );
}

export function WaveDivider({ className = "" }) {
  return (
    <svg
      width="100%"
      height="12"
      viewBox="0 0 300 12"
      preserveAspectRatio="none"
      className={className}
      style={{ opacity: 0.25 }}
    >
      <path
        d="M0,6 Q37.5,0 75,6 Q112.5,12 150,6 Q187.5,0 225,6 Q262.5,12 300,6"
        fill="none"
        stroke={palette.amber}
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function Tag({ children, color = palette.amber, className = "" }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        padding: "2px 10px",
        border: `0.5px solid ${color}`,
        borderRadius: 20,
        fontSize: 9,
        letterSpacing: 2,
        color,
        fontFamily: "var(--font-body)",
      }}
    >
      {children}
    </span>
  );
}
