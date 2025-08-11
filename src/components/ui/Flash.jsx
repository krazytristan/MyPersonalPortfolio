import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Flash (v2)
 * - Screen-space flash burst with optional ripple ring.
 * - Re-trigger by changing the `trigger` prop (number, string, or boolean).
 *
 * Props
 * - trigger: any value that changes when you want to flash (e.g., a counter or Date.now()).
 * - reducedMotion: disable animation if true.
 * - x, y: override flash center in CSS units (px, %, etc). Defaults to viewport center.
 * - size: CSS length for the radial size (e.g., "600px", "80vmin").
 * - color: CSS color (used as the flash base).
 * - strength: 0..1 max opacity of the flash.
 * - duration: seconds for the flash fade.
 * - blendMode: CSS mix-blend-mode (e.g., "screen", "plus-lighter", "lighten").
 * - blur: px of blur for the core flash.
 * - ripple: show an expanding ring (boolean).
 * - rippleSize: base ring diameter (CSS length).
 * - rippleWidth: thickness of the ring (px).
 * - zIndex: stacking order.
 */
export default function Flash({
  trigger,                 // change this to re-fire (e.g., Date.now())
  reducedMotion = false,

  x = "50%",               // center x
  y = "40%",               // center y
  size = "600px",          // core flash diameter
  color = "white",         // core color
  strength = 0.22,         // max opacity
  duration = 0.35,         // seconds
  blendMode = "screen",
  blur = 16,

  ripple = false,
  rippleSize = "520px",
  rippleWidth = 3,

  zIndex = 50,
}) {
  const core = useAnimationControls();
  const ring = useAnimationControls();
  const firedRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;
    // Prevent auto fire on first mount unless trigger is defined
    if (firedRef.current === 0 && trigger === undefined) {
      firedRef.current++;
      return;
    }
    firedRef.current++;

    // Core flash (opacity keyframes)
    core.start({
      opacity: [0, strength, 0],
      transition: { duration, ease: [0.17, 0.67, 0.22, 0.98] },
    });

    // Ripple ring (scale + fade)
    if (ripple) {
      ring.start({
        opacity: [strength * 0.85, 0],
        scale: [0.92, 1.25],
        transition: { duration: duration * 1.2, ease: "easeOut" },
      });
    }
  }, [trigger, reducedMotion, strength, duration, ripple, core, ring]);

  const centerTransform = `translate(-50%, -50%)`;

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex }}
    >
      {/* Core flash */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={reducedMotion ? { opacity: 0 } : core}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          transform: centerTransform,
          background: `radial-gradient(closest-side, ${color}, rgba(0,0,0,0))`,
          filter: `blur(${blur}px)`,
          mixBlendMode: blendMode,
          // Soft edge mask so corners never hard-cut
          WebkitMaskImage:
            "radial-gradient(120% 120% at 50% 50%, #000 70%, transparent 100%)",
          maskImage:
            "radial-gradient(120% 120% at 50% 50%, #000 70%, transparent 100%)",
        }}
      />

      {/* Optional ripple ring */}
      {ripple && (
        <motion.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={reducedMotion ? { opacity: 0 } : ring}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: rippleSize,
            height: rippleSize,
            transform: centerTransform,
            borderRadius: "9999px",
            boxShadow: `0 0 0 ${rippleWidth}px ${color}`,
            mixBlendMode: blendMode,
            filter: "blur(0.5px)",
          }}
        />
      )}
    </div>
  );
}
