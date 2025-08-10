import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GradientText from "../ui/GradientText";
import HTMLResume from "./HTMLResume";

export default function ResumeModal({ open, onClose }) {
  const [pdfExists, setPdfExists] = useState(true);

  useEffect(() => {
    if (!open) return;
    fetch("/resume.pdf", { method: "HEAD" })
      .then((r) => setPdfExists(r.ok))
      .catch(() => setPdfExists(false));
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] grid place-items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={onClose} />
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          className="relative w-[95vw] max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden ring-1 ring-white/15 bg-black"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <h3 className="font-semibold">
              <GradientText small>Resume Preview</GradientText>
            </h3>
            <div className="flex items-center gap-2">
              {pdfExists && (
                <a
                  href="/resume.pdf"
                  download
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  Download PDF
                </a>
              )}
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20"
              >
                Print / Save as PDF
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
          <div className="bg-zinc-900">
            {pdfExists ? <iframe title="Resume" src="/resume.pdf" className="w-full h-[75vh]" /> : <HTMLResume />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
