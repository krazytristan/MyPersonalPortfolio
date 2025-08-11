import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import GradientText from "../ui/GradientText";
import HeroPortrait from "../visuals/HeroPortrait";
import SolarOverlay from "../visuals/SolarOverlay";
import Universe from "../visuals/Universe";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

export default function HomeSection({ onResume, onGoProjects }) {
  const reduced = usePrefersReducedMotion();
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const sectionRef = useRef(null);

  // Mobile: hide scrollbar rails (scroll still works)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) document.documentElement.classList.add("mobile-hide-scrollbar");
    return () => document.documentElement.classList.remove("mobile-hide-scrollbar");
  }, []);

  // Repaint nudge when tab becomes visible (helps rare compositor stalls)
  useEffect(() => {
    const nudge = () => {
      document.body.style.transform = "translateZ(0)";
      requestAnimationFrame(() => {
        document.body.style.transform = "";
      });
      const host = sectionRef.current;
      if (!host) return;
      host.classList.add("resume-light");
      setTimeout(() => host.classList.remove("resume-light"), 200);
    };

    const onVis = () => {
      if (document.visibilityState === "visible") nudge();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Smooth 3D tilt + on-surface light (pointer events + rAF)
  const onMove = (e) => {
    if (reduced) return;
    const el = cardRef.current;
    if (!el) return;
    if (typeof e.pointerType === "string" && e.pointerType !== "mouse") return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;  // 0..1
      const ny = (e.clientY - r.top) / r.height;  // 0..1
      const rx = (0.5 - ny) * 10;
      const ry = (nx - 0.5) * 10;

      // tilt
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--ry", `${ry}deg`);

      // on-surface light position & normals
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.style.setProperty("--nx", `${nx}`);
      el.style.setProperty("--ny", `${ny}`);
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(rafRef.current);
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
    el.style.setProperty("--nx", "0.5");
    el.style.setProperty("--ny", "0.5");
  };

  // Cleanup pending rAF on unmount
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <section ref={sectionRef} className="relative">
      {/* background layers */}
      <Universe className="pointer-events-none absolute inset-0 -z-20" />
      <SolarOverlay className="pointer-events-none absolute inset-0 -z-10 opacity-70" />

      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT: animated intro card with on-surface light */}
        <motion.div
          ref={cardRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.985 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduced ? {} : { scale: 1.01, y: -4 }}
          whileTap={{ scale: 0.995 }}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, -3, 0, -2, 0],
                  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }
          }
          className="relative rounded-3xl p-8 shadow-2xl ring-1 ring-white/10 bg-white/5 backdrop-blur cardfx"
          style={{
            transformStyle: "preserve-3d",
            transform:
              "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(6px)",
            // tunables for the card light
            "--mx": "50%",
            "--my": "50%",
            "--nx": 0.5,
            "--ny": 0.5,
            "--edge-alpha": 0.25,     // 0..1, edge ring strength
            "--light-rgb": "255,255,255",
            "--light-strength": 0.42, // 0..1, surface spot strength
            "--light-size": "240px",  // diameter of spot
            "--light-blend": "soft-light",
            "--sheen-strength": 0.12, // specular streak
            "--sheen-width": "18deg",
          }}
          aria-label="Intro card with Tristan's summary"
        >
          {/* inner content */}
          <div className="relative z-[1]">
            {/* role chips */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              <span className="rounded-full px-2 py-1 bg-emerald-500/10 ring-1 ring-emerald-500/30">
                Educator
              </span>
              <span className="rounded-full px-2 py-1 bg-indigo-500/10 ring-1 ring-indigo-500/30">
                Full Stack
              </span>
              <span className="rounded-full px-2 py-1 bg-fuchsia-500/10 ring-1 ring-fuchsia-500/30">
                AI/ML
              </span>
            </div>

            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">
              <GradientText>Hi, I’m Tristan.</GradientText>
            </h1>

            <p className="mt-4 text-zinc-300">
              I build modern, accessible web apps and teach people how to do the same.
              I care about clean UX, solid architecture, and shipping fast.
            </p>

            {/* quick stats */}
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {[
                ["5+ yrs", "coding"],
                ["30+", "projects shipped"],
                ["500+", "students taught"],
              ].map(([big, sub]) => (
                <li key={sub} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                  <div className="text-2xl font-extrabold leading-none">
                    <GradientText small>{big}</GradientText>
                  </div>
                  <div className="text-zinc-400">{sub}</div>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button
                type="button"
                onClick={onResume}
                whileHover={reduced ? {} : { y: -2 }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                aria-label="Open resume"
              >
                📄 Resume
              </motion.button>

              <motion.button
                type="button"
                onClick={onGoProjects}
                whileHover={reduced ? {} : { y: -2 }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 ring-1 ring-white/10"
                aria-label="View projects"
              >
                View Projects
              </motion.button>

              <motion.a
                href="#contact"
                whileHover={reduced ? {} : { y: -2 }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/0 text-indigo-300 font-semibold hover:bg-white/10 ring-1 ring-white/10"
              >
                Contact Me
              </motion.a>
            </div>

            {/* tech badges */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
              {["React", "Node/PHP", "MySQL/Firebase", "Tailwind", "Automation"].map((t) => (
                <span key={t} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: portrait (with gentle float) */}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, -8, 0, -5, 0],
                  transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                }
          }
          className="relative"
          aria-hidden="true"
        >
          <HeroPortrait />
        </motion.div>
      </div>

      {/* tiny CSS helpers + card surface FX */}
      <style>{`
        /* slow spin utility (if you want to re-add any spinning rings) */
        @keyframes spin-slow { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        .animate-spin-slow { animation: spin-slow 18s linear infinite; }

        /* soften heavy blur filters briefly after tab resumes */
        .resume-light .pointer-events-none[style*="blur"] {
          filter: blur(4px) !important;
        }

        /* hide scrollbar rails on mobile while keeping scroll */
        .mobile-hide-scrollbar { scrollbar-width: none; }
        .mobile-hide-scrollbar::-webkit-scrollbar { width: 0; height: 0; }

        /* ===== Card on-surface lighting (no extra DOM) ===== */
        .cardfx { position: relative; isolation: isolate; }
        /* Edge ring + specular sheen */
        .cardfx::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: 1.5rem; /* rounded-3xl */
          pointer-events: none;
          /* edge ring (conic), tinted & soft */
          background:
            conic-gradient(
              from 0deg,
              rgba(99,102,241,var(--edge-alpha)) 0deg,
              rgba(168,85,247,var(--edge-alpha)) 120deg,
              rgba(34,211,238,var(--edge-alpha)) 240deg,
              rgba(99,102,241,var(--edge-alpha)) 360deg
            );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          padding: 1px; filter: blur(6px);
          opacity: 0.9; z-index: 0;
          /* subtle sheen streak aligned with Y tilt */
          mix-blend-mode: screen;
          background-blend-mode: screen;
        }
        /* Cursor-follow spot light that lives ON the card */
        .cardfx::after {
          content: "";
          position: absolute; inset: 0;
          border-radius: 1.5rem;
          pointer-events: none;
          background:
            radial-gradient(
              circle at var(--mx, 50%) var(--my, 50%),
              rgba(var(--light-rgb), calc(var(--light-strength) * 0.95)) 0%,
              rgba(var(--light-rgb), calc(var(--light-strength) * 0.55)) 14%,
              rgba(var(--light-rgb), calc(var(--light-strength) * 0.22)) 28%,
              rgba(var(--light-rgb), 0) 44%
            );
          background-size: var(--light-size) var(--light-size);
          background-repeat: no-repeat;
          mix-blend-mode: var(--light-blend, soft-light);
          filter: blur(10px);
          opacity: 1;
          transition: opacity 120ms ease, filter 120ms ease;
          z-index: 1;
        }

        /* Touch & reduced-motion: fade out dynamic effects */
        @media (pointer: coarse) { .cardfx::after { opacity: 0 !important; } }
        @media (prefers-reduced-motion: reduce) { .cardfx::after { opacity: 0 !important; } }
      `}</style>
    </section>
  );
}
