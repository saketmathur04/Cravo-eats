import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useState } from "react";

const AdminRestaurantCard = ({
  restaurant,
  onVerify,
}: {
  restaurant: any;
  onVerify: () => void;
}) => {
  const [verifying, setVerifying] = useState(false);

  const verify = async () => {
    setVerifying(true);
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Restaurant verified");
      onVerify();
    } catch (error) {
      toast.error("Failed to verify restaurant");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-surface border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={restaurant.image}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          alt={restaurant.name}
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warning/90 text-white backdrop-blur-sm shadow-sm">
            Pending
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">{restaurant.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{restaurant.autoLocation?.formattedAddress}</p>
        </div>

        {restaurant.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>📞</span>
            <span>{restaurant.phone}</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={verifying}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all shadow-md disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
          onClick={verify}
        >
          {verifying ? "Verifying..." : "✓ Verify Restaurant"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AdminRestaurantCard;
