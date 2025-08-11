import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function HeroPortrait({
  className = "",
  src = "/images/BSU_6102.jpg",
  alt = "Tristan portrait",
}) {
  const ref = useRef(null);
  const glowRef = useRef(null);
  const [canAnimate, setCanAnimate] = useState(true);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;

    setCanAnimate(!prefersReduced && !isTouch);
  }, []);

  const onMove = (e) => {
    if (!canAnimate) return;
    const el = ref.current;
    const glow = glowRef.current;
    if (!el || !glow) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = (y / rect.height - 0.5) * -8; // tilt X
    const ry = (x / rect.width - 0.5) * 8;   // tilt Y
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: 0.05 }}
      className={`relative ${className}`}
    >
      {/* Ambient glow behind the image (no visible box) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem]"
        style={{
          filter: "blur(40px)",
          background:
            "radial-gradient(44rem 30rem at 70% 15%, rgba(99,102,241,.16), transparent 60%), radial-gradient(32rem 24rem at 30% 85%, rgba(34,211,238,.12), transparent 60%)",
        }}
      />

      <div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative rounded-3xl"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* subtle cursor-follow glow (desktop only) */}
        <span
          ref={glowRef}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full"
          style={{
            display: canAnimate ? "block" : "none",
            background:
              "radial-gradient(90px 90px at center, rgba(185,210,255,0.35), rgba(0,0,0,0))",
            filter: "blur(10px)",
          }}
        />

        <img
          ref={ref}
          src={src}
          alt={alt}
          className="rounded-3xl object-cover w-full h-[360px] sm:h-[420px] md:h-[480px] select-none"
          style={{
            transition: "transform 120ms ease",
            boxShadow: "0 20px 80px rgba(59,130,246,0.18)",
          }}
          loading="eager"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
