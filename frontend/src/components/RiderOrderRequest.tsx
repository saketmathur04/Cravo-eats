import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    setAccepting(true);
    try {
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order Accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept");
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };

  const progress = secondsLeft / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl bg-surface border border-success/30 dark:border-success/20 shadow-md"
    >
      {/* Animated progress bar at top */}
      <div className="h-1.5 bg-secondary dark:bg-muted w-full">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #22C55E, #16A34A)" }}
          initial={{ width: "100%" }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 dark:bg-success/20">
              <span className="text-lg">📦</span>
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">New Delivery Request</p>
              <p className="text-xs text-muted-foreground">
                Order #{orderId.slice(-6)}
              </p>
            </div>
          </div>

          {/* Countdown circle */}
          <div className="relative flex items-center justify-center h-12 w-12">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-secondary dark:text-muted"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-success"
                stroke="currentColor"
                strokeDasharray={`${progress * 125.6} 125.6`}
                style={{ transition: "stroke-dasharray 1s linear" }}
              />
            </svg>
            <span className="absolute text-sm font-black text-foreground">
              {secondsLeft}
            </span>
          </div>
        </div>

        {/* Accept Button */}
        <motion.button
          disabled={accepting}
          onClick={acceptOrder}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-success hover:bg-success/90 text-white py-3.5 font-bold text-sm transition-all shadow-md disabled:opacity-60"
        >
          {accepting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
              />
              Accepting...
            </>
          ) : (
            <>
              <span>✓</span> Accept Order
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RiderOrderRequest;
