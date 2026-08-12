import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2, ArrowRight, Loader2, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "../components/ui/EmptyState";

const Cart = () => {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center bg-background px-4">
        <EmptyState 
           title="Your cart is empty"
           description="Looks like you haven't added anything to your cart yet. Discover delicious food around you."
           lottieSrc="https://assets-v2.lottiefiles.com/a/4cd91ad8-1153-11ee-bb8e-8fb8e15467e9/wF1u7LgLDB.json" 
           actionLabel="Find Restaurants"
           onAction={() => navigate("/")}
        />
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(`${restaurantService}/api/cart/inc`, { itemId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(`${restaurantService}/api/cart/dec`, { itemId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear your cart?");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
        <h1 className="text-section text-foreground mb-12">Review your <span className="text-primary italic">order</span></h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Cart Items */}
          <div className="flex-1 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6 flex items-center justify-between">
              <div>
                <h2 className="text-card-title text-foreground mb-2">{restaurant.name}</h2>
                <p className="flex items-center text-sm text-muted-foreground">
                   <MapPin className="h-3.5 w-3.5 mr-1.5" />
                   {restaurant.autoLocation.formattedAddress}
                </p>
              </div>
              <img src={restaurant.image} alt="" className="h-14 w-14 rounded-full object-cover border border-border hidden sm:block" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card overflow-hidden">
              <div className="p-4 bg-secondary border-b border-border font-medium text-xs text-muted-foreground uppercase tracking-wider">
                {quantity} Items in cart
              </div>
              <div className="divide-y divide-border">
                <AnimatePresence>
                  {cart.map((cartItem: ICart) => {
                    const item = cartItem.itemId as IMenuItem;
                    const isLoading = loadingItemId === item._id;

                    return (
                      <motion.div
                        layout
                        key={item._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-6 p-6"
                      >
                        <div className="relative shrink-0">
                          <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover border border-border" />
                        </div>

                        <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg tracking-tight">{item.name}</h3>
                            <p className="font-bold text-primary">₹{item.price}</p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-8 sm:w-1/2">
                            <div className="flex items-center rounded-xl border border-border bg-background p-1">
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground transition-colors disabled:opacity-50"
                                disabled={isLoading}
                                onClick={() => decreaseQty(item._id)}
                              >
                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Minus size={14} />}
                              </button>
                              <span className="w-10 text-center font-bold text-foreground">{cartItem.quantity}</span>
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                                disabled={isLoading}
                                onClick={() => increaseQty(item._id)}
                              >
                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                              </button>
                            </div>

                            <p className="w-20 text-right font-bold text-lg text-foreground">
                              ₹{item.price * cartItem.quantity}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="w-full lg:w-[400px]">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 0.2 }}
               className="sticky top-[100px] premium-card p-8"
            >
              <h3 className="text-card-title text-foreground mb-8">Pricing Summary</h3>

              <div className="space-y-4 mb-8 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal (<span className="font-medium">{quantity} items</span>)</span>
                  <span className="font-semibold text-foreground">₹{subTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-foreground">{deliveryFee === 0 ? <span className="text-green-500">Free</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-foreground">₹{platformFee}</span>
                </div>
              </div>

              {subTotal < 250 && (
                <div className="mb-8 rounded-xl bg-primary/5 p-4 text-sm text-primary border border-primary/10 flex flex-col items-center text-center">
                  <span className="font-bold mb-1 uppercase tracking-wider text-[10px]">Free delivery goal</span>
                  <span className="text-muted-foreground">Add items worth <span className="font-bold text-primary">₹{250 - subTotal}</span> more to get FREE delivery</span>
                </div>
              )}

              <div className="flex justify-between items-end border-t border-border pt-6 mb-8">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Grand Total</span>
                <span className="text-4xl font-semibold text-foreground tracking-tighter">₹{grandTotal}</span>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate("/checkout")}
                  className={`w-full h-14 rounded-xl text-lg font-semibold tracking-tight btn-primary flex gap-2 justify-center items-center shadow-lg shadow-primary/20 ${
                    !restaurant.isOpen ? "opacity-50 pointer-events-none" : ""
                  }`}
                  disabled={!restaurant.isOpen}
                >
                  {!restaurant.isOpen ? "Restaurant Closed" : (
                     <>Proceed to Pay <ArrowRight size={18} /></>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="w-full h-12 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex gap-2 justify-center items-center"
                  disabled={clearingCart}
                >
                  {clearingCart ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  Clear Cart
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
