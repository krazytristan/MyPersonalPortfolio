import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import GradientText from "../ui/GradientText";

/* tiny CSS helper for hiding scrollbars completely */
const softScrollCSS = `
.soft-scroll {
  overflow-y: auto;
  -ms-overflow-style: none; /* IE & Edge */
  scrollbar-width: none; /* Firefox */
}
.soft-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Lock body scroll when modal open */
body[data-modal-open="true"] {
  overflow: hidden !important;
}
`;


export default function ProjectsSection({ tags, filter, setFilter, projects }) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(() => (filter && filter !== "All" ? [filter] : []));
  const [sort, setSort] = useState("Newest");
  const [active, setActive] = useState(null);

  const openModal = (p) => setActive(p);
  const closeModal = () => setActive(null);

  useEffect(() => {
    if (!filter || filter === "All") setPicked([]);
    else setPicked([filter]);
  }, [filter]);

  const counts = useMemo(() => {
    const c = { All: projects.length };
    projects.forEach((p) => p.tags.forEach((t) => (c[t] = (c[t] || 0) + 1)));
    return c;
  }, [projects]);

  const handlePick = (t) => {
    if (t === "All") {
      setPicked([]);
      setFilter("All");
      return;
    }
    setPicked((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      setFilter(next.length === 0 ? "All" : next[0]);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = projects.filter((p) => {
      const byTags = picked.length === 0 || picked.every((t) => p.tags.includes(t));
      const byText =
        term === "" ||
        p.title.toLowerCase().includes(term) ||
        p.desc.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term));
      return byTags && byText;
    });
    if (sort === "A-Z") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [projects, picked, search, sort]);

  return (
    <>
      {/* inject once for this component */}
      <style>{softScrollCSS}</style>

      {/* fixed-height section; only grid area scrolls */}
      <div className="w-full flex flex-col h-[66vh] md:h-[68vh]">
        {/* header (non-scrolling) */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            <GradientText>Projects</GradientText>
          </h2>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="sr-only" htmlFor="search">Search projects</label>
            <input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, tag…"
              className="rounded-full bg-white/5 text-sm px-3 py-2 ring-1 ring-white/10 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
            />
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full bg-white/5 text-sm px-3 py-2 ring-1 ring-white/10 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
            >
              <option>Newest</option>
              <option>A-Z</option>
            </select>
          </div>
        </div>

        {/* filters (non-scrolling) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3" role="tablist" aria-label="Project filters">
          {["All", ...tags.filter((t) => t !== "All")].map((t) => {
            const activeChip = t === "All" ? picked.length === 0 : picked.includes(t);
            return (
              <button
                key={t}
                onClick={() => handlePick(t)}
                role="tab"
                aria-selected={activeChip}
                className={`group relative overflow-hidden px-3 py-2 rounded-full text-sm font-semibold ring-1 ring-white/15 transition ${
                  activeChip ? "bg-indigo-600 text-white ring-indigo-500" : "hover:bg-white/5"
                }`}
                title={`${t} (${counts[t] ?? 0})`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                  style={{
                    background:
                      "linear-gradient(120deg, transparent 20%, rgba(255,255,255,.12) 40%, transparent 60%)",
                    maskImage: "radial-gradient(120px 60px at 10% 50%, black 30%, transparent 60%)",
                  }}
                />
                <GradientText small>{t}</GradientText>
                <span className={`ml-2 inline-flex items-center justify-center text-[11px] px-1.5 py-0.5 rounded-full ${activeChip ? "bg-white/15" : "bg-white/5"}`}>
                  {counts[t] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* result count (non-scrolling) */}
        <p className="mb-2 text-xs text-zinc-400 text-center sm:text-left">
          Showing <span className="text-zinc-200">{filtered.length}</span> of{" "}
          <span className="text-zinc-200">{projects.length}</span>
        </p>

        {/* SCROLL AREA (auto-hiding scrollbar) */}
        <div
          role="region"
          aria-label="Projects list"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 soft-scroll"
        >
          {filtered.length === 0 ? (
            <EmptyState onClear={() => { setSearch(""); setPicked([]); setFilter("All"); }} />
          ) : (
            <LayoutGroup>
              <motion.div
                layout
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-4"
              >
                {filtered.map((p) => (
                  <ProjectCard key={p.title} p={p} onView={openModal} />
                ))}
              </motion.div>
            </LayoutGroup>
          )}
        </div>

        {/* MODAL */}
        <ProjectModal project={active} onClose={closeModal} />
      </div>
    </>
  );
}

