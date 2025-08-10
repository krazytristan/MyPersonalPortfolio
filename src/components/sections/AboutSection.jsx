// src/components/sections/AboutSection.jsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GradientText from "../ui/GradientText";

/** Simple 0→target counter that starts when visible (no framer hooks) */
function Counter({ to = 100, duration = 800, className = "" }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now) => {
              const t = Math.min(1, (now - start) / duration);
              setValue(Math.round(t * to));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}+
    </span>
  );
}

const cardIn = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function AboutSection({ quickFacts }) {
  const [tab, setTab] = useState("bio"); // "bio" | "timeline"

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* LEFT: Bio / Timeline */}
      <motion.div
        variants={cardIn}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="rounded-2xl p-6 ring-1 ring-white/10 bg-white/5 relative overflow-hidden"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full"
          style={{
            background: "radial-gradient(closest-side, rgba(99,102,241,.22), rgba(0,0,0,0))",
            filter: "blur(14px)",
          }}
        />
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            <GradientText small>About</GradientText>
          </h3>
          <div role="tablist" aria-label="About tabs" className="flex rounded-full bg-white/5 ring-1 ring-white/10 p-1 text-xs">
            {["bio", "timeline"].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-full transition ${tab === t ? "bg-indigo-600 text-white" : "hover:bg-white/10 text-zinc-300"}`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {tab === "bio" ? (
          <div className="mt-4 space-y-4">
            <p className="text-zinc-300">
              Tech-savvy educator and full-stack developer focused on building useful, beautiful tools.
              I turn fuzzy ideas into clean, accessible experiences—mostly with React, Node/PHP, Tailwind,
              and a dash of AI where it helps.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {["Design→Dev", "Dashboards", "Automations", "PDF/Email", "Accessibility"].map((t) => (
                <span key={t} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10 text-zinc-300">
                  {t}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-center">
                <div className="text-2xl font-extrabold leading-none">
                  <GradientText small><Counter to={5} /></GradientText>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">years coding</div>
              </div>
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-center">
                <div className="text-2xl font-extrabold leading-none">
                  <GradientText small><Counter to={30} /></GradientText>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">projects shipped</div>
              </div>
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-center">
                <div className="text-2xl font-extrabold leading-none">
                  <GradientText small><Counter to={500} /></GradientText>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">students taught</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            {[
              { color: "bg-emerald-400", label: "2018–Now:", text: "Teaching AI Fundamentals, OOP (C++), Software Engineering." },
              { color: "bg-indigo-400", label: "Recent:", text: "iLab System, Barangay Info System, AMATrack." },
              { color: "bg-fuchsia-400", label: "Focus:", text: "React performance, AI-assisted workflows, clean UX." },
            ].map((row) => (
              <div key={row.text} className="flex gap-3">
                <span className={`mt-1 h-2 w-2 rounded-full ${row.color}`} aria-hidden />
                <div className="text-zinc-300">
                  <span className="font-semibold text-white">{row.label}</span> {row.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* RIGHT: Quick facts */}
      <motion.div
        variants={cardIn}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="rounded-2xl p-6 ring-1 ring-white/10 bg-white/5"
      >
        <h3 className="text-xl font-semibold mb-3">
          <GradientText small>Quick facts</GradientText>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickFacts.map((c) => (
            <motion.button
              key={c.title}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.995 }}
              className="group rounded-xl p-4 bg-white/5 ring-1 ring-white/10 text-center outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 transition"
              title={c.sub}
            >
              <div className="text-2xl" aria-hidden>{c.emoji}</div>
              <div className="mt-1 font-semibold">
                <GradientText small>{c.title}</GradientText>
              </div>
              <div className="text-xs text-zinc-400">{c.sub}</div>
              <span className="block h-px w-0 group-hover:w-full transition-all duration-300 bg-indigo-400/70 mt-2 mx-auto" />
            </motion.button>
          ))}
        </div>

        <div className="mt-5 text-xs text-zinc-400">
          Always learning — currently deepening{" "}
          <span className="text-zinc-300">React performance</span> &{" "}
          <span className="text-zinc-300">AI-assisted workflows</span>.
        </div>
      </motion.div>
    </div>
  );
}
