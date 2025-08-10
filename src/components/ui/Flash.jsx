import { motion } from "framer-motion";

export default function Flash({ reducedMotion = false }) {
  return (
    <motion.span
      className="fixed inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={reducedMotion ? { opacity: 0 } : { opacity: [0, 0.25, 0] }}
      transition={{ duration: 0.35 }}
      style={{
        background:
          "radial-gradient(600px 600px at 50% 40%, rgba(255,255,255,0.18), rgba(0,0,0,0))",
      }}
      aria-hidden
    />
  );
}
