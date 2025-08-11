// src/hooks/usePrefersReducedMotion.js
import { useEffect, useRef, useState } from "react";

/**
 * usePrefersReducedMotion
 *
 * Options:
 * - defaultValue: boolean used during SSR before hydration.
 * - mirrorToHtml: mirror state to <html> with data-attr + optional class toggle.
 * - attrName:     attribute name used when mirroring to <html>.
 * - classWhenReduced: class to add on <html> when reduced === true.
 * - force:        explicitly force true/false and ignore system (good for a user setting).
 * - storageKey:   persist override in localStorage and sync across tabs.
 *
 * Returns: boolean (true if reduced motion is preferred/effective)
 */
export default function usePrefersReducedMotion({
  defaultValue = false,
  mirrorToHtml = true,
  attrName = "data-reduced-motion",
  classWhenReduced = "reduced-motion",
  force,                   // boolean | undefined
  storageKey,              // e.g., "motion-pref"
} = {}) {
  const isClient = typeof window !== "undefined";
  const [reduced, setReduced] = useState(() => {
    // 1) explicit force via options
    if (typeof force === "boolean") return force;

    // 2) persisted override
    if (isClient && storageKey) {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === "true") return true;
      if (raw === "false") return false;
    }

    // 3) SSR-safe default until we can read matchMedia
    return defaultValue;
  });

  const mediaQueryRef = useRef(null);

  // Keep <html> in sync (attribute + optional class)
  useEffect(() => {
    if (!mirrorToHtml || typeof document === "undefined") return;
    const html = document.documentElement;

    html.setAttribute(attrName, String(reduced));
    if (classWhenReduced) {
      html.classList.toggle(classWhenReduced, !!reduced);
    }

    return () => {
      html.removeAttribute(attrName);
      if (classWhenReduced) {
        html.classList.remove(classWhenReduced);
      }
    };
  }, [reduced, mirrorToHtml, attrName, classWhenReduced]);

  // Persist explicit choice if storageKey is provided AND `force` is set
  useEffect(() => {
    if (!isClient || !storageKey) return;
    if (typeof force === "boolean") {
      window.localStorage.setItem(storageKey, String(force));
    }
  }, [force, storageKey, isClient]);

  // Cross-tab sync for persisted override
  useEffect(() => {
    if (!isClient || !storageKey) return;
    const onStorage = (e) => {
      if (e.key === storageKey) {
        if (e.newValue === "true") setReduced(true);
        else if (e.newValue === "false") setReduced(false);
        else if (e.newValue == null) {
          // cleared: fall back to system if available
          if (mediaQueryRef.current) {
            setReduced(!!mediaQueryRef.current.matches);
          } else {
            setReduced(defaultValue);
          }
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey, defaultValue, isClient]);

  // System preference listener (ignored if `force` provided)
  useEffect(() => {
    if (!isClient || typeof force === "boolean" || !("matchMedia" in window)) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQueryRef.current = mq;

    // initialize from system
    setReduced(!!mq.matches);

    const onChange = (e) => setReduced(!!(e.matches ?? mq.matches));

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else if (typeof mq.addListener === "function") {
      // Safari < 14
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, [force, isClient]);

  return reduced;
}
