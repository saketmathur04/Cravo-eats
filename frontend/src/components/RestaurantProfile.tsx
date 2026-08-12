import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { Edit, MapPin, Save, LogOut } from "lucide-react";
import { useAppData } from "../context/AppContext";
import { Button } from "./ui/button";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update");
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const { setIsAuth, setUser } = useAppData();

  const logoutHandler = async () => {
    await axios.put(
      `${restaurantService}/api/restaurant/status`,
      { status: false },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface border border-border shadow-md">
      {restaurant.image && (
        <div className="relative h-64 w-full">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        </div>
      )}
      
      <div className={`p-6 sm:p-8 space-y-6 ${!restaurant.image ? "pt-8" : "-mt-16 relative z-10"}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            {editMode ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{restaurant.name}</h2>
            )}

            <div className="mt-2 flex items-center gap-2 text-sm text-foreground/70 font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              {restaurant.autoLocation.formattedAddress || "Location unavailable"}
            </div>
          </div>

          {isSeller && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-border text-foreground hover:border-primary hover:text-primary transition-all"
            >
              <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        <div className="bg-background/50 rounded-2xl p-4 border border-border/50">
           {editMode ? (
             <textarea
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
             />
           ) : (
             <p className="text-foreground/80 leading-relaxed">
               {restaurant.description || "No description provided."}
             </p>
           )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
               {isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
               <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="font-semibold tracking-wide text-foreground">
              {isOpen ? "CURRENTLY OPEN" : "CLOSED NOW"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {editMode && (
              <Button onClick={saveChanges} disabled={loading} variant="default" className="gap-2">
                <Save size={16} /> Save Changes
              </Button>
            )}

            {isSeller && (
              <>
                <Button 
                  onClick={toggleOpenStatus} 
                  variant={isOpen ? "outline" : "primary"}
                >
                  {isOpen ? "Close Store" : "Open Store"}
                </Button>
                <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2" onClick={logoutHandler}>
                  <LogOut size={16} /> Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
