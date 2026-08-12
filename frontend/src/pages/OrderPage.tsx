import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";
import { motion } from "framer-motion";

const statusSteps = [
  { key: "placed", label: "Placed", icon: "📝" },
  { key: "accepted", label: "Accepted", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready_for_rider", label: "Ready", icon: "📦" },
  { key: "rider_assigned", label: "Rider Assigned", icon: "🛵" },
  { key: "picked_up", label: "Picked Up", icon: "🚀" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrder(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => fetchOrder();
    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);
    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join", `user:${id}`);
    return () => {
      socket.emit("leave", `user:${id}`);
    };
  }, [socket, id]);

  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!socket) return;
    const onRiderLocation = ({ latitude, longitude }: any) => {
      console.log("Rider Location:", latitude, longitude);
      setRiderLocation([latitude, longitude]);
    };
    socket.on("rider:location", onRiderLocation);
    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="text-4xl">🔍</span>
        <p className="font-bold text-foreground">Order not found</p>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="mx-auto max-w-[800px] px-6 py-12 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Order <span className="text-muted-foreground text-sm font-normal">#{order._id.slice(-6)}</span>
        </h1>
      </motion.div>

      {/* Status Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card p-6"
      >
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Order Status</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {statusSteps.map((step, i) => {
            const isActive = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg transition-all border ${
                      isCurrent 
                        ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" 
                        : isActive
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-secondary/50"
                    }`}
                  >
                    <span className={isActive ? "grayscale-0" : "grayscale opacity-50"}>{step.icon}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center leading-tight whitespace-nowrap ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full ${
                    i < currentStepIndex ? "bg-primary/40" : "bg-border"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Items Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="premium-card p-6 space-y-4"
          >
            <h2 className="text-sm font-bold text-foreground">Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div className="flex justify-between text-sm" key={i}>
                  <span className="text-muted-foreground">
                    <span className="font-bold text-foreground">{item.quantity}x</span> {item.name}
                  </span>
                  <span className="font-semibold text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-6 space-y-4"
          >
            <h2 className="text-sm font-bold text-foreground">📍 Delivery Details</h2>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.deliveryAddress.formattedAddress}
              </p>
              <p className="text-sm text-muted-foreground font-medium mt-2">
                📞 {order.deliveryAddress.mobile}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Payment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="premium-card p-6 space-y-4"
          >
            <h2 className="text-sm font-bold text-foreground mb-4">Payment Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span> <span className="font-semibold text-foreground">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span> <span className="font-semibold text-foreground">₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee</span> <span className="font-semibold text-foreground">₹{order.platformFee}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span> <span className="text-primary">₹{order.totalAmount}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <span className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg bg-secondary text-muted-foreground font-bold border border-border">
                {order.paymentMethod}
              </span>
              <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg font-bold border ${
                order.paymentStatus === "paid"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : order.paymentStatus === "refunded"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-orange-50 text-orange-600 border-orange-100"
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </motion.div>

          {/* Rider status */}
          {(order.status === "rider_assigned" || order.status === "picked_up") && !riderLocation && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="premium-card p-8 text-center flex flex-col items-center justify-center bg-primary/5 border-primary/10"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl mb-4 animate-bounce">
                🛵
              </div>
              <p className="text-sm font-semibold text-foreground">Connecting to rider...</p>
              <p className="text-[11px] text-muted-foreground mt-1">Live location will be available shortly.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Map */}
      {(order.status === "rider_assigned" || order.status === "picked_up") && riderLocation && (
        <div className="premium-card overflow-hidden h-[400px]">
          <UserOrderMap
            riderLocation={riderLocation}
            deliveryLocation={[
              order.deliveryAddress.latitude!,
              order.deliveryAddress.longitude!,
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default OrderPage;
