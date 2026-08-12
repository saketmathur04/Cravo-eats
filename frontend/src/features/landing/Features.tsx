import { motion } from "framer-motion";
import { Compass, Timer, ShieldCheck, Flame } from "lucide-react";
import { useTheme } from "../../context/ThemeProvider";

const features = [
  {
    icon: Compass,
    title: "Curated, not crowded",
    body: "Every kitchen on CravoEats is hand-selected by our culinary team. Quality over catalog size.",
    gradient: "from-orange-500 to-amber-400",
    darkGlow: "rgba(249,115,22,0.3)",
    darkBorder: "rgba(249,115,22,0.15)",
  },
  {
    icon: Timer,
    title: "22-minute promise",
    body: "Smart routing and live kitchen telemetry keep your order on a perfect arc — hot, fresh, on time.",
    gradient: "from-purple-500 to-violet-400",
    darkGlow: "rgba(168,85,247,0.3)",
    darkBorder: "rgba(168,85,247,0.15)",
  },
  {
    icon: Flame,
    title: "Built for cravings",
    body: "AI-tuned recommendations learn your taste so the right dish is always one tap away.",
    gradient: "from-pink-500 to-rose-400",
    darkGlow: "rgba(236,72,153,0.3)",
    darkBorder: "rgba(236,72,153,0.15)",
  },
  {
    icon: ShieldCheck,
    title: "Premium care",
    body: "Insulated handoff, contact-free options, and a real human on standby for every order.",
    gradient: "from-emerald-500 to-green-400",
    darkGlow: "rgba(16,185,129,0.3)",
    darkBorder: "rgba(16,185,129,0.15)",
  },
];

export function Features() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="container max-w-[1200px] px-6">
        <div className="max-w-2xl">
          <span className={`text-xs uppercase tracking-[0.2em] font-bold ${
            isDark ? "text-purple-400/70" : "text-muted-foreground"
          }`}>
            The difference
          </span>
          <h2 className="mt-4 text-section text-balance">
            A delivery experience designed like a{" "}
            <span className={isDark
              ? "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
              : "text-primary italic"
            }>tasting menu</span>.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group premium-card p-6"
              style={isDark ? {
                borderColor: f.darkBorder,
              } : {}}
            >
              <div className="relative">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white`}
                  style={isDark ? {
                    boxShadow: `0 4px 20px ${f.darkGlow}`,
                  } : {}}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-bold text-base text-foreground tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
