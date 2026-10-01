import { useState, useEffect } from "react";

type Theme = "dark" | "light";
const EVENT = "mega-theme-change";

const readTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    const sync = () => setThemeState(readTheme());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem("theme", t);
    applyTheme(t);
    window.dispatchEvent(new Event(EVENT));
  };

  const toggleTheme = () => setTheme(readTheme() === "dark" ? "light" : "dark");

  return { theme, toggleTheme, setTheme, isDark: theme === "dark" };
};
