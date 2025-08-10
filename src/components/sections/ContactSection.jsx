import { useState } from "react";
import { motion } from "framer-motion";
import GradientText from "../ui/GradientText";
import ContactCard from "./ContactCard";

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const email = "trstnjorge@gmail.com";

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
  };

  return (
    <section className="w-full max-w-5xl mx-auto text-center">
      <header className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          <GradientText>Contact</GradientText>
        </h2>
        <p className="text-zinc-300 mt-2">
          Let’s connect! Reach out via email or socials below.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6 text-left">
        {/* LEFT: Direct + Socials (glass card to match ContactCard) */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative rounded-2xl p-6 sm:p-7 overflow-hidden"
        >
          {/* gradient border glow */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div
              className="absolute -inset-px rounded-2xl opacity-60"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, rgba(99,102,241,.35), rgba(168,85,247,.35), rgba(34,211,238,.35), rgba(99,102,241,.35))",
                filter: "blur(8px)",
              }}
            />
          </div>

          {/* card surface */}
          <div className="absolute inset-0 rounded-2xl bg-zinc-900/70 backdrop-blur-md ring-1 ring-white/10" />

          <div className="relative">
            <h3 className="font-semibold mb-5">
              <GradientText small>Direct</GradientText>
            </h3>

            {/* Email row */}
            <div className="flex items-center gap-3 mb-3 rounded-xl bg-zinc-900/50 ring-1 ring-white/10 px-4 py-3">
              <span className="text-xl" aria-hidden>📧</span>
              <a
                className="text-indigo-300 underline underline-offset-2 decoration-indigo-400/60 hover:text-indigo-200 break-all"
                href={`mailto:${email}`}
                aria-label={`Email ${email}`}
              >
                {email}
              </a>
              <button
                onClick={copyEmail}
                className="ml-auto text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 ring-1 ring-indigo-300/30 text-indigo-200 transition"
                aria-label="Copy email to clipboard"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>

            {/* GitHub row */}
            <a
              href="https://github.com/krazytristan"
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub profile"
              className="flex items-center gap-3 mb-3 rounded-xl bg-zinc-900/50 ring-1 ring-white/10 px-4 py-3 hover:bg-zinc-900/60 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80" aria-hidden>
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.2-3.37-1.2c-.46-1.16-1.12-1.47-1.12-1.47c-.92-.64.07-.63.07-.63c1.02.07 1.56 1.05 1.56 1.05c.9 1.55 2.36 1.1 2.94.84c.09-.66.35-1.1.63-1.35c-2.22-.25-4.55-1.11-4.55-4.95c0-1.09.39-1.98 1.03-2.68c-.1-.25-.45-1.27.1-2.65c0 0 .84-.27 2.75 1.02c.8-.22 1.66-.33 2.51-.33s1.71.11 2.51.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.38.2 2.4.1 2.65c.64.7 1.03 1.59 1.03 2.68c0 3.85-2.34 4.7-4.57 4.95c.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
                />
              </svg>
              <span className="text-indigo-300 underline underline-offset-2 decoration-indigo-400/60 hover:text-indigo-200">
                github.com/krazytristan
              </span>
            </a>

            {/* LinkedIn row */}
            <a
              href="https://linkedin.com/in/tristan-jorge-cuartero"
              target="_blank"
              rel="noreferrer"
              aria-label="Open LinkedIn profile"
              className="flex items-center gap-3 rounded-xl bg-zinc-900/50 ring-1 ring-white/10 px-4 py-3 hover:bg-zinc-900/60 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80" aria-hidden>
                <path
                  fill="currentColor"
                  d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04c-1.85 0-2.14 1.45-2.14 2.95v5.66H9.36V9.75h3.41v1.46h.05c.47-.9 1.63-1.85 3.36-1.85c3.59 0 4.26 2.36 4.26 5.42v5.67ZM5.34 8.29a2.06 2.06 0 1 1 0-4.12a2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9.75h3.56v10.7Z"
                />
              </svg>
              <span className="text-indigo-300 underline underline-offset-2 decoration-indigo-400/60 hover:text-indigo-200">
                linkedin.com/in/tristan-jorge-cuartero
              </span>
            </a>
          </div>
        </motion.div>

        {/* RIGHT: Matches (your updated) ContactCard glass style */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <ContactCard />
        </motion.div>
      </div>
    </section>
  );
}
