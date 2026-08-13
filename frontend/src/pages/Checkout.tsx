import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { CreditCard, Loader2, MapPin, Navigation, Receipt } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setselectedAddressId] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }
      try {
        const { data } = await axios.get(`${restaurantService}/api/address/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAddresses(data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddresses();
  }, [cart]);

  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-background">
        <p className="text-foreground/60 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;


  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        { paymentMethod, addressId: selectedAddressId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      return data;
    } catch (error) {
      toast.error("Failed to create Order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;
      const { data } = await axios.post(`${utilsService}/api/payment/create`, { orderId });
      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Cravo",
        description: "Food Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            toast.success("Payment successful 🎉");
            navigate(`/order/${orderId}`);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#ef4444" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;

      const { orderId } = order;
      try {
        await stripePromise;
        const { data } = await axios.post(
          `${utilsService}/api/payment/stripe/create`,
          { orderId }
        );
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("failed to create payment session");
        }
      } catch (error) {
        toast.error("Payment Failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-24">
        <h1 className="text-section text-foreground mb-12 text-center">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-[2] space-y-12">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-8">
              <div className="flex items-center gap-4 border-b border-border pb-6 mb-8">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary text-sm font-bold border border-primary/20">1</div>
                 <h2 className="text-card-title text-foreground">Delivery Details</h2>
              </div>
              
              <div className="mb-8 rounded-xl bg-secondary p-5 border border-border flex items-center justify-between">
                 <div>
                   <h3 className="font-semibold text-foreground text-base tracking-tight">{restaurant.name}</h3>
                   <p className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      {restaurant.autoLocation.formattedAddress}
                   </p>
                 </div>
              </div>

              {loadingAddress ? (
                <div className="space-y-4">
                   <div className="h-16 w-full bg-secondary rounded-xl border border-border animate-pulse" />
                   <div className="h-16 w-full bg-secondary rounded-xl border border-border animate-pulse" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 rounded-xl border-2 border-dashed border-border bg-secondary/30">
                   <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
                      <Navigation className="h-6 w-6 text-muted-foreground/40" />
                   </div>
                   <p className="text-sm font-semibold text-foreground">No address found</p>
                   <p className="text-sm text-muted-foreground mb-6">Please add a delivery address to continue.</p>
                   <Button onClick={() => navigate('/address')} variant="default" className="btn-primary px-8">
                      Add New Address
                   </Button>
                </div>
              ) : (
                <>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 ml-1">Select Delivery Location</h3>
                  {addresses.map((add) => (
                    <label
                      key={add._id}
                      onClick={() => setselectedAddressId(add._id)}
                       className={`relative flex gap-4 rounded-xl border p-5 cursor-pointer transition-all duration-300 ${
                        selectedAddressId === add._id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-background hover:border-black/20"
                      }`}
                    >
                      <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedAddressId === add._id ? "border-primary bg-primary" : "border-border"
                      }`}>
                        {selectedAddressId === add._id && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground leading-relaxed">{add.formattedAddress}</p>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium tracking-wide">📞 {add.mobile}</p>
                      </div>
                    </label>
                  ))}
                </div>
                  <button
                    onClick={() => navigate('/address')}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/30 hover:bg-primary/5 p-4 transition-all text-sm font-semibold text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    <span className="text-lg">+</span> Add New Address
                  </button>
                </>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card p-8">
              <div className="flex items-center gap-4 border-b border-border pb-6 mb-8">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary text-sm font-bold border border-primary/20">2</div>
                 <h2 className="text-card-title text-foreground">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Button
                  disabled={!selectedAddressId || loadingRazorpay || creatingOrder || loadingStripe}
                  onClick={payWithRazorpay}
                  variant="outline"
                  className={`h-14 justify-start gap-4 px-6 text-base tracking-tight rounded-xl border border-border group hover:border-black/20 hover:bg-background w-full font-semibold transition-all ${
                    loadingRazorpay ? "border-black/20" : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-[#3399FF]/5 flex items-center justify-center text-[#3399FF] border border-[#3399FF]/10 group-hover:scale-105 transition-transform">
                    {loadingRazorpay ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                  </div>
                  <span>Pay with Razorpay</span>
                </Button>

                <Button
                  disabled={!selectedAddressId || loadingStripe || creatingOrder || loadingRazorpay}
                  onClick={payWithStripe}
                  variant="outline"
                  className={`h-14 justify-start gap-4 px-6 text-base tracking-tight rounded-xl border border-border group hover:border-black/20 hover:bg-background w-full font-semibold transition-all ${
                    loadingStripe ? "border-black/20" : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-[#635BFF]/5 flex items-center justify-center text-[#635BFF] border border-[#635BFF]/10 group-hover:scale-105 transition-transform">
                    {loadingStripe ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                  </div>
                  <span>Pay with Stripe</span>
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="flex-[1] lg:w-[380px] shrink-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sticky top-28 premium-card p-8">
              <div className="flex items-center gap-3 mb-8">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Order Summary</h3>
              </div>

              <div className="space-y-4 mb-8">
                {cart.map((cartItem: ICart) => {
                  const item = cartItem.itemId as IMenuItem;
                  return (
                    <div className="flex justify-between items-start text-sm" key={cartItem._id}>
                      <div className="flex gap-2 text-muted-foreground">
                        <span className="font-bold text-foreground">{cartItem.quantity}x</span>
                        <span className="leading-tight">{item.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">₹{item.price * cartItem.quantity}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-6 space-y-4 text-sm text-muted-foreground mb-8">
                <div className="flex justify-between">
                  <span>Subtotal <span className="opacity-50 text-xs text-muted-foreground/60">({quantity} items)</span></span>
                  <span className="font-semibold text-foreground">₹{subTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-foreground">{deliveryFee === 0 ? <span className="text-green-600">Free</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-foreground">₹{platformFee}</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-border pt-6">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Grand Total</span>
                <span className="text-4xl font-semibold text-foreground tracking-tighter">₹{grandTotal}</span>
              </div>
              
              {!selectedAddressId && (
                <div className="mt-10 p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3">
                  <Loader2 className="h-4 w-4 text-orange-500 animate-spin shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-orange-700 leading-normal">
                    Select a delivery address above to enable payment options.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
