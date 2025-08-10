// src/hooks/usePrefersReducedMotion.js
import { useEffect, useState } from "react";

/**
 * usePrefersReducedMotion
 * - Safe on SSR (checks window & matchMedia)
 * - Fallbacks for older Safari (addListener/removeListener)
 * - Optional: mirrors state to <html data-reduced-motion="true|false">
 *
 * @param {object} options
 * @param {boolean} [options.defaultValue=false]  Value to use during SSR before hydration
 * @param {boolean} [options.mirrorToHtml=true]   Whether to set data attribute on <html>
 *
 * @returns {boolean} reduced - true if user prefers reduced motion
 */
export default function usePrefersReducedMotion({
  defaultValue = false,
  mirrorToHtml = true,
} = {}) {
  const [reduced, setReduced] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value from media query
    setReduced(!!mq.matches);

    // Listener with cross-browser support
    const onChange = (e) => setReduced(!!(e.matches ?? mq.matches));

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else if (typeof mq.addListener === "function") {
      // Safari < 14
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, []);

  // Optional: expose a data attribute for quick CSS hooks or debugging
  useEffect(() => {
    if (!mirrorToHtml || typeof document === "undefined") return;
    const html = document.documentElement;
    html.setAttribute("data-reduced-motion", String(reduced));
    return () => html.removeAttribute("data-reduced-motion");
  }, [reduced, mirrorToHtml]);

  return reduced;
}
