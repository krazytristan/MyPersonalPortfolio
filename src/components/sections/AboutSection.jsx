// src/components/sections/AboutSection.jsx
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import GradientText from "../ui/GradientText";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

/** Easing util */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/** 0→target counter that starts when visible, respects reduced motion */
function Counter({
  from = 0,
  to = 100,
  duration = 900,
  className = "",
  formatter = (v) => `${v}+`,
  triggerOnce = true,
  rootMargin = "0px 0px -20% 0px",
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const [value, setValue] = useState(from);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (triggerOnce && startedRef.current) continue;
          startedRef.current = true;

          const start = performance.now();
          const delta = to - from;

          const tick = (now) => {
            const raw = (now - start) / duration;
            const t = Math.min(1, raw);
            setValue(Math.round(from + easeOutCubic(t) * delta));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { rootMargin, threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [from, to, duration, reduced, triggerOnce, rootMargin]);

  return (
    <span ref={ref} className={className} aria-label={String(formatter(value))}>
      {formatter(value)}
    </span>
  );
}

const cardIn = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function Pill({ children }) {
  return (
    <span className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10 text-zinc-300">
      {children}
    </span>
  );
}

function FactCard({ emoji, title, sub, onClick }) {
  return (
    <motion.button
      type={onClick ? "button" : "button"}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      className="group rounded-xl p-4 bg-white/5 ring-1 ring-white/10 text-center outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 transition"
      title={sub}
      onClick={onClick}
    >
      {/* Emoji/icon */}
      <div className="text-2xl" aria-hidden>
        {emoji}
      </div>
      <div className="mt-1 font-semibold">
        <GradientText small>{title}</GradientText>
      </div>
      <div className="text-xs text-zinc-400">{sub}</div>
      <span className="block h-px w-0 group-hover:w-full transition-all duration-300 bg-indigo-400/70 mt-2 mx-auto" />
    </motion.button>
  );
}

export default function AboutSection({
  quickFacts = [],
  className = "",
  onFactClick, // optional: (index, fact) => void
}) {
  const reduced = usePrefersReducedMotion();
  const [tab, setTab] = useState("bio"); // "bio" | "timeline"
  const tablistId = useId();
  const bioPanelId = useId();
  const timePanelId = useId();

  // defensive: ensure array of objects with {emoji,title,sub}
  const facts = useMemo(
    () =>
      Array.isArray(quickFacts)
        ? quickFacts.filter(Boolean).slice(0, 12)
        : [],
    [quickFacts]
  );

  const changeTab = (next) => setTab(next);

  const onTabsKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const order = ["bio", "timeline"];
    const idx = order.indexOf(tab);
    const next =
      e.key === "ArrowRight"
        ? order[(idx + 1) % order.length]
        : order[(idx - 1 + order.length) % order.length];
    setTab(next);
  };

  return (
    <div className={`grid md:grid-cols-2 gap-8 ${className}`}>
      {/* LEFT: Bio / Timeline */}
      <motion.div
        variants={cardIn}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="rounded-2xl p-6 ring-1 ring-white/10 bg-white/5 relative overflow-hidden"
      >
        {/* soft accent */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(99,102,241,.22), rgba(0,0,0,0))",
            filter: "blur(14px)",
          }}
        />
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            <GradientText small>About</GradientText>
          </h3>

          {/* Tabs */}
          <div
            role="tablist"
            id={tablistId}
            aria-label="About tabs"
            onKeyDown={onTabsKeyDown}
            className="flex rounded-full bg-white/5 ring-1 ring-white/10 p-1 text-xs"
          >
            {[
              { key: "bio", panelId: bioPanelId },
              { key: "timeline", panelId: timePanelId },
            ].map(({ key, panelId }) => {
              const selected = tab === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId}
                  id={`${tablistId}-${key}`}
                  onClick={() => changeTab(key)}
                  className={`px-3 py-1 rounded-full transition ${
                    selected
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-white/10 text-zinc-300"
                  }`}
                >
                  {key[0].toUpperCase() + key.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panels */}
        <div className="mt-4">
          {tab === "bio" ? (
            <div
              id={bioPanelId}
              role="tabpanel"
              aria-labelledby={`${tablistId}-bio`}
              className="space-y-4"
            >
              <p className="text-zinc-300">
                Tech-savvy educator and full-stack developer focused on building
                useful, beautiful tools. I turn fuzzy ideas into clean,
                accessible experiences—mostly with React, Node/PHP, Tailwind,
                and a dash of AI where it helps.
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                {["Design→Dev", "Dashboards", "Automations", "PDF/Email", "Accessibility"].map(
                  (t) => (
                    <Pill key={t}>{t}</Pill>
                  )
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-center">
                  <div className="text-2xl font-extrabold leading-none">
                    <GradientText small>
                      <Counter to={5} />
                    </GradientText>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    years coding
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-center">
                  <div className="text-2xl font-extrabold leading-none">
                    <GradientText small>
                      <Counter to={30} />
                    </GradientText>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    projects shipped
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-center">
                  <div className="text-2xl font-extrabold leading-none">
                    <GradientText small>
                      <Counter
                        to={500}
                        formatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(1)}k+` : `${v}+`
                        }
                      />
                    </GradientText>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    students taught
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              id={timePanelId}
              role="tabpanel"
              aria-labelledby={`${tablistId}-timeline`}
              className="space-y-3 text-sm"
            >
              {[
                {
                  color: "bg-emerald-400",
                  label: "2018–Now:",
                  text:
                    "Teaching AI Fundamentals, OOP (C++), Software Engineering.",
                },
                {
                  color: "bg-indigo-400",
                  label: "Recent:",
                  text: "iLab System, Barangay Info System, AMATrack.",
                },
                {
                  color: "bg-fuchsia-400",
                  label: "Focus:",
                  text: "React performance, AI-assisted workflows, clean UX.",
                },
              ].map((row) => (
                <div key={row.label + row.text} className="flex gap-3">
                  <span
                    className={`mt-1 h-2 w-2 rounded-full ${row.color}`}
                    aria-hidden
                  />
                  <div className="text-zinc-300">
                    <span className="font-semibold text-white">
                      {row.label}
                    </span>{" "}
                    {row.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
          {facts.length === 0 ? (
            <div className="col-span-full text-xs text-zinc-400">
              No facts yet. Pass an array like{" "}
              <code className="text-zinc-300">
                {"[{ emoji: '💻', title: 'Stack', sub: 'React/PHP' }, ...]"}
              </code>
              .
            </div>
          ) : (
            facts.map((c, i) => (
              <FactCard
                key={`${c.title}-${i}`}
                emoji={c.emoji ?? "📌"}
                title={c.title ?? "Untitled"}
                sub={c.sub ?? ""}
                onClick={
                  onFactClick ? () => onFactClick(i, c) : undefined
                }
              />
            ))
          )}
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
