// src/App.jsx
import { useEffect } from "react";
import Portfolio from "./pages/Portfolio.jsx";
import globalStyles from "./styles/globalStyles.js"; // ✅ correct path from src/

export default function App() {
  // inject once
  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-aurora", "true");
    el.innerHTML = globalStyles;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return <Portfolio />;
}
