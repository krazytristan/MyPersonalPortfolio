export default function Aurora({
  active = "home",
  cursor = { x: 0, y: 0 },
  reducedMotion = false,

  // quick knobs
  blur = 40,            // px
  opacity = 0.62,       // 0..1
  speed = 1,            // 0.5 = slower, 2 = faster
  ripple = true,        // show cursor glow
}) {
  const palettes = {
    home: ["#22d3ee", "#6366f1", "#a855f7", "#f472b6"],
    about: ["#34d399", "#22d3ee", "#60a5fa", "#a78bfa"],
    projects: ["#f59e0b", "#fb7185", "#a855f7", "#22d3ee"],
    skills: ["#60a5fa", "#22d3ee", "#34d399", "#84cc16"],
    contact: ["#a78bfa", "#22d3ee", "#60a5fa", "#f472b6"],
  };
  const cols = palettes[active] || palettes.home;

  // base style shared by ribbons
  const baseStyle = {
    position: "absolute",
    width: "120vmax",
    height: "60vmax",
    filter: `blur(${blur}px) saturate(130%)`,
    mixBlendMode: "screen",
    opacity,
    transform: "skewX(-10deg) translateZ(0)",
    backgroundImage: `linear-gradient(90deg, ${cols.join(", ")})`,
    backgroundSize: "200% 100%",
    borderRadius: "9999px",
    willChange: "transform, background-position, filter, opacity",
    WebkitMaskImage:
      "radial-gradient(100% 70% at 50% 50%, #000 60%, transparent 100%)",
            maskImage:
      "radial-gradient(100% 70% at 50% 50%, #000 60%, transparent 100%)",
  };

  // simple parallax using the cursor you already pass in
  // normalize 0..1 relative to viewport (guard SSR)
  const vw = typeof window !== "undefined" ? window.innerWidth : 1;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1;
  const nx = vw ? (cursor.x / vw - 0.5) : 0;
  const ny = vh ? (cursor.y / vh - 0.5) : 0;

  const m = reducedMotion ? 0 : 1; // motion multiplier

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-[9] overflow-hidden"
      aria-hidden
      style={{
        // timing vars the CSS keyframes read
        ["--spd"]: String(speed),
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        {/* ribbon A */}
        <span
          style={{
            ...baseStyle,
            top: "-12%",
            left: "-10%",
            transform: `skewX(-10deg) translate3d(${nx * 20 * m}px, ${ny * 10 * m}px, 0)`,
            animation: reducedMotion
              ? "none"
              : "aurora-pan calc(22s/var(--spd)) ease-in-out infinite alternate, aurora-hue calc(60s/var(--spd)) linear infinite",
          }}
        />
        {/* ribbon B (deeper, larger) */}
        <span
          style={{
            ...baseStyle,
            top: "22%",
            right: "-15%",
            height: "70vmax",
            opacity: opacity * 0.5,
            transform: `skewX(-10deg) translate3d(${nx * -30 * m}px, ${ny * 18 * m}px, 0)`,
            animation: reducedMotion
              ? "none"
              : "aurora-pan calc(28s/var(--spd)) ease-in-out -6s infinite alternate, aurora-sway calc(16s/var(--spd)) ease-in-out infinite alternate, aurora-hue calc(80s/var(--spd)) linear infinite",
          }}
        />
        {/* ribbon C (wide base wash) */}
        <span
          style={{
            ...baseStyle,
            bottom: "-16%",
            left: "-6%",
            width: "140vmax",
            height: "50vmax",
            opacity: opacity * 0.45,
            transform: `skewX(-10deg) translate3d(${nx * 16 * m}px, ${ny * -12 * m}px, 0)`,
            animation: reducedMotion
              ? "none"
              : "aurora-pan calc(30s/var(--spd)) ease-in-out -12s infinite alternate, aurora-hue calc(100s/var(--spd)) linear infinite",
          }}
        />

        {/* cursor ripple */}
        {ripple && (
          <span
            style={{
              position: "absolute",
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              width: 380,
              height: 380,
              transform: "translate(-50%, -50%) translateZ(0)",
              pointerEvents: "none",
              background: `radial-gradient(closest-side, ${cols[0]}66, transparent 70%)`,
              filter: `blur(${Math.max(20, blur * 0.5)}px)`,
              mixBlendMode: "screen",
              animation: reducedMotion ? "none" : "ripple-glow calc(1.2s/var(--spd)) ease-out infinite",
            }}
          />
        )}
      </div>

      {/* keyframes (scoped) */}
      <style>{`
        @keyframes aurora-pan {
          0%   { background-position: 0% 50%; transform: skewX(-10deg); }
          100% { background-position: 100% 50%; transform: skewX(-10deg); }
        }
        @keyframes aurora-sway {
          0%   { transform: skewX(-10deg) translateY(0); }
          100% { transform: skewX(-10deg) translateY(-6%); }
        }
        @keyframes aurora-hue {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes ripple-glow {
          0%   { opacity: .65; transform: translate(-50%, -50%) scale(0.96); }
          60%  { opacity: .35; }
          100% { opacity: .0; transform: translate(-50%, -50%) scale(1.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          span[style*="aurora-pan"],
          span[style*="aurora-sway"],
          span[style*="aurora-hue"],
          span[style*="ripple-glow"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
