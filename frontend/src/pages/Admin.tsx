import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import { motion } from "framer-motion";

const Admin = () => {
  const [restaurant, setRestaurant] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${adminService}/api/v1/admin/restaurant/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const response = await axios.get(
        `${adminService}/api/v1/admin/rider/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data.restaurants);
      setRiders(response.data.riders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent"
          />
          <span className="text-sm font-medium text-muted-foreground">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "restaurant" as const, label: "Restaurants", count: restaurant.length, icon: "🏪" },
    { key: "rider" as const, label: "Riders", count: riders.length, icon: "🛵" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-surface border border-border p-6 sm:p-8"
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage pending verifications</p>
          </div>

          {/* KPI cards */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center px-5 py-3 rounded-xl bg-secondary/50 dark:bg-secondary/30 border border-border/50">
              <span className="text-2xl font-black text-foreground">{restaurant.length}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Restaurants</span>
            </div>
            <div className="flex flex-col items-center px-5 py-3 rounded-xl bg-secondary/50 dark:bg-secondary/30 border border-border/50">
              <span className="text-2xl font-black text-foreground">{riders.length}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Riders</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
            <span
              className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                tab === t.key
                  ? "bg-white/20 text-white"
                  : "bg-secondary dark:bg-muted text-muted-foreground"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tab === "restaurant" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurant.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
                <p className="text-sm text-muted-foreground mt-1">No pending restaurant verifications</p>
              </div>
            ) : (
              restaurant.map((r) => (
                <AdminRestaurantCard
                  key={r._id}
                  restaurant={r}
                  onVerify={fetchData}
                />
              ))
            )}
          </div>
        )}
        {tab === "rider" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {riders.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
                <p className="text-sm text-muted-foreground mt-1">No pending rider verifications</p>
              </div>
            ) : (
              riders.map((r) => (
                <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Admin;
