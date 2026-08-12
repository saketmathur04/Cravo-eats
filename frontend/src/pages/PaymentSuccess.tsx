import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md rounded-2xl bg-surface border border-border/50 p-8 text-center space-y-5"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
          className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-success/10"
        >
          <span className="text-4xl">✅</span>
        </motion.div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Successful</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your order has been placed successfully 🎉
          </p>
        </div>

        {paymentId && (
          <div className="rounded-xl bg-secondary/50 dark:bg-secondary/30 p-3 space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Payment ID</span>
            <p className="font-mono text-xs break-all text-foreground/70">{paymentId}</p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #FF4D4F, #FF7A18)" }}
            onClick={() => navigate("/orders")}
          >
            📋 Track My Order
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all bg-secondary hover:bg-secondary/80 text-foreground border border-border/50"
            onClick={() => navigate("/")}
          >
            🍽️ Order More
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
