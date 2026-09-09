"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "maintainiq_theme";

export function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent("maintainiq-theme-change", { detail: theme }));
}

export function useTheme() {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const current = getInitialTheme();
    setThemeState(current);
    applyTheme(current);

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

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };
}
