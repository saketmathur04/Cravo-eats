import { motion } from "framer-motion";
import { CheckCircle2, ChefHat, Bike, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeProvider";

const steps = [
  { id: 1, icon: CheckCircle2, label: "Order received", time: "12:04" },
  { id: 2, icon: ChefHat,      label: "Chef plating",   time: "12:11", active: true },
  { id: 3, icon: Bike,         label: "On the way",     time: "12:18" },
  { id: 4, icon: Sparkles,     label: "Arrived",        time: "12:24" },
];

const tags = ["Push updates", "Live ETA", "Chat with chef", "Contactless drop"];

export function LiveTracking() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <section id="concierge" className="relative py-24 md:py-32">
      <div className="container max-w-[1200px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className={`text-xs uppercase tracking-[0.2em] font-bold ${
              isDark ? "text-pink-400/70" : "text-muted-foreground"
            }`}>
              Real-time
            </span>
            <h2 className="mt-4 text-section text-balance">
              Watch your meal travel,{" "}
              <span className={isDark
                ? "bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent"
                : "text-primary italic"
              }>second by second</span>.
            </h2>
            <p className="mt-6 text-muted-foreground text-pretty max-w-prose">
              Live kitchen telemetry and rider GPS combine into a calm, glanceable
              timeline. No more refreshing — your order tells you exactly where it is.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`tag-chip rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    isDark
                      ? "border-purple-500/15 bg-white/[0.04] text-white/65"
                      : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right — tracking card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            {/* Dark: ambient glow behind card */}
            {isDark && (
              <div
                className="absolute -inset-10 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(168,85,247,0.08), transparent 70%)",
                }}
              />
            )}

            <div className={`premium-card p-6 md:p-8 relative ${isDark ? "neon-border" : ""}`}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs uppercase tracking-wider font-bold ${
                    isDark ? "text-purple-400/60" : "text-muted-foreground"
                  }`}>
                    Order #TE-9182
                  </div>
                  <div className="mt-1 text-lg font-bold text-foreground tracking-tight">
                    Truffle Pappardelle + Wagyu
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold leading-none ${
                    isDark
                      ? "bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent"
                      : "text-primary"
                  }`}>
                    22<span className="text-base text-muted-foreground font-normal"> min</span>
                  </div>
                  <div className={`text-[11px] mt-1 uppercase font-bold tracking-wider ${
                    isDark ? "text-pink-400/60" : "text-muted-foreground"
                  }`}>
                    arriving soon
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className={`mt-8 h-1.5 rounded-full overflow-hidden ${
                isDark ? "bg-white/[0.06]" : "bg-secondary"
              }`}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "55%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                  className="h-full rounded-full relative"
                  style={{
                    background: isDark
                      ? "linear-gradient(90deg, #FF7A18, #EC4899, #A855F7)"
                      : "#FF7A18",
                    boxShadow: isDark
                      ? "0 0 15px rgba(236,72,153,0.5), 0 0 30px rgba(168,85,247,0.3)"
                      : "none",
                  }}
                />
              </div>

              {/* Timeline steps */}
              <ul className="mt-8 space-y-4">
                {steps.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-4"
                  >
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                        s.active
                          ? isDark
                            ? "border-pink-500/40 text-pink-400 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.25)]"
                            : "border-primary text-primary bg-primary/5"
                          : i < 2
                          ? isDark
                            ? "border-purple-500/20 text-purple-400/50 bg-purple-500/5"
                            : "border-primary/20 text-primary/60 bg-primary/5"
                          : isDark
                          ? "border-white/[0.08] text-white/25"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <s.icon className="h-4 w-4" />
                      {s.active && (
                        <span
                          className={`absolute -inset-1 rounded-full border-2 animate-pulse ${
                            isDark ? "border-pink-500/25" : "border-primary/20"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${
                        s.active ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {s.label}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{s.time}</div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
