import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "../features/theme/ThemeToggle";
import { useTheme } from "../context/ThemeProvider";
import loginHero from "../assets/login-hero.png";

/* ── Floating food items (reduced to 3 for performance) ── */
const floatingItems = [
  { emoji: "🍔", top: "12%", left: "8%",  delay: 0,   size: "text-5xl" },
  { emoji: "🍕", top: "22%", left: "78%", delay: 0.5, size: "text-4xl" },
  { emoji: "🥗", top: "72%", left: "82%", delay: 1.5, size: "text-5xl" },
];

type AuthTab = "create" | "login";
type Role = "customer" | "rider" | "seller" | null;

const roleInfo = {
  customer: { emoji: "🍽️", title: "Customer", desc: "Order delicious food from nearby restaurants" },
  rider:    { emoji: "🛵", title: "Delivery Rider", desc: "Earn money by delivering orders" },
  seller:   { emoji: "🏪", title: "Restaurant Owner", desc: "List your restaurant & grow your business" },
};
const roles: ("customer" | "rider" | "seller")[] = ["customer", "rider", "seller"];

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>("create");
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleAuth = async (authResult: any) => {
    setLoading(true);
    try {
      const payload: any = { code: authResult["code"] };

      // Only send role on Create Account tab
      if (activeTab === "create" && selectedRole) {
        payload.role = selectedRole;
      }

      const result = await axios.post(`${authService}/api/auth/login`, payload);
      const { token, user, isNewUser } = result.data;

      // New user tried Login tab without role — nudge to Create Account
      if (activeTab === "login" && isNewUser && !user.role) {
        toast("Looks like you're new! Please create an account first.", { icon: "👋" });
        setActiveTab("create");
        setLoading(false);
        return;
      }

      // Legacy user with no role — redirect to fallback role selector
      if (activeTab === "login" && !isNewUser && !user.role) {
        localStorage.setItem("token", token);
        setUser(user);
        setIsAuth(true);
        toast.success("Welcome back! Please select your role.");
        navigate("/select-role");
        return;
      }

      localStorage.setItem("token", token);
      toast.success(result.data.message);
      setUser(user);
      setIsAuth(true);
      navigate("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleAuth,
    onError: handleAuth,
    flow: "auth-code",
  });

  const canProceed = activeTab === "login" || (activeTab === "create" && selectedRole !== null);

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen w-full">

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* ═════ LEFT PANEL — Hero Image ═════ */}
      <div className="absolute inset-0 lg:relative lg:flex lg:w-1/2 xl:w-[55%] overflow-hidden z-0">
        <img
          src={loginHero}
          alt="Delicious food spread"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {isDark ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#070A13]/60 via-transparent to-[#070A13]/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#070A13]/50" />
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        )}

        {floatingItems.map((item, i) => (
          <div
            key={i}
            className={`hidden lg:block absolute ${item.size} select-none pointer-events-none animate-float-gentle ${
              isDark ? "opacity-80" : "opacity-30"
            }`}
            style={{ top: item.top, left: item.left, animationDelay: `${item.delay}s` }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Hero text content */}
        <div className="hidden lg:flex relative z-10 flex-col justify-end p-16 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 ${
              isDark
                ? "bg-white/10 border border-purple-500/20"
                : "bg-white/15 border border-white/20"
            }`}>
              <span className="h-2 w-2 rounded-full animate-pulse bg-green-400 ring-4 ring-green-400/20" />
              <span className="text-white text-[11px] font-bold uppercase tracking-wider">
                30-min guarantee
              </span>
            </div>

            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight max-w-sm">
              Order food you{" "}
              <span className={isDark
                ? "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
                : "text-primary italic"
              }>love</span>{" "}
              <motion.span
                className="inline-block"
                animate={{ rotate: [0, 14, -14, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                🍔
              </motion.span>
            </h1>

            <p className="mt-6 text-lg text-white/75 max-w-md leading-relaxed">
              Fast delivery. Best restaurants. Seamless experience — all in one app.
            </p>

            <div className="flex items-center gap-8 mt-12">
              {[
                { value: "500+", label: "Kitchens" },
                { value: "50K+", label: "Users" },
                { value: "4.9★", label: "Rating" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                >
                  <span className={`text-2xl font-bold ${
                    isDark ? "bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent" : "text-white"
                  }`}>{stat.value}</span>
                  <span className="text-xs text-white/50 font-semibold uppercase tracking-widest">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═════ RIGHT PANEL — Auth Card ═════ */}
      <div className={`flex w-full lg:w-1/2 xl:w-[45%] items-center justify-center px-4 py-12 lg:px-6 lg:py-16 z-10 ${
        isDark ? "" : "lg:bg-[#F6F8FB] bg-transparent"
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile hero (small screens) */}
          <div className="lg:hidden text-center mb-8 flex flex-col items-center">
            <img src="/cravo_logo.png" alt="Cravo" className="h-16 mb-2 object-contain" />
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {activeTab === "create" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTab === "create" ? "Choose your role & get started" : "Sign in to continue"}
            </p>
          </div>

          {/* ═══ AUTH CARD ═══ */}
          <div className={`rounded-3xl p-6 sm:p-8 lg:p-10 ${
            isDark
              ? "neon-border bg-[#070A13]/95 border border-white/[0.08] shadow-2xl"
              : "bg-white/95 lg:bg-white border border-white/40 shadow-2xl"
          }`}>

            {/* Desktop logo */}
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <img src="/cravo_logo.png" alt="Cravo" className="h-12 object-contain" />
            </div>

            {/* ═══ TAB SWITCHER ═══ */}
            <div className={`flex rounded-xl p-1 mb-8 ${
              isDark ? "bg-white/[0.04] border border-white/[0.06]" : "bg-secondary/50 border border-border"
            }`}>
              {(["create", "login"] as AuthTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeTab === tab
                      ? isDark
                        ? "bg-gradient-to-r from-orange-500/80 to-pink-500/80 text-white shadow-lg"
                        : "bg-primary text-white shadow-md"
                      : isDark
                        ? "text-white/40 hover:text-white/70"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "create" ? "Create Account" : "Login"}
                </button>
              ))}
            </div>

            {/* ═══ TAB CONTENT ═══ */}
            <AnimatePresence mode="wait">
              {activeTab === "create" ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Desktop heading */}
                  <div className="hidden lg:block mb-6">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      Get started with CravoEats
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Select your role to create an account
                    </p>
                  </div>

                  {/* Role selector */}
                  <div className="space-y-2.5 mb-6">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${
                      isDark ? "text-white/40" : "text-muted-foreground"
                    }`}>
                      I want to join as
                    </p>
                    {roles.map((r) => {
                      const info = roleInfo[r];
                      const isSelected = selectedRole === r;
                      return (
                        <motion.button
                          key={r}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRole(r)}
                          className={`w-full flex items-center gap-4 rounded-xl p-3.5 text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? isDark
                                ? "bg-gradient-to-r from-orange-500/15 to-pink-500/15 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]"
                                : "bg-primary/5 border-2 border-primary shadow-sm"
                              : isDark
                                ? "bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]"
                                : "bg-white border border-border hover:border-primary/20 hover:shadow-sm"
                          }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform ${
                            isSelected ? "scale-110" : ""
                          } ${isDark ? "bg-white/[0.06]" : "bg-secondary"}`}>
                            {info.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${
                              isSelected
                                ? isDark ? "text-white" : "text-primary"
                                : "text-foreground"
                            }`}>{info.title}</p>
                            <p className={`text-[11px] mt-0.5 ${
                              isSelected
                                ? isDark ? "text-white/60" : "text-primary/70"
                                : "text-muted-foreground"
                            }`}>{info.desc}</p>
                          </div>
                          {/* Radio indicator */}
                          <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? isDark ? "border-pink-500 bg-pink-500" : "border-primary bg-primary"
                              : isDark ? "border-white/20" : "border-border"
                          }`}>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-2 w-2 rounded-full bg-white"
                              />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Desktop heading */}
                  <div className="hidden lg:block mb-6">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      Welcome back 👋
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Sign in to continue ordering your favorite meals
                    </p>
                  </div>

                  <div className={`text-center py-6 mb-4 rounded-xl ${
                    isDark ? "bg-white/[0.02]" : "bg-secondary/30"
                  }`}>
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="text-4xl mb-3"
                    >
                      🍕
                    </motion.div>
                    <p className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-foreground/70"}`}>
                      Sign in with your Google account
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                      New here? Switch to the{" "}
                      <button
                        onClick={() => setActiveTab("create")}
                        className={`font-bold underline underline-offset-2 cursor-pointer ${isDark ? "text-pink-400" : "text-primary"}`}
                      >
                        Create Account
                      </button>{" "}tab
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ CONTINUE WITH divider ═══ */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Continue with
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* ═══ Google OAuth Button ═══ */}
            <motion.button
              onClick={() => googleLogin()}
              disabled={loading || !canProceed}
              whileHover={canProceed ? { scale: 1.01 } : {}}
              whileTap={canProceed ? { scale: 0.98 } : {}}
              className={`w-full h-14 flex items-center justify-center gap-4 rounded-xl px-6 text-sm font-semibold transition-all duration-300 ${
                !canProceed
                  ? "opacity-40 cursor-not-allowed"
                  : "disabled:opacity-60 disabled:cursor-not-allowed"
              } ${
                isDark
                  ? "bg-white/[0.04] border border-white/10 text-foreground hover:bg-white/[0.08] hover:border-purple-500/30"
                  : "bg-white border border-black/10 text-gray-700 hover:border-black/20 hover:shadow-md"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>{activeTab === "create" ? "Creating account..." : "Signing you in..."}</span>
                </div>
              ) : (
                <>
                  <FcGoogle size={22} />
                  <span className="flex-1 text-left">Continue with Google</span>
                  <ArrowRight size={16} className="text-muted-foreground opacity-60" />
                </>
              )}
            </motion.button>

            {/* Disabled hint for create tab */}
            {activeTab === "create" && !selectedRole && (
              <p className={`text-center text-[10px] font-semibold mt-3 ${
                isDark ? "text-orange-400/60" : "text-primary/60"
              }`}>
                ↑ Select a role above to continue
              </p>
            )}

            {/* Security badge */}
            <div className={`flex items-center justify-center gap-2 mt-6 py-3 rounded-xl border ${
              isDark
                ? "bg-white/[0.02] border-white/[0.06]"
                : "bg-secondary/40 border-border"
            }`}>
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Secured by Google OAuth 2.0
              </span>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="#" className={`font-medium hover:underline ${
                isDark ? "text-pink-400" : "text-primary"
              }`}>Terms</a>
              {" "}&{" "}
              <a href="#" className={`font-medium hover:underline ${
                isDark ? "text-pink-400" : "text-primary"
              }`}>Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
