// src/hooks/usePrefersReducedMotion.js
import { useEffect, useRef, useState } from "react";

/**
 * usePrefersReducedMotion (hardened)
 *
 * Priority: force -> localStorage -> <html data-reduced-motion> -> matchMedia -> defaultValue
 * Mirrors to <html> safely (no cleanup removal, avoids multi-instance conflicts).
 * Re-syncs on pageshow/visibilitychange to handle bfcache + tab resume.
 */
export default function usePrefersReducedMotion({
  defaultValue = false,
  mirrorToHtml = true,
  attrName = "data-reduced-motion",
  classWhenReduced = "reduced-motion",
  force,                // boolean | undefined
  storageKey,           // e.g., "motion-pref"
} = {}) {
  const isClient = typeof window !== "undefined" && typeof document !== "undefined";
  const mqRef = useRef(null);

  // Helper to safely read localStorage
  const readStored = () => {
    if (!isClient || !storageKey) return null;
    try {
      const v = window.localStorage.getItem(storageKey);
      if (v === "true") return true;
      if (v === "false") return false;
    } catch {}
    return null;
  };

  // Helper to read <html data-reduced-motion>
  const readHtmlAttr = () => {
    if (!isClient) return null;
    try {
      const html = document.documentElement;
      const v = html.getAttribute(attrName);
      if (v === "true") return true;
      if (v === "false") return false;
    } catch {}
    return null;
  };

  // Helper to read system media query
  const readSystem = () => {
    if (!isClient || !("matchMedia" in window)) return null;
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mqRef.current = mq;
      return !!mq.matches;
    } catch {}
    return null;
  };

  // Initial value: force -> storage -> html attr -> system -> default
  const [reduced, setReduced] = useState(() => {
    if (typeof force === "boolean") return force;
    const stored = readStored();      if (stored !== null) return stored;
    const fromHtml = readHtmlAttr();  if (fromHtml !== null) return fromHtml;
    const system = readSystem();      if (system !== null) return system;
    return defaultValue;
  });

  // Mirror to <html> (no removal on unmount; last writer wins)
  useEffect(() => {
    if (!mirrorToHtml || !isClient) return;
    const html = document.documentElement;
    try {
      html.setAttribute(attrName, String(!!reduced));
      if (classWhenReduced) html.classList.toggle(classWhenReduced, !!reduced);
    } catch {}
  }, [reduced, mirrorToHtml, attrName, classWhenReduced, isClient]);

  // Persist override if caller explicitly forces a value
  useEffect(() => {
    if (!isClient || !storageKey) return;
    if (typeof force === "boolean") {
      try { window.localStorage.setItem(storageKey, String(force)); } catch {}
    }
  }, [force, storageKey, isClient]);

  // Cross-tab sync when using storage
  useEffect(() => {
    if (!isClient || !storageKey) return;
    const onStorage = (e) => {
      if (e.key !== storageKey) return;
      if (e.newValue === "true") setReduced(true);
      else if (e.newValue === "false") setReduced(false);
      else {
        // cleared: fall back to system or html attr
        const htmlVal = readHtmlAttr();
        if (htmlVal !== null) setReduced(htmlVal);
        else {
          const sys = readSystem();
          setReduced(sys !== null ? sys : defaultValue);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey, defaultValue, isClient]);

  // System preference listener (ignored if force provided)
  useEffect(() => {
    if (!isClient || typeof force === "boolean" || !("matchMedia" in window)) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mqRef.current = mq;
    // sync on mount (in case initial state came from html/storage)
    setReduced((prev) => (typeof prev === "boolean" ? prev : !!mq.matches));

    const onChange = (e) => setReduced(!!(e?.matches ?? mq.matches));
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, [force, isClient]);

  // Re-sync on pageshow/visibilitychange (bfcache / resume)
  useEffect(() => {
    if (!isClient || typeof force === "boolean") return;

    const resync = () => {
      // Prefer explicit storage if present
      const stored = readStored();
      if (stored !== null) { setReduced(stored); return; }
      // Then html attr (set very early in index.html)
      const fromHtml = readHtmlAttr();
      if (fromHtml !== null) { setReduced(fromHtml); return; }
      // Then system
      const sys = readSystem();
      if (sys !== null) { setReduced(sys); return; }
      // Fallback
      setReduced(defaultValue);
    };

    const onShow = () => resync();
    const onVis  = () => { if (document.visibilityState === "visible") resync(); };

    window.addEventListener("pageshow", onShow);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [force, defaultValue, isClient]);

  return reduced;
}
