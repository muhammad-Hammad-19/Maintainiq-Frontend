"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "maintainiq_theme";

export function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  // Blocking script (layout.js) already class laga chuka hai — usi se sach maano
  if (document.documentElement.classList.contains("dark")) return "dark";

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent("maintainiq-theme-change", { detail: theme }));
}

export function useTheme() {
  // Lazy init function — pehle render pe hi sahi value milti hai, "light" flash nahi hoga
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    function handleThemeChange(e) {
      setThemeState(e.detail);
    }

    window.addEventListener("maintainiq-theme-change", handleThemeChange);
    return () => {
      window.removeEventListener("maintainiq-theme-change", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    applyTheme(next);
  };

  return { theme, isDark: theme === "dark", toggleTheme };
}