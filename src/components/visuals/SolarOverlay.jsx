import { useMemo } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

/**
 * SolarOverlay
 * - Spinning conic "solar" ring with a soft inner cutout.
 * - Props let you tweak size, opacity, blur, speed, and color stops.
 */
export default function SolarOverlay({
  className = "",
  style,
  reducedMotion,             // optional override; defaults to prefers-reduced-motion
  size = "120vmin",          // overall diameter
  innerCutout = 0.62,        // 0..1 fraction for hole size
  opacity = 0.20,
  blur = 18,                 // px
  speed = 16,                // seconds per rotation
  colors = [
    "rgba(99,102,241,.25)",   // indigo-500-ish
    "rgba(168,85,247,.25)",   // fuchsia-500-ish
    "rgba(34,211,238,.25)",   // cyan-400-ish
    "rgba(99,102,241,.25)",
  ],
}) {
  const prefersReduced = usePrefersReducedMotion();
  const rm = reducedMotion ?? prefersReduced;

  // Build a conic gradient string like: color, transparent 25%, color, transparent 50%, ...
  const conic = useMemo(() => {
    const segments = colors
      .map((c, i) => `${c}, transparent ${((i + 1) * 25)}%`)
      .join(", ");
    return `conic-gradient(from 0deg, ${segments})`;
  }, [colors]);

  const baseStyle = {
    width: size,
    height: size,
    opacity,
    background: conic,
    maskImage: `radial-gradient(closest-side, transparent ${innerCutout * 100}%, black ${(innerCutout * 100) + 1}%)`,
    WebkitMaskImage: `radial-gradient(closest-side, transparent ${innerCutout * 100}%, black ${(innerCutout * 100) + 1}%)`,
    filter: `blur(${blur}px)`,
    animation: rm ? "none" : `spin-slow ${speed}s linear infinite`,
  };

  const backLayerStyle = {
    // slightly larger & softer, rotates the other way for depth
    width: `calc(${size} * 1.12)`,
    height: `calc(${size} * 1.12)`,
    opacity: opacity * 0.6,
    background: conic,
    maskImage: `radial-gradient(closest-side, transparent ${(innerCutout + 0.04) * 100}%, black ${((innerCutout + 0.04) * 100) + 1}%)`,
    WebkitMaskImage: `radial-gradient(closest-side, transparent ${(innerCutout + 0.04) * 100}%, black ${((innerCutout + 0.04) * 100) + 1}%)`,
    filter: `blur(${blur + 6}px)`,
    animation: rm ? "none" : `spin-slow ${speed * 1.4}s linear infinite reverse`,
  };

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-[4] grid place-items-center ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* back faint ring */}
      <div className="rounded-full will-change-transform" style={backLayerStyle} />
      {/* main ring */}
      <div className="rounded-full will-change-transform" style={baseStyle} />
    </div>
  );
}
