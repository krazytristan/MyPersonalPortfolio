import { useEffect, useRef } from "react";

export default function Universe() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const starsRef = useRef([]);
  const cometsRef = useRef([]);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = (canvas.width = window.innerWidth);
      h = (canvas.height = window.innerHeight);
      spawnBodies();
    };

    const spawnBodies = () => {
      const count = Math.min(320, Math.floor((w * h) / 9000));
      starsRef.current = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.9 + 0.1,
        tw: Math.random() * 1000,
      }));
      cometsRef.current = new Array(3).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        vx: -(Math.random() * 0.8 + 0.4),
        vy: Math.random() * 0.3 + 0.05,
        life: Math.random() * 8 + 6,
      }));
    };
    spawnBodies();

    const planets = [
      { r: 80, size: 2.5, speed: 0.8, hue: 200 },
      { r: 140, size: 3.5, speed: 0.5, hue: 280 },
      { r: 210, size: 4.5, speed: 0.35, hue: 40 },
      { r: 270, size: 2.8, speed: 0.6, hue: 140 },
    ];

    const render = () => {
      const t = (Date.now() - startRef.current) / 1000;
      ctx.clearRect(0, 0, w, h);

      // space gradient
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#02040a");
      bg.addColorStop(1, "#05010a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // stars
      for (const s of starsRef.current) {
        const tw = (Math.sin(t * 2 + s.tw) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.85 * tw * s.z})`;
        ctx.fillRect(s.x, s.y, 1.1 * s.z, 1.1 * s.z);
      }

      // comets
      cometsRef.current.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.life -= 0.016;
        ctx.strokeStyle = "rgba(200,220,255,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * 16, c.y - c.vy * 16);
        ctx.stroke();
        if (c.x < -50 || c.y > h + 50 || c.life <= 0) {
          c.x = w + Math.random() * 100;
          c.y = Math.random() * h * 0.6;
          c.life = Math.random() * 8 + 6;
        }
      });

      // solar system center (left)
      const cx = w * 0.18,
        cy = h * 0.36;
      ctx.shadowBlur = 25;
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      planets.forEach((p, i) => {
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
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-black" aria-hidden />;
}
