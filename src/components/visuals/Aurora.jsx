export default function Aurora({
  active = "home",
  cursor = { x: 0, y: 0 },
  reducedMotion = false,
}) {
  const palettes = {
    home: ["#22d3ee", "#6366f1", "#a855f7", "#f472b6"],
    about: ["#34d399", "#22d3ee", "#60a5fa", "#a78bfa"],
    projects: ["#f59e0b", "#fb7185", "#a855f7", "#22d3ee"],
    skills: ["#60a5fa", "#22d3ee", "#34d399", "#84cc16"],
    contact: ["#a78bfa", "#22d3ee", "#60a5fa", "#f472b6"],
  };
  const cols = palettes[active] || palettes.home;

  const baseStyle = {
    position: "absolute",
    width: "120vmax",
    height: "60vmax",
    filter: "blur(40px) saturate(130%)",
    mixBlendMode: "screen",
    opacity: 0.6,
    transform: "skewX(-10deg)",
    backgroundImage: `linear-gradient(90deg, ${cols.join(", ")})`,
    backgroundSize: "200% 100%",
    borderRadius: "9999px",
  };

  return (
    <div className="pointer-events-none fixed inset-0 -z-[9] overflow-hidden" aria-hidden>
      <div style={{ position: "absolute", inset: 0 }}>
        <span
          style={{
            ...baseStyle,
            top: "-10%",
            left: "-10%",
            animation: reducedMotion
              ? undefined
              : "aurora-pan 22s ease-in-out infinite alternate, aurora-hue 60s linear infinite",
          }}
        />
        <span
          style={{
            ...baseStyle,
            top: "20%",
            right: "-15%",
            height: "70vmax",
            opacity: 0.5,
            animation: reducedMotion
              ? undefined
              : "aurora-pan 28s ease-in-out -6s infinite alternate, aurora-sway 16s ease-in-out infinite alternate, aurora-hue 80s linear infinite",
          }}
        />
        <span
          style={{
            ...baseStyle,
            bottom: "-15%",
            left: "-5%",
            width: "140vmax",
            height: "50vmax",
            opacity: 0.45,
            animation: reducedMotion
              ? undefined
              : "aurora-pan 30s ease-in-out -12s infinite alternate, aurora-hue 100s linear infinite",
          }}
        />
        {/* cursor ripple */}
        <span
          style={{
            position: "absolute",
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            width: 380,
            height: 380,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            background: `radial-gradient(closest-side, ${cols[0]}66, transparent 70%)`,
            filter: "blur(20px)",
            mixBlendMode: "screen",
            animation: reducedMotion ? undefined : "ripple-glow 1.2s ease-out infinite",
          }}
        />
      </div>
    </div>
  );
}
