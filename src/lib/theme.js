"use client";

import { useLayoutEffect, useState } from "react";

const THEME_KEY = "maintainiq_theme";

export function getInitialTheme() {
  if (typeof window === "undefined") return "light";

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
  window.dispatchEvent(
    new CustomEvent("maintainiq-theme-change", { detail: theme }),
  );
}

export function useTheme() {
  // "light" se start — SSR se match, hydration mismatch nahi hoga
  const [theme, setThemeState] = useState("light");
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    // Browser paint se PEHLE asal theme set karo — flash nahi dikhega
    setThemeState(getInitialTheme());
    setMounted(true);

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

  return { theme, isDark: theme === "dark", toggleTheme, mounted };
}