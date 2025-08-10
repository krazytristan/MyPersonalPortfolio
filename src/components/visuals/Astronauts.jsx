import { motion } from "framer-motion";

export default function Astronauts({ reducedMotion = false }) {
  if (reducedMotion) return null;
  const items = [
    { size: 52, r: 180, speed: 0.25, delay: 0 },
    { size: 44, r: 240, speed: -0.18, delay: 0.7 },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 -z-[5]" aria-hidden>
      {items.map((a, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: "50%",
            top: "45%",
            width: a.size,
            height: a.size,
            marginLeft: -a.size / 2,
            marginTop: -a.size / 2,
          }}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: (1 / Math.abs(a.speed)) * 40,
            delay: a.delay,
          }}
        >
          <motion.div
            style={{ position: "absolute", left: -a.r, top: -a.r }}
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: (1 / Math.abs(a.speed)) * 40,
              delay: a.delay,
            }}
          >
            <AstronautSVG />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

function AstronautSVG() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden>
      <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="20" r="10" fill="rgba(255,255,255,0.1)" />
        <rect x="18" y="30" width="28" height="22" rx="6" fill="rgba(255,255,255,0.08)" />
        <path d="M18 36h-6m40 0h-6" />
        <path d="M26 52v6m12-6v6" />
        <circle cx="28" cy="20" r="2" fill="white" />
      </g>
    </svg>
  );
}
