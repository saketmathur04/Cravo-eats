import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const STEPS = [
  { key: "rider_assigned", label: "Accepted", icon: "✓" },
  { key: "picked_up", label: "Picked Up", icon: "📦" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
];

function getStepIndex(status: string): number {
  if (status === "rider_assigned") return 0;
  if (status === "picked_up") return 1;
  if (status === "delivered") return 2;
  return 0;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const [updating, setUpdating] = useState(false);
  const currentStep = getStepIndex(order.status);

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-surface border border-border shadow-md overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-foreground tracking-tight">Current Delivery</h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary capitalize">
            {order.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-border dark:bg-muted" />
          {/* Active line */}
          <motion.div
            className="absolute top-5 left-6 h-0.5"
            style={{ background: "linear-gradient(90deg, #22C55E, #16A34A)" }}
            initial={{ width: "0%" }}
            animate={{
              width: `${currentStep >= 2 ? 100 : currentStep >= 1 ? 50 : 0}%`,
              maxWidth: "calc(100% - 48px)",
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />

          {STEPS.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                  transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-success text-white shadow-md"
                      : isCurrent
                      ? "bg-primary text-white shadow-lg ring-4 ring-primary/20"
                      : "bg-secondary dark:bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? "✓" : step.icon}
                </motion.div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="px-5 pb-4 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 dark:bg-secondary/30">
            <span className="text-lg mt-0.5">🏪</span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pickup</p>
              <p className="text-sm font-semibold text-foreground truncate">{order.restaurantName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 dark:bg-secondary/30">
            <span className="text-lg mt-0.5">📍</span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Delivery</p>
              <p className="text-sm font-semibold text-foreground truncate">{order.deliveryAddress.formattedAddress}</p>
            </div>
          </div>
        </div>

        {/* Earnings row */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 dark:bg-success/10 border border-success/20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Earning</p>
            <p className="text-xl font-black text-success">₹{order.riderAmount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Order Total</p>
            <p className="text-lg font-bold text-foreground">₹{order.totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Customer Phone */}
      {order.deliveryAddress.mobile && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 dark:bg-secondary/20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
              <p className="text-sm font-bold text-foreground">{order.deliveryAddress.mobile}</p>
            </div>
            <a
              href={`tel:${order.deliveryAddress.mobile}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold transition-all hover:brightness-110 shadow-sm"
            >
              📞 Call
            </a>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="px-5 pb-5">
        {order.status === "rider_assigned" && (
          <motion.button
            onClick={updateStatus}
            disabled={updating}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
          >
            {updating ? "Updating..." : "📦 Picked Up from Restaurant"}
          </motion.button>
        )}

        {order.status === "picked_up" && (
          <motion.button
            onClick={updateStatus}
            disabled={updating}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
          >
            {updating ? "Updating..." : "✅ Mark as Delivered"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default RiderCurrentOrder;
