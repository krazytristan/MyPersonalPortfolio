export default function SolarOverlay({ reducedMotion = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-[4] grid place-items-center" aria-hidden>
      <div
        className={`rounded-full opacity-20 ${reducedMotion ? "" : "animate-spin-slow"}`}
        style={{
          width: "120vmin",
          height: "120vmin",
          background:
            "conic-gradient(from 0deg, rgba(99,102,241,.25), transparent 25%, rgba(168,85,247,.25), transparent 50%, rgba(34,211,238,.25), transparent 75%, rgba(99,102,241,.25))",
          maskImage: "radial-gradient(closest-side, transparent 62%, black 63%)",
          WebkitMaskImage: "radial-gradient(closest-side, transparent 62%, black 63%)",
          filter: "blur(18px)",
        }}
      />
    </div>
  );
}
