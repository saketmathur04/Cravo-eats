import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title="Switch theme"
        className={`
          relative inline-flex h-10 w-10 items-center justify-center rounded-full
          border transition-all duration-300 outline-none
          focus-visible:ring-2 focus-visible:ring-primary/40
          ${isDark
            ? "border-white/[0.08] bg-white/[0.04] text-white/80 hover:border-purple-400/50 hover:bg-white/[0.08] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]"
            : "border-border bg-surface text-foreground hover:border-primary/30 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          }
        `}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={  { rotate:  90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDark
              ? <Moon  className="h-[18px] w-[18px] drop-shadow-md" />
              : <Sun   className="h-[18px] w-[18px] text-amber-500" />
            }
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] uppercase tracking-widest font-bold rounded opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-50">
        Switch Theme
      </div>
    </div>
  );
}
