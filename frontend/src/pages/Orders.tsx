import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/myorder`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent"
          />
          <span className="text-sm font-medium text-muted-foreground">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl"
        >
          📋
        </motion.div>
        <h3 className="font-bold text-foreground">No orders yet</h3>
        <p className="text-sm text-muted-foreground">Your order history will appear here</p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status)
  );

  return (
    <div className="mx-auto max-w-[800px] px-6 py-16 md:py-24 space-y-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-section text-foreground">My Orders</h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">{orders.length} total orders</p>
      </motion.div>

      {activeOrders.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-card-title text-foreground">Active Orders</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/5 border border-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              {activeOrders.length} Tracking
            </div>
          </div>
          <div className="space-y-4">
            {activeOrders.map((order, i) => (
              <OrderRow
                key={order._id}
                order={order}
                index={i}
                isActive
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="text-card-title text-foreground px-1">
          {activeOrders.length > 0 ? "Past Orders" : "Order History"}
        </h2>
        {completedOrders.length === 0 ? (
          <div className="premium-card p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-secondary/40 mb-4 border border-border">📋</div>
            <p className="text-sm font-semibold text-foreground">No completed orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedOrders.map((order, i) => (
              <OrderRow
                key={order._id}
                order={order}
                index={i}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Orders;

// component Order row
const OrderRow = ({
  order,
  onClick,
  index = 0,
  isActive = false,
}: {
  order: IOrder;
  onClick: () => void;
  index?: number;
  isActive?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="cursor-pointer premium-card p-6 transition-all duration-300 hover:border-black/20 hover:shadow-lg group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Order ID</p>
          <p className="text-sm font-bold text-foreground">#{order._id.slice(-6)}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider border shadow-sm ${
            isActive 
              ? "bg-primary/10 text-primary border-primary/20" 
              : "bg-muted text-muted-foreground border-border"
          }`}>
            {order.status.replaceAll("_", " ")}
          </span>
        {order.paymentStatus === "refunded" && (
          <span className="text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider border shadow-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
            💰 Refunded
          </span>
        )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground leading-relaxed line-clamp-1 italic">
        {order.items.map((item, i) => (
          <span key={i}>
            <span className="font-bold text-foreground normal-case not-italic">{item.quantity}x</span> <span className="text-foreground/80">{item.name}</span>
            {i < order.items.length - 1 && ", "}
          </span>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border flex justify-between items-end">
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Amount</p>
          <p className="text-2xl font-semibold text-foreground tracking-tighter">₹{order.totalAmount}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <Package className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
};
