export default function GradientText({ children, small = false }) {
  return (
    <span
      className={`bg-clip-text text-transparent ${small ? "" : "drop-shadow"}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #f0abfc, #a78bfa, #60a5fa, #34d399, #f0abfc)",
        backgroundSize: "200% 200%",
        animation: "gradient-x 10s ease infinite",
      }}
    >
      {children}
    </span>
  );
}
