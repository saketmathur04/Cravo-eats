import axios from "axios";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = params.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return;

      try {
        await axios.post(`${utilsService}/api/payment/stripe/verify`, {
          sessionId,
        });

        toast.success("Payment successful 🎉");
        navigate("/orders");
      } catch (error) {
        toast.error("Stripe verification failed");
        console.log(error);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
          />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Verifying your payment
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Please don't close this window...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
