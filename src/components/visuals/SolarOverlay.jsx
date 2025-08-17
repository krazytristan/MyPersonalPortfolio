import { useMemo } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

/**
 * SolarOverlay (v2.1)
 * - Rotation (inner) + Parallax (outer) are separated so transforms don't clash.
 * - Clamped mask stops (no negative %), memoized gradient/masks.
 */
export default function SolarOverlay({
  className = "",
  style,
  reducedMotion,              // optional override; defaults to prefers-reduced-motion

  // size & layout
  size = "120vmin",           // overall diameter
  thickness = 0.18,           // 0..1 thickness of the ring (outer - inner)
  feather = 0.06,             // 0..0.3 feather at inner & outer edges

  // visuals
  opacity = 0.22,
  blur = 18,                  // px blur
  blendMode = "screen",       // 'screen' | 'plus-lighter' | 'lighten' | 'normal'
  colors = [
    "rgba(99,102,241,.25)",   // indigo
    "rgba(168,85,247,.25)",   // fuchsia
    "rgba(34,211,238,.25)",   // cyan
    "rgba(99,102,241,.25)",   // indigo
  ],
  gap = 0.0,                  // 0..1 fraction of each segment as transparent gap
  phase = 0,                  // degrees to rotate the palette arrangement

  // motion
  speed = 16,                 // seconds per rotation
  reverse = false,            // rotate in reverse
  cursor = null,              // optional {x,y} for parallax
  parallax = 12,              // px offset range for parallax (0 disables)
}) {
  const prefersReduced = usePrefersReducedMotion();
  const rm = (reducedMotion ?? prefersReduced) === true;

  // Normalize thickness & feather; derive radii
  const t = Math.max(0.01, Math.min(0.9, thickness));
  const f = Math.max(0, Math.min(0.3, feather));
  const inner = Math.max(0, 0.5 - t / 2);
  const outer = Math.min(1, 0.5 + t / 2);

  // Build conic gradient with optional gaps
  const conic = useMemo(() => {
    const n = Math.max(1, colors.length);
    const g = Math.max(0, Math.min(0.45, gap));
    const seg = 100 / n;
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

  // Feathered ring masks (clamped to 0..100)
  const mask = useMemo(() => {
    const pct = (v) => Math.max(0, Math.min(100, v));
    const i0 = pct(inner * 100 - f * 100);
    const i1 = pct(inner * 100);
    const o1 = pct(outer * 100);
    const o2 = pct(outer * 100 + f * 100);
    const radial = `
      radial-gradient(closest-side,
        transparent ${i0}%,
        black ${i1}%,
        black ${o1}%,
        transparent ${o2}%)
    `;
    return { maskImage: radial, WebkitMaskImage: radial };
  }, [inner, outer, f]);

  // Parallax (outer wrapper) – no transform/animation conflicts
  let px = 0, py = 0;
  if (!rm && cursor && typeof window !== "undefined" && parallax > 0) {
    const nx = cursor.x / (window.innerWidth || 1) - 0.5;
    const ny = cursor.y / (window.innerHeight || 1) - 0.5;
    px = (nx * parallax) | 0;
    py = (ny * parallax * 0.7) | 0;
  }

  // Base ring styles (shared)
  const baseRing = {
    width: size,
    height: size,
    opacity,
    background: conic,
    filter: `blur(${blur}px)`,
    mixBlendMode: blendMode,
    willChange: "transform, background",
    ...mask,
  };

  // Back (faint) ring: larger, softer, opposite spin for depth
  const backInner = {
    ...baseRing,
    width: `calc(${size} * 1.12)`,
    height: `calc(${size} * 1.12)`,
    opacity: opacity * 0.62,
    filter: `blur(${blur + 6}px)`,
    animation: rm ? "none" : `solar-rot ${speed * 1.35}s linear infinite${!reverse ? " reverse" : ""}`,
  };

  // Front (main) ring
  const frontInner = {
    ...baseRing,
    animation: rm ? "none" : `solar-rot ${speed}s linear infinite${reverse ? " reverse" : ""}`,
  };

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-[4] grid place-items-center ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* OUTER WRAPPER: handles parallax translate only */}
      <div
        className="grid place-items-center will-change-transform"
        style={{ transform: `translate3d(${px * -0.5}px, ${py * -0.35}px, 0)` }}
      >
        {/* BACK (rotating) */}
        <div className="rounded-full" style={backInner} />
      </div>

      <div
        className="grid place-items-center will-change-transform"
        style={{ transform: `translate3d(${px}px, ${py}px, 0)` }}
      >
        {/* FRONT (rotating) */}
        <div className="rounded-full" style={frontInner} />
      </div>

      {/* scoped keyframes (rotate only the inner rings) */}
      <style>{`
        @keyframes solar-rot {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rounded-full[style*="solar-rot"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
