export default function GradientText({
  children,
  small = false,
  colors = ["#f0abfc", "#a78bfa", "#60a5fa", "#34d399", "#f0abfc"], // pastel rainbow
  speed = 10, // seconds for a full loop
  glow = false,
}) {
  const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;

  return (
    <span
      className={`bg-clip-text text-transparent ${
        small ? "" : "drop-shadow"
      } ${glow ? "relative" : ""}`}
      style={{
        backgroundImage: gradient,
        backgroundSize: "200% 200%",
        animation: `gradient-x ${speed}s ease infinite, ${
          glow ? "shine 2.5s ease-in-out infinite" : "none"
        }`,
      }}
    >
      {children}
      {glow && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            filter: "blur(6px)",
            backgroundImage: gradient,
            backgroundSize: "200% 200%",
            animation: `gradient-x ${speed}s ease infinite`,
            zIndex: -1,
            opacity: 0.45,
          }}
        />
      )}
    </span>
  );
}
