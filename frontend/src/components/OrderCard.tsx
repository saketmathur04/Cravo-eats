import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-yellow-100 text-yellow-700";
    case "accepted":
      return "bg-orange-100 text-orange-700";
    case "preparing":
      return "bg-blue-100 text-blue-700";
    case "ready_for_rider":
      return "bg-indigo-100 text-indigo-700";
    case "picked_up":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const OrderCard = ({ order, onStatusUpdate }: props) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const actions = ORDER_ACTIONS[order.status] || [];

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order updated");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="rounded-[20px] bg-glass backdrop-blur-md p-5 border border-glass-border shadow-md space-y-4 transition-all duration-300 hover:shadow-lg hover:border-border">
      <div className="flex justify-between items-center pb-3 border-b border-border/50">
        <p className="font-bold tracking-tight text-foreground">Order #{order._id.slice(-6)}</p>

        <span
          className={`rounded-full px-4 py-1 text-xs font-bold shadow-sm ${statusColor(
            order.status
          )}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="text-sm font-medium text-muted-foreground space-y-2 pb-3 border-b border-border/50">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between">
             <span className="text-foreground/80">{item.name}</span>
             <span className="text-foreground/60 p-1 px-2 bg-secondary/80 rounded-md">x {item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Amount</span>
          <span className="text-lg font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">₹{order.totalAmount}</span>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment</span>
           <span className={`text-xs font-bold capitalize px-2 py-1 rounded-md mt-1 ${
             order.paymentStatus === "paid" ? 'bg-green-500/10 text-green-600 dark:text-green-500' 
             : order.paymentStatus === "refunded" ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
             : 'bg-red-500/10 text-red-600 dark:text-red-500'
           }`}>
              {order.paymentStatus}
           </span>
        </div>
      </div>

      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3">
          {actions.map((status) => (
            <button
              key={status}
              disabled={loading}
              onClick={() => updateStatus(status)}
              className={`flex-1 text-sm py-2 rounded-xl font-bold transition shadow-sm ${
                status === "cancelled"
                  ? "border border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-500 bg-transparent"
                  : "btn-premium"
              }`}
            >
              {status === "cancelled" ? "Cancel Order" : `Mark as ${status.replaceAll("_", " ")}`}
            </button>
          ))}
        </div>
      )}

      {order.status === "ready_for_rider" && retryVisible && (
        <div className="pt-2">
          <button
            className="w-full rounded-xl border-2 border-primary py-2.5 text-sm font-bold text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors shadow-sm"
            onClick={() => updateStatus("ready_for_rider")}
          >
            Retry Ready for Rider
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
