const globalStyles = `
@keyframes gradient-x {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes spin-slow {
  from { transform: rotate(0.001deg); }
  to   { transform: rotate(360deg); }
}

@keyframes aurora-pan {
  0%   { transform: translateX(-20%) translateY(0) rotate(0.001deg); }
  50%  { transform: translateX(20%) translateY(-6%) rotate(0.001deg); }
  100% { transform: translateX(-20%) translateY(0) rotate(0.001deg); }
}

@keyframes aurora-sway {
  0%   { transform: translateY(0) skewX(-8deg) rotate(0.001deg); }
  50%  { transform: translateY(-8%) skewX(-12deg) rotate(0.001deg); }
  100% { transform: translateY(0) skewX(-8deg) rotate(0.001deg); }
}

@keyframes aurora-hue {
  0%   { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

@keyframes ripple-glow {
  0%   { opacity: .28; transform: translate(-50%, -50%) scale(.9); }
  60%  { opacity: .15; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.35); }
}

/* Utilities */
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 8s ease infinite;
}

.animate-spin-slow {
  animation: spin-slow 28s linear infinite;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-gradient-x,
  .animate-spin-slow,
  [style*="aurora-pan"],
  [style*="aurora-sway"],
  [style*="aurora-hue"],
  [style*="ripple-glow"] {
    animation: none !important;
  }
}
`;

export default globalStyles;