/* ---------- Card ---------- */
function ProjectCard({ p, onView }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <motion.article
      layout
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.985 },
        show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45 } },
      }}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className="group relative rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/5 transition"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-60"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(99,102,241,.20), rgba(168,85,247,.20), rgba(34,211,238,.20), rgba(99,102,241,.20))",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: 1,
          filter: "blur(6px)",
        }}
      />
      <div className="h-44 overflow-hidden relative">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}
        <img
          ref={imgRef}
          src={p.cover}
          alt={`${p.title} cover`}
          className={`h-full w-full object-cover transition-transform duration-500 ${loaded ? "group-hover:scale-105" : "blur-sm"}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div
          aria-hidden
          className="absolute -inset-y-2 -left-1/2 w-1/2 rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent)" }}
        />
        <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition">
          {p.repo && (
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              className="mr-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs ring-1 ring-white/20 hover:bg-white/25"
            >
              Code
            </a>
          )}
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-indigo-600 text-white px-3 py-1.5 text-xs hover:bg-indigo-700"
            >
              Live
            </a>
          )}
        </div>
      </div>

      <div className="p-5 relative">
        <h3 className="text-lg font-semibold leading-snug">
          <GradientText small>{p.title}</GradientText>
        </h3>
        <p className="text-sm text-zinc-300 mt-1 line-clamp-3">{p.desc}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {p.tags.map((tg) => (
            <span key={tg} className="text-[11px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-200 ring-1 ring-indigo-500/30">
              {tg}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => onView?.(p)}
            className="inline-flex items-center gap-1 text-indigo-300 font-medium hover:underline"
            aria-label={`View details for ${p.title}`}
          >
            View <span aria-hidden>→</span>
          </button>
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
            <span className={`h-1.5 w-1.5 rounded-full ${p.live === false ? "bg-zinc-400" : "bg-emerald-400"}`} />
            {p.live === false ? "Demo" : "Live"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- Modal (adds auto-hiding scrollbar to detail pane) ---------- */
function ProjectModal({ project, onClose }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!project) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  useEffect(() => {
    if (project) {
      const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} details`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative w-[95vw] max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl ring-1 ring-white/15 bg-zinc-900"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <h3 className="font-semibold">
                <GradientText small>{project.title}</GradientText>
              </h3>
              <div className="flex items-center gap-2">
                {project.repo && (
                  <a href={project.repo} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20">
                    Code
                  </a>
                )}
                {project.link && (
                  <a href={project.link} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">
                    Live
                  </a>
                )}
                <button
                  ref={closeBtnRef}
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-60 md:h-full">
                <img src={project.cover} alt={`${project.title} cover`} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              </div>
              {/* detail pane gets soft-scroll too */}
              <div className="p-5 overflow-y-auto max-h-[60vh] md:max-h-[70vh] soft-scroll">
                <p className="text-sm text-zinc-300">{project.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags?.map((tg) => (
                    <span key={tg} className="text-[11px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-200 ring-1 ring-indigo-500/30">
                      {tg}
                    </span>
                  ))}
                </div>
                {project.stack && (
                  <div className="mt-4 text-sm">
                    <span className="text-zinc-400">Stack: </span>
                    <span className="text-zinc-200">{project.stack}</span>
                  </div>
                )}
                {project.role && (
                  <div className="mt-2 text-sm">
                    <span className="text-zinc-400">Role: </span>
                    <span className="text-zinc-200">{project.role}</span>
                  </div>
                )}
                {project.date && (
                  <div className="mt-2 text-sm">
                    <span className="text-zinc-400">Date: </span>
                    <span className="text-zinc-200">{project.date}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Empty ---------- */
function EmptyState({ onClear }) {
  return (
    <div className="text-center ring-1 ring-white/10 bg-white/5 rounded-2xl p-10">
      <p className="text-zinc-300">No projects match that search/filter.</p>
      <button
        onClick={onClear}
        className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 ring-1 ring-white/10"
      >
        Clear filters
      </button>
    </div>
  );
}
