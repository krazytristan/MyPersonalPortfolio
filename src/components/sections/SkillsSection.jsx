import { useMemo, useRef, useState, useCallback } from "react";
import { motion, useMotionValue } from "framer-motion";
import GradientText from "../ui/GradientText";
import skills from "../../data/skills";

function SkillCard({ s }) {
  const cardRef = useRef(null);

  // motion values for tilt (degrees) and glow position (percent)
  const rX = useMotionValue(0);
  const rY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const [hover, setHover] = useState(false);

  const onMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;  // 0..1
    const py = (e.clientY - rect.top) / rect.height;  // 0..1

    // tilt range: ±10°
    rY.set((px - 0.5) * 20);
    rX.set((0.5 - py) * 20);

    glowX.set(px * 100);
    glowY.set(py * 100);
  }, [rX, rY, glowX, glowY]);

  const onLeave = useCallback(() => {
    rX.set(0);
    rY.set(0);
    glowX.set(50);
    glowY.set(50);
    setHover(false);
  }, [rX, rY, glowX, glowY]);

  const onEnter = useCallback(() => setHover(true), []);

  const level =
    typeof s.level === "number" && s.level >= 0 && s.level <= 100
      ? Math.round(s.level)
      : null;

  return (
    <motion.li className="w-full" role="listitem">
      <motion.div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        whileHover={{ scale: 1.03 }}
        style={{
          rotateX: rX,
          rotateY: rY,
          transformStyle: "preserve-3d",
          perspective: 800,
        }}
        className="group relative h-full rounded-2xl ring-1 ring-white/10 bg-white/5 p-4 flex flex-col items-center justify-between text-center transition
                   hover:ring-indigo-400/50 hover:bg-white/10 focus-within:ring-indigo-400/60 cursor-pointer"
        tabIndex={0}
        title={s.name}
        aria-label={s.name}
      >
        {/* hover glow that tracks cursor */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition will-change-transform"
          style={{
            background: `radial-gradient(200px 200px at ${glowX.get()}% ${glowY.get()}%, rgba(99,102,241,.25), transparent 50%),
                         conic-gradient(from 0deg, rgba(99,102,241,.14), rgba(168,85,247,.14), rgba(34,211,238,.14), rgba(99,102,241,.14))`,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: 1,
            filter: "blur(8px)",
          }}
        />

        <div className="relative mx-auto grid place-items-center" style={{ transform: "translateZ(18px)" }}>
          <motion.img
            src={s.icon}
            alt=""
            loading="lazy"
            className="w-10 h-10 sm:w-11 sm:h-11 mb-2"
            initial={false}
            animate={hover ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            style={{ transform: "translateZ(26px)" }}
          />
        </div>

        <div className="flex flex-col items-center" style={{ transform: "translateZ(14px)" }}>
          <span className="text-xs font-medium text-zinc-200">{s.name}</span>

          {level !== null && (
            <div
              className="mt-2 w-20 h-1.5 rounded-full bg-white/10 overflow-hidden"
              aria-label={`${s.name} proficiency ${level}%`}
            >
              <motion.div
                className="h-full rounded-full bg-indigo-500/80"
                style={{ width: `${level}%` }}
                initial={{ width: 0 }}
                animate={hover ? { width: `${level}%` } : { width: `${Math.min(level, 35)}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              />
            </div>
          )}
        </div>

        <div aria-hidden className="h-0" />
      </motion.div>
    </motion.li>
  );
}

export default function SkillsSection() {
  const list = useMemo(() => (Array.isArray(skills) ? skills : []), []);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  };

  return (
    <section className="w-full">
      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          <GradientText>Skills</GradientText>
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Tools & technologies I’m comfortable shipping with.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="text-center text-zinc-400 text-sm ring-1 ring-white/10 bg-white/5 rounded-2xl p-10">
          No skills to show yet.
        </div>
      ) : (
        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-5 sm:gap-6 justify-items-center items-stretch"
          role="list"
        >
          {list.map((s) => (
            <SkillCard key={s.name} s={s} />
          ))}
        </motion.ul>
      )}
    </section>
  );
}
