import { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

export default function Universe({
  className = "fixed inset-0 -z-10 bg-black",
  reducedMotion,                // optional override; defaults to hook
  maxStars = 320,
  densityBase = 9000,           // smaller = more stars
  showComets = true,
  center = { x: 0.18, y: 0.36 },// solar center as fractions of viewport
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

    // --- Helpers ------------------------------------------------------------
    const setSize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap DPR to keep perf sane
      const w = Math.floor(window.innerWidth);
      const h = Math.floor(window.innerHeight);

      sizeRef.current = { w, h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // cache background gradient for current size
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#02040a");
      bg.addColorStop(1, "#05010a");
      gradientRef.current = bg;
    };

    const spawnBodies = () => {
      const { w, h } = sizeRef.current;
      const count = Math.min(maxStars, Math.floor((w * h) / densityBase));
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.9 + 0.1, // depth used for size/alpha
        tw: Math.random() * 1000,     // twinkle offset
      }));

      if (showComets) {
        cometsRef.current = Array.from({ length: 3 }, () => ({
          x: Math.random() * (w + 100),
          y: Math.random() * h * 0.6,
          vx: -(Math.random() * 0.8 + 0.4),
          vy: Math.random() * 0.3 + 0.05,
          life: Math.random() * 8 + 6,
        }));
      } else {
        cometsRef.current = [];
      }
    };

    // --- Init ---------------------------------------------------------------
    setSize();
    spawnBodies();
    timeRef.current.t0 = performance.now();
    timeRef.current.last = timeRef.current.t0;

    // --- Render loop --------------------------------------------------------
    const planets = [
      { r: 80,  size: 2.5, speed: 0.80, hue: 200 },
      { r: 140, size: 3.5, speed: 0.50, hue: 280 },
      { r: 210, size: 4.5, speed: 0.35, hue:  40 },
      { r: 270, size: 2.8, speed: 0.60, hue: 140 },
    ];

    const render = (now) => {
      if (!runningRef.current) return;
      const { w, h } = sizeRef.current;

      // time
      const last = timeRef.current.last;
      const dt = Math.min(0.05, (now - last) / 1000); // clamp to avoid huge jumps on resume
      timeRef.current.last = now;
      const t = (now - timeRef.current.t0) / 1000;

      // background
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = gradientRef.current;
      ctx.fillRect(0, 0, w, h);

      // stars (tiny rects; twinkle by alpha)
      for (const s of starsRef.current) {
        const tw = (Math.sin(t * 2 + s.tw) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.85 * tw * s.z})`;
        const sz = 1.1 * s.z;
        ctx.fillRect(s.x, s.y, sz, sz);
      }

      // comets
      if (cometsRef.current.length) {
        ctx.strokeStyle = "rgba(200,220,255,0.35)";
        ctx.lineWidth = 1;
        for (const c of cometsRef.current) {
          c.x += c.vx * (dt * 60); // scale by ~60fps units
          c.y += c.vy * (dt * 60);
          c.life -= dt;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(c.x - c.vx * 16, c.y - c.vy * 16);
          ctx.stroke();
          if (c.x < -50 || c.y > h + 50 || c.life <= 0) {
            c.x = w + Math.random() * 100;
            c.y = Math.random() * h * 0.6;
            c.life = Math.random() * 8 + 6;
          }
        }
      }

      // solar system
      const cx = w * center.x;
      const cy = h * center.y;

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

    const start = () => {
      if (runningRef.current || rm) return;
      runningRef.current = true;
      timeRef.current.last = performance.now();
      rafRef.current = requestAnimationFrame(render);
    };

    const stop = () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };

    // --- Events -------------------------------------------------------------
    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        setSize();
        spawnBodies();
      });
    };

    const onVis = () => {
      if (document.visibilityState === "visible") {
        start(); // resume
      } else {
        stop();  // pause
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    // kick off
    if (!rm) start();

    // cleanup
    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      starsRef.current = [];
      cometsRef.current = [];
      gradientRef.current = null;
    };
  }, [rm, maxStars, densityBase, showComets, center.x, center.y]);

  // If reduced motion is requested, render nothing (keeps layout consistent)
  if (rm) {
    return <div className={className} aria-hidden="true" />;
  }

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
