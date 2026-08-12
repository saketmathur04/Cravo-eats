import { useState } from "react";
import type { IMenuItem } from "../types";
import { EyeOff, Eye, Trash2, Plus, Loader2 } from "lucide-react";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;

    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Item deleted");
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailiblity = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const { fetchCart } = useAppData();

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        { restaurantId, itemId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      fetchCart();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <motion.div
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group relative flex gap-4 overflow-hidden rounded-2xl bg-surface border border-border p-4 shadow-sm transition-all hover:shadow-md ${
              !item.isAvailable ? "opacity-75 bg-surface-hover/50" : ""
            }`}
            key={item._id}
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-background">
              <img
                src={item.image}
                alt={item.name}
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                  !item.isAvailable ? "grayscale brightness-75" : ""
                }`}
              />
              {!item.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between overflow-hidden">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                {item.description && (
                  <p className="text-xs text-foreground/60 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="font-bold text-lg text-foreground">₹{item.price}</p>

                {isSeller ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAvailiblity(item._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface hover:bg-surface-hover text-foreground/70 transition-colors"
                    >
                      {item.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant={!item.isAvailable ? "secondary" : "primary"}
                    disabled={!item.isAvailable || isLoading}
                    onClick={() => addToCart(item.restaurantId, item._id)}
                    className="h-8 rounded-lg px-3 text-xs shadow-none gap-2 font-semibold"
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={14} /> ADD
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MenuItems;
