import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

/**
 * Astronauts (v2.1)
 * - Fix SSR hydration mismatch from Math.random by generating items on client only (once).
 * - Clean animation teardown; prevent work when tab is hidden or on mobile (optional).
 * - Parallax remains prop-driven; no event listeners inside.
 */
export default function Astronauts({
  className = "",
  reducedMotion,                 // optional override; defaults to hook
  hideOnMobile = true,
  zIndex = 12,
  center = { x: "50%", y: "50%" },
  items,                          // explicit array of configs OR auto-gen via count
  count = 3,                      // used only when items is not provided
  radiusBase = 220,               // base orbit radius for auto-gen
  radiusJitter = 120,             // randomness around base
  showStars = true,
  starOpacity = 0.16,
  starTwinkle = true,
  cursor = null,                  // {x,y} optional parallax source
  parallax = 10,                  // px movement range for parallax (0 disables)
  glowColor = "59,130,246",       // rgb for drop shadow
  trail = true,                   // enable tiny tail behind each astronaut
  floatAmp = 6,                   // px bob amplitude
  floatDur = 6,                   // seconds for one bob cycle
}) {
  const prefersReduced = usePrefersReducedMotion();
  const rm = typeof reducedMotion === "boolean" ? reducedMotion : prefersReduced;

  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(true);

  // --- Live mobile detection + tab visibility (no memory leaks on older browsers) ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setIsMobile(!!mq.matches);
    apply();

    const onVis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);

    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
    } else if (mq.addListener) {
      mq.addListener(apply);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else if (mq.removeListener) mq.removeListener(apply);
    };
  }, []);

  // Respect reduced motion / mobile preference / hidden tab
  if (rm || (hideOnMobile && isMobile) || !active) return null;

  // --- Parallax (prop→style; no listeners here) ---
  let px = 0, py = 0;
  if (cursor && typeof window !== "undefined" && parallax > 0) {
    const nx = cursor.x / (window.innerWidth || 1) - 0.5;   // -0.5..0.5
    const ny = cursor.y / (window.innerHeight || 1) - 0.5;
    px = nx * parallax;
    py = ny * parallax * 0.7;
  }

  // --- Items: generate once on client to avoid SSR random mismatch ---
  const itemsRef = useRef(null);
  const [, force] = useState(0);
  useEffect(() => {
    if (itemsRef.current) return;
    if (Array.isArray(items) && items.length) {
      itemsRef.current = items;
    } else {
      // deterministic-ish but client-only generation
      const arr = [];
      // simple seeded RNG (mulberry32) to be stable across re-renders in this session
      let seed = Math.imul(37, count + Math.floor(radiusBase) + Math.floor(radiusJitter));
      const rand = () => {
        // mulberry32
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
      for (let i = 0; i < count; i++) {
        const s = [72, 56, 46][i % 3] ?? Math.max(36, 72 - i * 6);
        const r = radiusBase + (rand() * 2 - 1) * radiusJitter;
        const speed = (i % 2 === 0 ? 1 : -1) * (0.18 + rand() * 0.16);
        const delay = i * 0.6;
        const ellipse = 0.9 + (rand() * 0.4 - 0.2);
        const glow = 0.26 + rand() * 0.12;
        arr.push({ size: s, r, speed, delay, ellipse, glow });
      }
      itemsRef.current = arr;
    }
    force((n) => (n + 1) % 10); // trigger one paint after mount
  }, [items, count, radiusBase, radiusJitter]);

  const list = itemsRef.current || [];

  return (
    <div
      className={`pointer-events-none fixed inset-0 ${className}`}
      style={{ zIndex, contain: "layout style paint" }}
      aria-hidden="true"
    >
      {showStars && (
        <Starfield
          opacity={starOpacity}
          twinkle={starTwinkle}
          parallax={{ x: px * 0.3, y: py * 0.2 }}
        />
      )}

      {list.map((cfg, i) => (
        <OrbitSprite
          key={i}
          center={center}
          cfg={cfg}
          isActive={active}
          px={px}
          py={py}
          glowColor={glowColor}
          trail={trail}
          floatAmp={floatAmp}
          floatDur={floatDur}
        />
      ))}
    </div>
  );
}

