import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

export default function Astronauts({
  className = "",
  reducedMotion,              // optional override; defaults to hook
  hideOnMobile = true,
  zIndex = 12,
  center = { x: "50%", y: "50%" },
  items,
  showStars = true,
}) {
  const prefersReduced = usePrefersReducedMotion();
  const rm = typeof reducedMotion === "boolean" ? reducedMotion : prefersReduced;

  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(true);

  // Live mobile detection + tab visibility handling
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setIsMobile(!!mq.matches);
    apply();

    const onVis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", apply);
      return () => {
        mq.removeEventListener("change", apply);
        document.removeEventListener("visibilitychange", onVis);
      };
    } else if (typeof mq.addListener === "function") {
      mq.addListener(apply); // Safari <14
      return () => {
        mq.removeListener(apply);
        document.removeEventListener("visibilitychange", onVis);
      };
    }
  }, []);

  if (rm || (hideOnMobile && isMobile) || !active) return null;

  const defaults = useMemo(
    () =>
      items ?? [
        { size: 72, r: 240, speed: 0.22, delay: 0.0, ellipse: 1, glow: 0.38 },
        { size: 56, r: 300, speed: -0.16, delay: 0.6, ellipse: 0.85, glow: 0.32 },
        { size: 46, r: 180, speed: 0.30, delay: 1.2, ellipse: 1.15, glow: 0.28 },
      ],
    [items]
  );

  return (
    <div
      className={`pointer-events-none fixed inset-0 ${className}`}
      style={{ zIndex, contain: "layout style paint" }}
      aria-hidden="true"
    >
      {showStars && <Starfield opacity={0.15} />}
      {defaults.map((a, i) => (
        <OrbitSprite key={i} center={center} cfg={a} isActive={active} />
      ))}
    </div>
  );
}

function OrbitSprite({ center, cfg, isActive }) {
  const { size, r, speed = 0.2, delay = 0, ellipse = 1, glow = 0.35 } = cfg;
  const dur = 40 / Math.max(Math.abs(speed), 0.01);

  const spin = useAnimationControls();
  const counter = useAnimationControls();

  // Start/stop animations based on visibility
  useEffect(() => {
    if (!isActive) {
      spin.stop();
      counter.stop();
      return;
    }
    spin.start({
      rotate: speed > 0 ? 360 : -360,
      transition: { duration: dur, ease: "linear", repeat: Infinity, delay },
    });
    counter.start({
      rotate: [-360, 0],
      transition: { duration: dur, ease: "linear", repeat: Infinity, delay },
    });
    return () => {
      spin.stop();
      counter.stop();
    };
  }, [isActive, speed, dur, delay, spin, counter]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: center.x,
        top: center.y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        willChange: "transform",
      }}
      animate={spin}
    >
      <div style={{ transform: `translateX(${r}px) scaleY(${ellipse})`, transformOrigin: "center" }}>
        <motion.div
          animate={counter}
          style={{
            willChange: "transform",
            filter: `drop-shadow(0 10px 30px rgba(59,130,246,${glow}))`,
          }}
        >
          <motion.div
            animate={{ y: [0, -6, 0, 4, 0], rotateZ: [-1.5, 1.5, -1.2, 1.2, -1.5] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay }}
          >
            <AstronautSVG />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* Full color astronaut */
function AstronautSVG() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* glow halo */}
      <circle cx="32" cy="32" r="28" fill="url(#halo)" />

      {/* helmet */}
      <circle cx="32" cy="18" r="11" fill="#d9d9d9" stroke="#b3b3b3" strokeWidth="2" />
      <circle cx="32" cy="18" r="9" fill="#c4973f" stroke="#8c6e2f" strokeWidth="1.5" />
      <circle cx="28" cy="16" r="1.5" fill="white" opacity="0.8" />

      {/* body */}
      <rect x="20" y="28" width="24" height="18" rx="6" fill="#e6e6e6" stroke="#b3b3b3" strokeWidth="2" />
      <rect x="24" y="30" width="16" height="8" rx="2" fill="#1f2937" />

      {/* red stripes on arms */}
      <path d="M20 32c-7 1-7 11 0 14" stroke="#e63946" strokeWidth="2" fill="none" />
      <path d="M44 32c7 1 7 11 0 14" stroke="#e63946" strokeWidth="2" fill="none" />

      {/* legs */}
      <path d="M26 46v6" stroke="#b3b3b3" strokeWidth="2" />
      <path d="M38 46v6" stroke="#b3b3b3" strokeWidth="2" />

      {/* patches */}
      <circle cx="36" cy="34" r="2" fill="#2563eb" />
      <circle cx="28" cy="34" r="2" fill="#22c55e" />
    </svg>
  );
}

function Starfield({ opacity = 0.15 }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        willChange: "opacity",
        backgroundImage:
          "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.9), transparent 60%)," +
          "radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,.7), transparent 60%)," +
          "radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,.8), transparent 60%)," +
          "radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,.6), transparent 60%)," +
          "radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,.9), transparent 60%)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        /* tiny blur looks nice but can trigger heavy recompose on resume; keep minimal */
        filter: "blur(.2px)",
      }}
      aria-hidden="true"
    />
  );
}
