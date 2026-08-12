import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useTheme } from "../context/ThemeProvider";
import toast from "react-hot-toast";
import { LogOut, MapPin, Package, Plus, Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const { theme, setTheme } = useTheme();

  const firstLetter = user?.name?.charAt(0).toUpperCase();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-6 py-16 md:py-24 flex justify-center items-start">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm premium-card overflow-hidden">
        
        <div className="flex flex-col items-center gap-4 text-center p-10 bg-secondary border-b border-border">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-white shadow-lg shadow-primary/20">
            {firstLetter}
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{user?.name}</h2>
            <p className="text-xs text-muted-foreground mt-1 tracking-wide font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="p-3 space-y-1 bg-background">
          {(!user?.role || user?.role === "customer") && (
            <>
              <Link to="/orders" className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary text-foreground transition-all group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10 group-hover:scale-105 transition-transform">
                  <Package className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm tracking-tight text-foreground">Your Orders</span>
              </Link>

              <Link to="/address" className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary text-foreground transition-all group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10 group-hover:scale-105 transition-transform">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-sm tracking-tight text-foreground">Addresses</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Manage delivery locations</span>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                  <Plus className="h-4 w-4" />
                </div>
              </Link>
            </>
          )}

          {/* ── Appearance Section ── */}
          <div className="px-4 py-3 mt-2 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Appearance</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-colors ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs font-medium">Light</span>
              </button>
              
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-colors ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs font-medium">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-colors ${
                  theme === "system"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs font-medium">System</span>
              </button>
            </div>
          </div>

          <div className="border-t border-border mt-2 pt-2">
            <button onClick={logoutHandler} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-all group text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-500 group-hover:scale-105 transition-transform">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-red-600 dark:text-red-500">Logout</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Account;
