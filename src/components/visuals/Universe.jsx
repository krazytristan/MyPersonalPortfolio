// src/components/visuals/Universe.jsx
import { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

export default function Universe({
  className = "fixed inset-0 -z-10 bg-black",
  reducedMotion,
  maxStars = 320,
  densityBase = 9000,
  showComets = true,
  center = { x: 0.18, y: 0.36 },
}) {
  const prefersReduced = usePrefersReducedMotion();
  const rm = typeof reducedMotion === "boolean" ? reducedMotion : prefersReduced;

  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  const starsRef = useRef([]);
  const cometsRef = useRef([]);
  const gradientRef = useRef(null);

  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const timeRef = useRef({ t0: 0, last: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const setSize = () => {
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      const w = Math.max(1, Math.floor(window.innerWidth));
      const h = Math.max(1, Math.floor(window.innerHeight));
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#02040a");
      bg.addColorStop(1, "#05010a");
      gradientRef.current = bg;
    };

    const makeStars = () => {
      const { w, h } = sizeRef.current;
      const safeMax = clamp(Math.floor(maxStars), 0, 2000);
      const safeDen = clamp(Math.floor(densityBase) || 9000, 1000, 200000);
      const count = Math.min(safeMax, Math.floor((w * h) / safeDen));
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.9 + 0.1,
        tw: Math.random() * 1000,
      }));
    };

    const respawnComet = (c, w, h) => {
      c.x = w + Math.random() * 100;
      c.y = Math.random() * h * 0.6;
      c.vx = -(Math.random() * 0.8 + 0.4);
      c.vy = Math.random() * 0.3 + 0.05;
      c.life = Math.random() * 8 + 6;
    };

    const makeComets = () => {
      if (!showComets) {
        cometsRef.current = [];
        return;
      }
      const { w, h } = sizeRef.current;
      cometsRef.current = Array.from({ length: 3 }, () => {
        const c = { x: 0, y: 0, vx: 0, vy: 0, life: 0 };
        respawnComet(c, w, h);
        c.x += Math.random() * 100;
        return c;
      });
    };

    const paintBackground = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = gradientRef.current || "#000";
      ctx.fillRect(0, 0, w, h);
    };

    const paintStatic = () => {
      // one-shot render for reduced motion
      setSize();
      makeStars();

      // background
      paintBackground();

      // stars (no twinkle)
      for (const s of starsRef.current) {
        ctx.fillStyle = `rgba(255,255,255,${0.35 * s.z + 0.1})`;
        const sz = 1.1 * s.z;
        ctx.fillRect(s.x, s.y, sz, sz);
      }

      // simple static planets
      const { w, h } = sizeRef.current;
      const cx = w * clamp(center.x ?? 0.18, 0, 1);
      const cy = h * clamp(center.y ?? 0.36, 0, 1);

      const planets = [
        { r: 80, size: 2.5, hue: 200 },
        { r: 140, size: 3.5, hue: 280 },
        { r: 210, size: 4.5, hue: 40 },
        { r: 270, size: 2.8, hue: 140 },
      ];

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.stroke();

        // fixed angle per planet for static view
        const ang = i * 1.3;
        const px = cx + Math.cos(ang) * p.r;
        const py = cy + Math.sin(ang) * p.r;
        ctx.fillStyle = `hsl(${p.hue} 80% 65% / 0.9)`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Animated render loop
    const planetsAnim = [
      { r: 80, size: 2.5, speed: 0.8, hue: 200 },
      { r: 140, size: 3.5, speed: 0.5, hue: 280 },
      { r: 210, size: 4.5, speed: 0.35, hue: 40 },
      { r: 270, size: 2.8, speed: 0.6, hue: 140 },
    ];

    const render = (now) => {
      if (!runningRef.current) return;

      // Self-heal if size or gradient missing
      let { w, h } = sizeRef.current;
      if (!w || !h || !gradientRef.current) {
        setSize();
        makeStars();
        if (!rm) makeComets();
        ({ w, h } = sizeRef.current);
      }

      const last = timeRef.current.last;
      const dt = Math.min(0.05, (now - last) / 1000);
      timeRef.current.last = now;
      const t = (now - timeRef.current.t0) / 1000;

      paintBackground();

      // stars (twinkle)
      for (const s of starsRef.current) {
        const tw = (Math.sin(t * 2 + s.tw) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.85 * tw * s.z})`;
        const sz = 1.1 * s.z;
        ctx.fillRect(s.x, s.y, sz, sz);
      }

      // comets
      if (!rm && cometsRef.current.length) {
        ctx.strokeStyle = "rgba(200,220,255,0.35)";
        ctx.lineWidth = 1;
        for (const c of cometsRef.current) {
          c.x += c.vx * (dt * 60);
          c.y += c.vy * (dt * 60);
          c.life -= dt;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(c.x - c.vx * 16, c.y - c.vy * 16);
          ctx.stroke();
          if (c.x < -50 || c.y > h + 50 || c.life <= 0) respawnComet(c, w, h);
        }
      }

      // planets
      const cx = w * clamp(center.x ?? 0.18, 0, 1);
      const cy = h * clamp(center.y ?? 0.36, 0, 1);

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < planetsAnim.length; i++) {
        const p = planetsAnim[i];
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.stroke();

        const ang = t * p.speed + i * 1.3;
        const px = cx + Math.cos(ang) * p.r;
        const py = cy + Math.sin(ang) * p.r;
        ctx.fillStyle = `hsl(${p.hue} 80% 65% / 0.9)`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    // Start/stop depending on reduced motion
    const start = () => {
      runningRef.current = true;
      timeRef.current.last = performance.now();
      rafRef.current = requestAnimationFrame(render);
    };

    const stop = () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    // Events
    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        setSize();
        makeStars();
        if (!rm) makeComets();
        if (rm) paintStatic(); // repaint static
      });
    };
    const onShow = () => {
      onResize();
      if (rm) paintStatic();
      else {
        stop();
        start(); // kick rAF after bfcache
      }
    };
    const onHide = () => stop();
    const onVis = () => { if (document.visibilityState === "visible") onShow(); else onHide(); };

    window.addEventListener("resize", onResize);
    window.addEventListener("pageshow", onShow);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVis);

    // init
    setSize();
    makeStars();
    if (!rm) makeComets();
    timeRef.current.t0 = performance.now();
    timeRef.current.last = timeRef.current.t0;

    if (rm) {
      // static frame only
      paintStatic();
    } else {
      start();
    }

    // cleanup
    return () => {
      stop();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVis);
      starsRef.current = [];
      cometsRef.current = [];
      gradientRef.current = null;
    };
  }, [rm, maxStars, densityBase, showComets, center.x, center.y]);

  // Always render a canvas; we’ll decide inside effect whether it animates.
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
