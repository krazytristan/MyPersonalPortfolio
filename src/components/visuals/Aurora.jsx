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

  // viewport (SSR-safe) + update on resize
  const vw = typeof window !== "undefined" ? window.innerWidth : 1;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1;

  // normalize 0..1 relative to viewport
  const nx = vw ? (cursor.x / vw - 0.5) : 0;
  const ny = vh ? (cursor.y / vh - 0.5) : 0;
  const m = reducedMotion ? 0 : 1; // motion multiplier

  // shared ribbon style
  const baseStyle = {
    position: "absolute",
    width: "120vmax",
    height: "60vmax",
    filter: `blur(${blur}px) saturate(130%) hue-rotate(var(--hue, 0deg))`,
    mixBlendMode: "screen",
    opacity,
    // keep skew in the static transform; the rest is via CSS vars
    transform: "skewX(-10deg) translate3d(var(--tx,0px), calc(var(--ty,0px) + var(--sway,0px)), 0)",
    backgroundImage: `linear-gradient(90deg, ${cols.join(", ")})`,
    backgroundSize: "200% 100%",
    borderRadius: "9999px",
    willChange: "transform, background-position, filter, opacity",
    WebkitMaskImage:
      "radial-gradient(100% 70% at 50% 50%, #000 60%, transparent 100%)",
    maskImage:
      "radial-gradient(100% 70% at 50% 50%, #000 60%, transparent 100%)",
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-[9] overflow-hidden"
      aria-hidden
      style={{ ["--spd"]: String(speed) }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        {/* Ribbon A */}
        <span
          style={{
            ...baseStyle,
            top: "-12%",
            left: "-10%",
            // cursor parallax via vars; keyframes animate --hue only here
            ["--tx"]: `${nx * 20 * m}px`,
            ["--ty"]: `${ny * 10 * m}px`,
            animation: reducedMotion
              ? "none"
              : "aurora-pan calc(22s/var(--spd)) ease-in-out infinite alternate, hue-spin calc(60s/var(--spd)) linear infinite",
          }}
        />
        {/* Ribbon B (deeper, larger + gentle sway via --sway) */}
        <span
          style={{
            ...baseStyle,
            top: "22%",
            right: "-15%",
            height: "70vmax",
            opacity: opacity * 0.5,
            ["--tx"]: `${nx * -30 * m}px`,
            ["--ty"]: `${ny * 18 * m}px`,
            animation: reducedMotion
              ? "none"
              : "aurora-pan calc(28s/var(--spd)) ease-in-out -6s infinite alternate, swayY calc(16s/var(--spd)) ease-in-out infinite alternate, hue-spin calc(80s/var(--spd)) linear infinite",
          }}
        />
        {/* Ribbon C (wide base wash) */}
        <span
          style={{
            ...baseStyle,
            bottom: "-16%",
            left: "-6%",
            width: "140vmax",
            height: "50vmax",
            opacity: opacity * 0.45,
            ["--tx"]: `${nx * 16 * m}px`,
            ["--ty"]: `${ny * -12 * m}px`,
            animation: reducedMotion
              ? "none"
              : "aurora-pan calc(30s/var(--spd)) ease-in-out -12s infinite alternate, hue-spin calc(100s/var(--spd)) linear infinite",
          }}
        />

        {/* Cursor ripple */}
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

      {/* Scoped keyframes (animate variables instead of overriding transform/filter) */}
      <style>{`
        @keyframes aurora-pan {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        /* Animate a vertical sway via CSS variable */
        @keyframes swayY {
          0%   { --sway: 0px; }
          100% { --sway: -6%; }
        }
        /* Animate hue as a variable, then use it in filter */
        @keyframes hue-spin {
          0%   { --hue: 0deg; }
          100% { --hue: 360deg; }
        }
        @keyframes ripple-glow {
          0%   { opacity: .65; transform: translate(-50%, -50%) scale(0.96); }
          60%  { opacity: .35; }
          100% { opacity: .0; transform: translate(-50%, -50%) scale(1.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          span {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
