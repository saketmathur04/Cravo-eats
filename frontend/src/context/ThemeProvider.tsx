import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export const ACCENT_COLORS = {
  red: { base: "#ef4444", hover: "#dc2626" },
  blue: { base: "#3b82f6", hover: "#2563eb" },
  green: { base: "#10b981", hover: "#059669" },
  violet: { base: "#8b5cf6", hover: "#7c3aed" },
  orange: { base: "#f97316", hover: "#ea580c" }
} as const;

export type AccentKey = keyof typeof ACCENT_COLORS;

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  defaultAccent?: AccentKey;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light"; // Real computed theme
  accentColor: AccentKey;
  setAccentColor: (color: AccentKey) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  accentColor: "red",
  setAccentColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccent = "red",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [accentColor, setAccentState] = useState<AccentKey>(
    () => (localStorage.getItem("cravo-accent") as AccentKey) || defaultAccent
  );

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
      return;
    }

    root.classList.add(theme);
    setResolvedTheme(theme);
  }, [theme]);

  // ─── Adaptive Time-of-Day UI ──────────────────────────
  useEffect(() => {
    const applyTimeClass = () => {
      const h = new Date().getHours();
      const root = window.document.documentElement;
      root.classList.remove("time-morning", "time-evening", "time-night");
      if (h >= 6 && h < 12) root.classList.add("time-morning");
      else if (h >= 17 && h < 21) root.classList.add("time-evening");
      else if (h >= 21 || h < 6) root.classList.add("time-night");
    };
    applyTimeClass();
    const interval = setInterval(applyTimeClass, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Apply accent color dynamically to root css variables
  useEffect(() => {
    const root = window.document.documentElement;
    const colorTheme = ACCENT_COLORS[accentColor] || ACCENT_COLORS.red;
    root.style.setProperty('--color-primary', colorTheme.base);
    root.style.setProperty('--color-primary-hover', colorTheme.hover);

    // Explicitly update meta theme color for PWA navigation bars
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", colorTheme.base);
    }
  }, [accentColor]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    resolvedTheme,
    accentColor,
    setAccentColor: (color: AccentKey) => {
      localStorage.setItem("cravo-accent", color);
      setAccentState(color);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
