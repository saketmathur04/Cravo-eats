import { useTheme } from "../../context/ThemeProvider";

export function Footer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const cols = [
    { title: "Company", links: ["About", "Careers", "Press", "Newsroom"] },
    { title: "For chefs", links: ["Apply", "Partner portal", "Toolkit", "Logistics"] },
    { title: "Support", links: ["Help center", "Order issues", "Contact", "Status"] },
    { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Accessibility"] },
  ];
  return (
    <footer className={`relative border-t mt-12 ${
      isDark ? "border-white/[0.06]" : "border-border/50"
    }`}>
      {/* Neon top gradient line */}
      <div className={`absolute inset-x-0 top-0 h-px ${
        isDark
          ? "bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
          : "bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      }`} />

      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                isDark
                  ? "bg-gradient-to-br from-orange-500 to-pink-500 shadow-[0_2px_10px_rgba(236,72,153,0.25)]"
                  : "bg-gradient-to-br from-orange-500 to-amber-500"
              }`}>C</div>
              <span className="font-bold tracking-tight text-foreground">
                Cravo<span className={isDark
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent"
                  : "text-primary"
                }>Eats</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              A new kind of delivery — curated, calm, and built around the way real people eat.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className={`text-xs uppercase tracking-[0.2em] font-bold ${
                isDark ? "text-purple-400/50" : "text-muted-foreground"
              }`}>{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className={`text-sm transition-colors duration-300 ${
                      isDark
                        ? "text-white/40 hover:text-pink-400"
                        : "text-foreground/60 hover:text-primary"
                    }`}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs ${
          isDark ? "border-white/[0.04] text-white/30" : "border-border/30 text-muted-foreground"
        }`}>
          <span>© {new Date().getFullYear()} CravoEats. Crafted with care.</span>
          <span className={isDark
            ? "font-mono text-purple-400/30"
            : "font-mono text-muted-foreground/50"
          }>v2.0 · premium</span>
        </div>
      </div>
    </footer>
  );
}
