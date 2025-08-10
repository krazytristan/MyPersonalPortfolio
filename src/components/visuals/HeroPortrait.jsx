import { motion } from "framer-motion";
import { useRef } from "react";

export default function HeroPortrait() {
  const ref = useRef(null);
  const glowRef = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    const glow = glowRef.current;
    if (!el || !glow) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = (y / rect.height - 0.5) * -8; // tilt X
    const ry = (x / rect.width - 0.5) * 8; // tilt Y
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
  };
  const onLeave = () => {
    if (ref.current)
      ref.current.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="hidden md:block relative"
    >
      <div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative rounded-3xl shadow-2xl ring-2 ring-white/10"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* cursor glow */}
        <span
          ref={glowRef}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full"
          style={{
            background:
              "radial-gradient(80px 80px at center, rgba(180, 200, 255, 0.35), rgba(0,0,0,0))",
            filter: "blur(8px)",
          }}
        />
        <img
          ref={ref}
          src="/images/BSU_6102.jpg"
          alt="Tristan portrait"
          className="rounded-3xl object-cover h-[420px] w-full select-none"
          style={{ transition: "transform 120ms ease" }}
          loading="eager"
        />
        {/* outer glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-indigo-400/30 shadow-[0_0_120px_rgba(99,102,241,0.25)]"
          aria-hidden
        />
      </div>
    </motion.div>
  );
}
