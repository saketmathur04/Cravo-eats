import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";
import { motion } from "framer-motion";

type Role = "customer" | "rider" | "seller" | null;

const roleInfo = {
  customer: { emoji: "🍽️", title: "Customer", desc: "Order delicious food" },
  rider: { emoji: "🛵", title: "Delivery Rider", desc: "Earn by delivering" },
  seller: { emoji: "🏪", title: "Restaurant Owner", desc: "Grow your business" },
};

const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const roles: Role[] = ["customer", "rider", "seller"];

  const addRole = async () => {
    if (!role) return;
    setSubmitting(true);
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (error) {
      alert("something went wrong");
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Choose your role</h1>
          <p className="text-sm text-muted-foreground mt-1">How would you like to use CravoEats?</p>
        </div>

        <div className="space-y-3">
          {roles.map((r) => {
            const info = roleInfo[r!];
            const isSelected = role === r;
            return (
              <motion.button
                key={r}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole(r)}
                className={`w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-white shadow-md ring-2 ring-primary/30"
                    : "bg-surface border border-border hover:border-primary/30 hover:shadow-sm text-foreground"
                }`}
                style={!isSelected ? { boxShadow: "0 4px 16px rgba(0,0,0,0.04)" } : {}}
              >
                <span className="text-2xl">{info.emoji}</span>
                <div>
                  <p className="font-semibold text-sm capitalize">{info.title}</p>
                  <p className={`text-xs ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                    {info.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={role ? { scale: 1.01 } : {}}
          whileTap={role ? { scale: 0.98 } : {}}
          disabled={!role || submitting}
          onClick={addRole}
          className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
            role
              ? "btn-premium"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          {submitting ? "Setting up..." : "Continue"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SelectRole;
