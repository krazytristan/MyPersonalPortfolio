import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function HeroPortrait({
  className = "",
  src = "/images/BSU_6102.jpg",
  alt = "Tristan portrait",
  heightClass = "h-[360px] sm:h-[420px] md:h-[480px]",
}) {
  const cardRef = useRef(null);   // element that tilts
  const imgRef = useRef(null);    // the <img> (for shadow/transition only)
  const glowRef = useRef(null);   // cursor glow
  const rafRef = useRef(0);
  const [canAnimate, setCanAnimate] = useState(true);

  // Respect reduced-motion & ignore coarse pointers (touch)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    setCanAnimate(!prefersReduced && !isTouch);
  }, []);

  // Mouse-only, rAF-throttled tilt using CSS variables to avoid hydration jumps
  const onPointerMove = (e) => {
    if (!canAnimate) return;
    // Only react to mouse-like pointers
    if (typeof e.pointerType === "string" && e.pointerType !== "mouse") return;

    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const nx = x / r.width;   // 0..1
      const ny = y / r.height;  // 0..1

      const rx = (0.5 - ny) * 10; // tilt X (-5..5-ish)
      const ry = (nx - 0.5) * 10; // tilt Y

      card.style.setProperty("--rx", `${rx}deg`);
      card.style.setProperty("--ry", `${ry}deg`);

      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
  };

  const onPointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  // Cleanup pending rAF
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

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
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative rounded-3xl"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
          // CSS vars ensure first paint matches SSR (no transform jump)
          "--rx": "0deg",
          "--ry": "0deg",
          transform:
            "perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)) translateZ(6px)",
        }}
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
            willChange: "left, top",
          }}
          aria-hidden
        />

        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`rounded-3xl object-cover w-full ${heightClass} select-none`}
          style={{
            transition: "transform 150ms ease, box-shadow 200ms ease",
            boxShadow: "0 20px 80px rgba(59,130,246,0.18)",
          }}
          loading="eager"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