function OrbitSprite({ center, cfg, isActive, px, py, glowColor, trail, floatAmp, floatDur }) {
  const { size, r, speed = 0.2, delay = 0, ellipse = 1, glow = 0.35 } = cfg;
  const dur = 40 / Math.max(Math.abs(speed), 0.01); // full orbit

  const spin = useAnimationControls();
  const counter = useAnimationControls();

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
        transform: `translate3d(${px}px, ${py}px, 0)`,
      }}
      animate={spin}
    >
      <div style={{ transform: `translateX(${r}px) scaleY(${ellipse})`, transformOrigin: "center" }}>
        <motion.div
          animate={counter}
          style={{
            willChange: "transform",
            filter: `drop-shadow(0 10px 30px rgba(${glowColor},${glow}))`,
          }}
        >
          {/* simple trail (optional) */}
          {trail && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                transform: "translate(-40%, 20%) scale(1.1, 0.9)",
                filter: "blur(10px)",
                opacity: 0.45,
                mixBlendMode: "screen",
                background:
                  "radial-gradient(20% 34% at 30% 52%, rgba(255,255,255,.28), rgba(255,255,255,0) 70%)," +
                  "radial-gradient(26% 40% at 14% 58%, rgba(185,210,255,.22), rgba(185,210,255,0) 80%)",
              }}
            />
          )}

          <motion.div
            animate={{
              y: [0, -floatAmp, 0, floatAmp * 0.7, 0],
              rotateZ: [-1.4, 1.4, -1.1, 1.1, -1.4],
            }}
            transition={{ duration: floatDur, ease: "easeInOut", repeat: Infinity, delay }}
          >
            <AstronautSVG />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Full color astronaut SVG with a tiny halo */
function AstronautSVG() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#halo)" />

      {/* helmet */}
      <circle cx="32" cy="18" r="11" fill="#d9d9d9" stroke="#b3b3b3" strokeWidth="2" />
      <circle cx="32" cy="18" r="9" fill="#c4973f" stroke="#8c6e2f" strokeWidth="1.5" />
      <circle cx="28" cy="16" r="1.5" fill="white" opacity="0.85" />

      {/* body */}
      <rect x="20" y="28" width="24" height="18" rx="6" fill="#e6e6e6" stroke="#b3b3b3" strokeWidth="2" />
      <rect x="24" y="30" width="16" height="8" rx="2" fill="#1f2937" />

      {/* arms stripes */}
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

/** GPU-friendly starfield with gentle twinkle + optional parallax */
function Starfield({ opacity = 0.15, twinkle = true, parallax = { x: 0, y: 0 } }) {
  const x = parallax?.x || 0;
  const y = parallax?.y || 0;
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        willChange: "transform, opacity",
        transform: `translate3d(${x}px, ${y}px, 0)`,
        backgroundImage:
          // three layers at different densities for a bit of depth
          "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.95), transparent 60%)," +
          "radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,.75), transparent 60%)," +
          "radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,.85), transparent 60%)," +
          "radial-gradient(1px 1px at 15% 75%, rgba(255,255,255,.65), transparent 60%)," +
          "radial-gradient(1px 1px at 35% 55%, rgba(255,255,255,.9), transparent 60%)," +
          "radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,.85), transparent 60%)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        filter: "blur(.2px)",
        animation: twinkle ? "stars 6s ease-in-out infinite" : "none",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes stars {
          0%   { opacity: ${opacity}; }
          50%  { opacity: ${Math.max(0.08, opacity - 0.05)}; }
          100% { opacity: ${opacity}; }
        }
      `}</style>
    </div>
  );
}
