import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

/* styles & hooks */
import globalStyles from "../styles/globalStyles";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/* UI wrappers */
import Section from "../components/ui/Section";
import Flash from "../components/ui/Flash";
import GradientText from "../components/ui/GradientText";

/* Visual layers */
import Universe from "../components/visuals/Universe";
import Aurora from "../components/visuals/Aurora";
import Astronauts from "../components/visuals/Astronauts";
import SolarOverlay from "../components/visuals/SolarOverlay";

/* Sections */
import HomeSection from "../components/sections/HomeSection";
import AboutSection from "../components/sections/AboutSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import SkillsSection from "../components/sections/SkillsSection";
import ContactSection from "../components/sections/ContactSection";
import ContactCard from "../components/sections/ContactCard";

/* Modal */
import ResumeModal from "../components/modals/ResumeModal";

/* data */
import projectsData from "../data/projects";

export default function Portfolio() {
  /* ----------------------------- NAV / SECTION STATE ---------------------------- */
  const sections = ["home", "about", "projects", "skills", "contact"];

  const hashToSection = (h) => {
    const clean = (h || "").replace("#", "");
    return sections.includes(clean) ? clean : "home";
  };

  const [active, setActive] = useState(() =>
    typeof window !== "undefined" ? hashToSection(window.location.hash) : "home"
  );
  const [scrolled, setScrolled] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [openNav, setOpenNav] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  // Single-screen stage (no page scroll)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Scroll shadow on navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync section with URL hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => setActive(hashToSection(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextHash = `#${active}`;
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
  }, [active]);

  const openSection = (id) => {
    setOpenNav(false);
    setActive(id);
    setFlashKey((k) => k + 1); // flash on change
  };

  // Keyboard shortcuts (1..5, ← →)
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const idx = sections.indexOf(active);
      if (e.key === "ArrowRight") {
        openSection(sections[(idx + 1) % sections.length]);
      } else if (e.key === "ArrowLeft") {
        openSection(sections[(idx - 1 + sections.length) % sections.length]);
      } else if (/^[1-5]$/.test(e.key)) {
        openSection(sections[parseInt(e.key, 10) - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  /* -------------------------------- QUICK FACTS -------------------------------- */
  const quickFacts = useMemo(
    () => [
      { emoji: "👨‍💻", title: "5+ Years Coding", sub: "Full Stack, AI/ML, Web Apps" },
      { emoji: "🎓", title: "Educator", sub: "Teaching IT & CS since 2018" },
      { emoji: "🚩", title: "Batangas, PH", sub: "Based in Lipa City" },
    ],
    []
  );

  /* --------------------------------- PROJECTS --------------------------------- */
  const [filter, setFilter] = useState("All");
  const tags = ["All", ...Array.from(new Set(projectsData.flatMap((p) => p.tags)))];
  const projects = projectsData.filter((p) => filter === "All" || p.tags.includes(filter));

  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className="min-h-screen h-screen bg-black text-zinc-100 relative overflow-hidden select-none"
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
    >
      {/* Global style tag for keyframes */}
      <style>{globalStyles}</style>

      {/* TOP GRADIENT BAR */}
      <div
        className="fixed top-0 inset-x-0 z-[60] h-[3px] animate-gradient-x"
        style={{
          background:
            "linear-gradient(90deg, #22d3ee, #6366f1, #a855f7, #f472b6, #22d3ee)",
        }}
        aria-hidden
      />

      {/* Visual background layers */}
      <Universe />
      <Aurora active={active} cursor={cursor} reducedMotion={reducedMotion} />
      <Astronauts reducedMotion={reducedMotion} />
      <SolarOverlay reducedMotion={reducedMotion} />

      {/* Flash between sections */}
      <Flash key={flashKey} reducedMotion={reducedMotion} />

      {/* Skip link */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] bg-black text-white px-4 py-2 rounded-md"
      >
        Skip to content
      </a>

      {/* NAVBAR */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-all ${scrolled ? "mt-0" : "mt-2"}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div
            className={`rounded-2xl backdrop-blur ${
              scrolled ? "bg-white/10 shadow-lg ring-1 ring-white/10" : "bg-white/5 ring-1 ring-transparent"
            }`}
          >
            <div className="px-5 py-3 flex items-center justify-between">
              <button
                onClick={() => openSection("home")}
                className="group inline-flex items-center gap-2"
                aria-label="Go to home"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow">
                  TJ
                </span>
                <span className="text-lg font-extrabold tracking-wide">
                  <GradientText>Tristan Jorge Cuartero</GradientText>
                </span>
              </button>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1 text-sm font-semibold" aria-label="Primary">
                {sections.map((id) => (
                  <button
                    key={id}
                    onClick={() => openSection(id)}
                    className={`relative px-3 py-2 rounded-lg transition hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
                      active === id ? "text-indigo-300 bg-white/5" : ""
                    }`}
                    aria-current={active === id ? "page" : undefined}
                  >
                    <GradientText small>{id[0].toUpperCase() + id.slice(1)}</GradientText>
                    {active === id && (
                      <span
                        className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-indigo-400/80"
                        aria-hidden
                      />
                    )}
                  </button>
                ))}
                <button
                  onClick={() => setResumeOpen(true)}
                  className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  📄 Resume
                </button>
              </nav>

              {/* Mobile controls */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setOpenNav((s) => !s)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/10"
                  aria-expanded={openNav}
                  aria-controls="mobile-nav"
                  aria-label="Menu"
                >
                  {openNav ? "✕" : "☰"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sheet */}
        <AnimatePresence>
          {openNav && (
            <nav id="mobile-nav" className="md:hidden mx-auto max-w-7xl px-4 mt-2" aria-label="Mobile">
              <div className="rounded-2xl bg-black/70 backdrop-blur p-3 shadow-lg ring-1 ring-white/10">
                <div className="grid grid-cols-3 gap-2">
                  {sections.map((id) => (
                    <button
                      key={id}
                      onClick={() => openSection(id)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                        active === id ? "text-indigo-300 bg:white/5" : "hover:bg-white/5"
                      }`}
                    >
                      <GradientText small>{id[0].toUpperCase() + id.slice(1)}</GradientText>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setOpenNav(false);
                      setResumeOpen(true);
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/5"
                  >
                    <GradientText small>Resume</GradientText>
                  </button>
                </div>
              </div>
            </nav>
          )}
        </AnimatePresence>
      </header>
      <div className="h-24" />

      {/* SECTION STAGE (no scroll; crossfade) */}
      <main id="content" className="mx-auto max-w-6xl px-4 h-[calc(100vh-7.5rem)] grid place-items-center">
        <AnimatePresence mode="wait">
          {active === "home" && (
            <Section key="home" reducedMotion={reducedMotion}>
              <HomeSection
                onResume={() => setResumeOpen(true)}
                onGoProjects={() => openSection("projects")}
              />
            </Section>
          )}
          {active === "about" && (
            <Section key="about" reducedMotion={reducedMotion}>
              <AboutSection
                quickFacts={[
                  { emoji: "👨‍💻", title: "5+ Years Coding", sub: "Full Stack, AI/ML, Web Apps" },
                  { emoji: "🎓", title: "Educator", sub: "Teaching IT & CS since 2018" },
                  { emoji: "🚩", title: "Batangas, PH", sub: "Based in Lipa City" },
                ]}
              />
            </Section>
          )}
          {active === "projects" && (
            <Section key="projects" reducedMotion={reducedMotion}>
              <ProjectsSection
                tags={tags}
                filter={filter}
                setFilter={setFilter}
                projects={projects}
              />
            </Section>
          )}
          {active === "skills" && (
            <Section key="skills" reducedMotion={reducedMotion}>
              <SkillsSection />
            </Section>
          )}
          {active === "contact" && (
            <Section key="contact" reducedMotion={reducedMotion}>
              <ContactSection />
            </Section>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="pointer-events-none select-none text-center py-3 absolute bottom-0 inset-x-0 text-xs opacity-70">
        © {new Date().getFullYear()} Tristan Jorge Cuartero
      </footer>

      {/* RESUME PREVIEW MODAL */}
      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </div>
  );
}
