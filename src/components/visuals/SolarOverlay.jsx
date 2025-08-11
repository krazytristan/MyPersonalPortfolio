import { useMemo } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

/**
 * SolarOverlay (v2)
 * - Spinning conic ring with inner/outer feather, parallax, and palette gaps.
 * - No event listeners required: you can pass a {x,y} cursor from parent if desired.
 */
export default function SolarOverlay({
  className = "",
  style,
  reducedMotion,              // optional override; defaults to prefers-reduced-motion

  // size & layout
  size = "120vmin",           // overall diameter
  thickness = 0.18,           // 0..1 thickness of the ring (outer - inner)
  feather = 0.06,             // 0..0.3 feathering at both inner & outer edges

  // visuals
  opacity = 0.22,
  blur = 18,                  // px blur of the ring surface
  blendMode = "screen",       // 'screen' | 'plus-lighter' | 'lighten' | 'normal'
  colors = [
    "rgba(99,102,241,.25)",   // indigo
    "rgba(168,85,247,.25)",   // fuchsia
    "rgba(34,211,238,.25)",   // cyan
    "rgba(99,102,241,.25)",   // indigo
  ],
  gap = 0.0,                  // 0..1 fraction to insert transparent gaps between bands
  phase = 0,                  // degrees to rotate the palette arrangement

  // motion
  speed = 16,                 // seconds per rotation
  reverse = false,            // rotate in reverse
  cursor = null,              // optional {x,y} for parallax; if null, no parallax
  parallax = 12,              // px offset range for parallax (0 disables)
}) {
  const prefersReduced = usePrefersReducedMotion();
  const rm = reducedMotion ?? prefersReduced;

  // Normalize thickness & feather; derive inner & outer radii
  const t = Math.max(0.01, Math.min(0.9, thickness));
  const f = Math.max(0, Math.min(0.3, feather));
  const inner = Math.max(0, 0.5 - t / 2);
  const outer = Math.min(1, 0.5 + t / 2);

  // Build conic gradient with optional transparent gaps between color bands
  const conic = useMemo(() => {
    const n = colors.length || 1;
    const g = Math.max(0, Math.min(0.45, gap)); // clamp
    const seg = 100 / n;
    // For each color, allocate (1 - g) of its segment to color, g to transparent
    const parts = colors.flatMap((c, i) => {
      const start = i * seg;
      const colorEnd = start + seg * (1 - g);
      const gapEnd = (i + 1) * seg;
      return [
        `${c} ${start}% ${colorEnd}%`,
        `transparent ${colorEnd}% ${gapEnd}%`,
      ];
    });
    return `conic-gradient(from ${phase}deg, ${parts.join(", ")})`;
  }, [colors, gap, phase]);

  // Parallax offsets from cursor (no listeners; parent can pass cursor)
  let px = 0, py = 0;
  if (!rm && cursor && typeof window !== "undefined") {
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    const nx = cursor.x / vw - 0.5; // -0.5..0.5
    const ny = cursor.y / vh - 0.5;
    px = (nx * parallax) | 0;
    py = (ny * parallax) | 0;
  }

  const base = {
    width: size,
    height: size,
    opacity,
    background: conic,
    filter: `blur(${blur}px)`,
    mixBlendMode: blendMode,
    willChange: "transform, background",
    // Feathered ring via dual radial masks (inner & outer)
    maskImage: `
      radial-gradient(closest-side, 
        transparent ${inner * 100 - f * 100}%,
        black ${inner * 100}%,
        black ${outer * 100}%,
        transparent ${outer * 100 + f * 100}%)
    `,
    WebkitMaskImage: `
      radial-gradient(closest-side, 
        transparent ${inner * 100 - f * 100}%,
        black ${inner * 100}%,
        black ${outer * 100}%,
        transparent ${outer * 100 + f * 100}%)
    `,
  };

  const baseAnim = rm ? "none" : `spin-solar ${speed}s linear infinite${reverse ? " reverse" : ""}`;

  const back = {
    ...base,
    width: `calc(${size} * 1.12)`,
    height: `calc(${size} * 1.12)`,
    opacity: opacity * 0.62,
    filter: `blur(${blur + 6}px)`,
    animation: rm ? "none" : `spin-solar ${speed * 1.35}s linear infinite${!reverse ? " reverse" : ""}`,
    transform: `translate3d(${px * -0.5}px, ${py * -0.35}px, 0)`,
  };

  const front = {
    ...base,
    animation: baseAnim,
    transform: `translate3d(${px}px, ${py}px, 0)`,
  };

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-[4] grid place-items-center ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* back faint ring */}
      <div className="rounded-full will-change-transform" style={back} />
      {/* main ring */}
      <div className="rounded-full will-change-transform" style={front} />

      {/* keyframes (scoped) */}
      <style>{`
        @keyframes spin-solar {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rounded-full[style*="spin-solar"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
