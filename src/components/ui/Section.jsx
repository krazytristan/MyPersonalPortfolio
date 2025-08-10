import { motion } from "framer-motion";

export default function Section({ children, reducedMotion = false }) {
  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
      role="region"
    >
      {children}
    </motion.section>
  );
}
