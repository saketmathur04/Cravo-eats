import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ShoppingBag, X, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeProvider";
import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Discover", href: "/", section: "explore" },
  { label: "Cuisines", href: "/", section: "cuisines" },
  { label: "For You", href: "/", section: "concierge" },
  { label: "About", href: "/", section: "about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { quantity, isAuth, user } = useAppData();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("explore");

  // ── Scroll detection with progress tracking ──
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // Normalize scroll progress (0 → 1 over first 200px)
      setScrollProgress(Math.min(y / 200, 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Active section detection via IntersectionObserver ──
  useEffect(() => {
    if (location.pathname !== "/") return;
    const sectionIds = ["explore", "cuisines", "concierge", "about"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [location.pathname]);

  const handleLinkClick = useCallback(
    (section: string) => {
      setActiveSection(section);
      setMobileOpen(false);
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    []
  );

  // ── Dynamic inline styles for scroll-responsive depth ──
  const navHeight = scrolled ? "3.5rem" : "4rem";
  const navBgOpacity = isDark
    ? 0.55 + scrollProgress * 0.35
    : 0.85 + scrollProgress * 0.12;
  const navBlur = 16 + scrollProgress * 16;
  const navShadow = scrolled
    ? isDark
      ? `0 4px 32px rgba(0,0,0,${0.4 + scrollProgress * 0.25}), 0 1px 0 rgba(168,85,247,${0.05 + scrollProgress * 0.08})`
      : `0 1px 12px rgba(0,0,0,${0.04 + scrollProgress * 0.04})`
    : "none";

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 flex items-center"
        style={{
          height: navHeight,
          backdropFilter: `blur(${navBlur}px) saturate(1.4)`,
          WebkitBackdropFilter: `blur(${navBlur}px) saturate(1.4)`,
          background: isDark
            ? `rgba(7, 10, 19, ${navBgOpacity})`
            : `rgba(246, 248, 251, ${navBgOpacity})`,
          borderBottom: isDark
            ? `1px solid rgba(168, 85, 247, ${0.06 + scrollProgress * 0.1})`
            : `1px solid rgba(0, 0, 0, ${0.04 + scrollProgress * 0.04})`,
          boxShadow: navShadow,
          transition:
            "height 300ms cubic-bezier(0.16,1,0.3,1), background 300ms ease, box-shadow 300ms ease, border-color 300ms ease",
        }}
      >
        {/* ── Subtle gradient edge (premium touch) ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? `linear-gradient(to right, rgba(168,85,247,0.06), transparent 30%, transparent 70%, rgba(236,72,153,0.06))`
              : `linear-gradient(to right, rgba(255,122,24,0.03), transparent 30%, transparent 70%, rgba(255,122,24,0.03))`,
            opacity: 0.8 + scrollProgress * 0.2,
          }}
        />

        <div className="relative container max-w-[1200px] flex items-center justify-between px-6">
          {/* ── Brand ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`relative h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white text-lg leading-none ${
                isDark
                  ? "bg-gradient-to-br from-orange-500 to-pink-500 shadow-[0_2px_12px_rgba(236,72,153,0.35)]"
                  : "bg-primary shadow-sm"
              }`}
            >
              <span className="-mt-0.5">C</span>
            </motion.div>
            <span className="font-bold tracking-tight text-base text-foreground">
              Cravo
              <span
                className={
                  isDark
                    ? "bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent"
                    : "text-primary"
                }
              >
                Eats
              </span>
            </span>
          </Link>

          {/* ── Desktop Navigation Links ── */}
          {user?.role !== "seller" && user?.role !== "rider" && (
            <nav className="hidden md:flex items-center gap-0.5 text-sm">
              {links.map((l) => {
                const isActive = activeSection === l.section;
                return (
                  <button
                    key={l.label}
                    onClick={() => handleLinkClick(l.section)}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 group ${
                      isDark
                        ? isActive
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                        : isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      transform: "translateY(0px)",
                      transition:
                        "color 200ms ease, transform 200ms ease, background 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      if (!isActive) {
                        e.currentTarget.style.background = isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.03)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {l.label}
                    {/* ── Active underline indicator ── */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-indicator"
                        className="absolute -bottom-0.5 left-3 right-3 h-[2px] rounded-full"
                        style={{
                          background: isDark
                            ? "linear-gradient(90deg, #A855F7, #EC4899)"
                            : "hsl(var(--primary))",
                          boxShadow: isDark
                            ? "0 0 8px rgba(168,85,247,0.4)"
                            : "none",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    {/* ── Hover glow underline (non-active) ── */}
                    {!isActive && (
                      <span
                        className="absolute -bottom-0.5 left-3 right-3 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          background: isDark
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(0,0,0,0.1)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2">
            {/* ── Cart Button (PRIMARY ACTION) ── */}
            {user?.role !== "seller" && user?.role !== "rider" && (
              <Link to="/cart" tabIndex={-1}>
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative inline-flex h-11 items-center gap-2 rounded-xl border px-4 font-semibold transition-all duration-250 ${
                    isDark
                      ? "bg-white/[0.05] border-white/[0.1] hover:border-purple-500/40 hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(168,85,247,0.15),0_0_8px_rgba(236,72,153,0.1)] text-sm"
                      : "border-border bg-surface/50 hover:border-primary/50 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-sm"
                  }`}
                  aria-label={`Cart, ${quantity} items`}
                >
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  <span className="hidden sm:inline">Cart</span>
                  <AnimatePresence>
                    {quantity > 0 && (
                      <motion.span
                        key={quantity}
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                        }}
                        className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white ${
                          isDark
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]"
                            : "bg-primary shadow-sm"
                        }`}
                      >
                        {quantity}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Link>
            )}

            {/* ── Account / Sign In ── */}
            {isAuth ? (
              <Link to="/account" tabIndex={-1}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    variant="outline"
                    className={`hidden sm:inline-flex rounded-xl gap-2 h-10 ${
                      isDark
                        ? "border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.12)]"
                        : "border-border hover:border-primary/40 hover:shadow-sm"
                    }`}
                  >
                    {/* Avatar placeholder */}
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isDark
                          ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/10 text-white/80"
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || (
                        <User className="h-3 w-3" />
                      )}
                    </div>
                    <span className="text-sm pr-1">Profile</span>
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <Link to="/login" tabIndex={-1}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    variant="default"
                    className="hidden sm:inline-flex rounded-xl btn-primary h-10 px-6 font-bold"
                  >
                    Sign in
                  </Button>
                </motion.div>
              </Link>
            )}

            {/* ── Mobile Hamburger ── */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen((v) => !v)}
              className={`md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                isDark
                  ? `bg-white/[0.04] border-white/[0.1] ${
                      mobileOpen
                        ? "bg-white/[0.08] border-purple-500/30"
                        : "hover:bg-white/[0.07]"
                    }`
                  : `border-border bg-surface ${
                      mobileOpen ? "bg-muted" : "hover:bg-muted/50"
                    }`
              }`}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {mobileOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* ── Mobile Menu ── */}
          <AnimatePresence>
            {mobileOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 top-14 bg-black/40 backdrop-blur-sm md:hidden z-40"
                  onClick={() => setMobileOpen(false)}
                />
                {/* Panel */}
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute top-[calc(100%+8px)] left-4 right-4 md:hidden rounded-2xl border p-5 space-y-2 z-50 ${
                    isDark
                      ? "bg-[#0D1117]/95 backdrop-blur-2xl border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(168,85,247,0.05)]"
                      : "bg-white/95 backdrop-blur-xl border-border shadow-xl"
                  }`}
                >
                  <ul className="flex flex-col gap-1">
                    {user?.role !== "seller" &&
                      user?.role !== "rider" &&
                      links.map((l) => {
                        const isActive = activeSection === l.section;
                        return (
                          <li key={l.label}>
                            <button
                              onClick={() => handleLinkClick(l.section)}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isDark
                                  ? isActive
                                    ? "bg-white/[0.06] text-white"
                                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                                  : isActive
                                  ? "bg-primary/5 text-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                {isActive && (
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                      background: isDark
                                        ? "linear-gradient(135deg, #A855F7, #EC4899)"
                                        : "hsl(var(--primary))",
                                      boxShadow: isDark
                                        ? "0 0 6px rgba(168,85,247,0.4)"
                                        : "none",
                                    }}
                                  />
                                )}
                                {l.label}
                              </span>
                              <ChevronRight
                                className={`h-4 w-4 transition-opacity ${
                                  isActive ? "opacity-60" : "opacity-30"
                                }`}
                              />
                            </button>
                          </li>
                        );
                      })}
                  </ul>

                  {/* ── Mobile divider ── */}
                  <div
                    className={`h-px mx-3 ${
                      isDark ? "bg-white/[0.06]" : "bg-border"
                    }`}
                  />

                  {/* ── Mobile auth button ── */}
                  <div className="pt-1">
                    {isAuth ? (
                      <Link
                        to="/account"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className={`w-full h-12 rounded-xl gap-2 ${
                            isDark
                              ? "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07]"
                              : ""
                          }`}
                        >
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isDark
                                ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/10 text-white/80"
                                : "bg-primary/10 text-primary border border-primary/20"
                            }`}
                          >
                            {user?.name?.charAt(0)?.toUpperCase() || (
                              <User className="h-3 w-3" />
                            )}
                          </div>
                          Profile
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button
                          variant="default"
                          className="w-full h-12 rounded-xl btn-primary font-bold"
                        >
                          Sign in
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
