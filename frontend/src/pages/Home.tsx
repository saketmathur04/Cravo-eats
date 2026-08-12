import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/ui/skeleton";
import { Search } from "lucide-react";
import { Hero } from "../features/landing/Hero";
import { LiveTracking } from "../features/landing/LiveTracking";
import { Features } from "../features/landing/Features";
import { Footer } from "../features/landing/Footer";
import toast from "react-hot-toast";

const floatingFoods = [
  { emoji: "🍣", x: "5%",  y: "15%", delay: 0,   duration: 7, size: "text-6xl"  },
  { emoji: "🍕", x: "88%", y: "35%", delay: 0.7, duration: 9, size: "text-7xl"  },
  { emoji: "🍔", x: "8%",  y: "65%", delay: 0.3, duration: 8, size: "text-[5rem]"  },
  { emoji: "🥂", x: "85%", y: "85%", delay: 1.2, duration: 10, size: "text-6xl" },
  { emoji: "🥗", x: "50%", y: "50%", delay: 0.5, duration: 11, size: "text-8xl", opacity: "opacity-10" },
];

const Home = () => {
  const { location, setLocation, setCity } = useAppData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(search);

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const fetchSavedAddresses = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      setLoadingAddresses(true);
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSavedAddresses(data || []);
    } catch (err) {
      console.log("Failed to fetch saved addresses", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isLocationModalOpen) {
      fetchSavedAddresses();
    }
  }, [isLocationModalOpen]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setLocation({
            latitude,
            longitude,
            formattedAddress: data.display_name || "Current Location",
          });
          setCity(data.address.city || data.address.town || data.address.village || "Your Location");
          toast.success("Location updated successfully!");
          setIsLocationModalOpen(false);
        } catch (err) {
          setLocation({
            latitude,
            longitude,
            formattedAddress: "Current Location",
          });
          setCity("Current Location");
          setIsLocationModalOpen(false);
        }
      },
      (err) => {
        toast.error("Failed to get location: " + err.message);
      }
    );
  };

  const handleSelectAddress = (addr: any) => {
    setLocation({
      latitude: addr.location.coordinates[1],
      longitude: addr.location.coordinates[0],
      formattedAddress: addr.formattedAddress,
    });
    setCity("Saved Address");
    toast.success("Delivery address updated!");
    setIsLocationModalOpen(false);
  };

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) return;

    try {
      setLoading(true);
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch) {
        setSearchParams({ search: localSearch });
      } else {
        setSearchParams({});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchParams]);

  if (!location) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-16 w-16 text-primary flex items-center justify-center text-5xl">
          📍
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Discovering your location...</h2>
        <p className="text-foreground/60 max-w-md">Please ensure location services are enabled to find the best food around you.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <main id="main" className="relative w-full h-full">
        {/* Global Dark Mode Ambience & Floating Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="dark-hero-bg" aria-hidden="true" />
          
          {floatingFoods.map((food, i) => (
            <motion.div
              key={i}
              className={`floating-food absolute select-none pointer-events-none ${food.size} ${food.opacity || ''}`}
              style={{ left: food.x, top: food.y }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: food.duration,
                repeat: Infinity,
                delay: food.delay,
                ease: "easeInOut",
              }}
            >
              {food.emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <Hero localSearch={localSearch} setLocalSearch={setLocalSearch} />
          
          {/* Replaced FeaturedDishes with dynamic Restaurant list */}
        <section id="explore" className="relative py-24 md:py-32">
          <div className="container max-w-[1200px] px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-secondary font-medium">Tonight's lineup</span>
                <h2 className="mt-4 text-section text-balance max-w-[18ch]">
                  {search ? `Searching for ` : `Hand-picked places, ready in `}
                  <span className="text-primary italic">
                    {search ? `"${search}"` : `22 minutes.`}
                  </span>
                </h2>
              </div>
              
              {/* Delivery location selector */}
              <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Delivering To</span>
                <button 
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:border-primary/30 transition-all font-semibold text-sm text-foreground shadow-sm hover:shadow-md cursor-pointer group"
                >
                  <span className="text-primary group-hover:scale-110 transition-transform">📍</span>
                  <span className="truncate max-w-[200px]">{location ? location.formattedAddress : "Select Address"}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground">▼</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                      <Skeleton className="h-[280px] w-full rounded-2xl" />
                    </div>
                 ))}
              </div>
            ) : restaurants.length > 0 ? (
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {restaurants.map((res) => {
                  const [resLng, resLat] = res.autoLocation.coordinates;
                  const distance = getDistanceKm(location.latitude, location.longitude, resLat, resLng);

                  return (
                    <RestaurantCard
                      key={res._id}
                      id={res._id}
                      image={res.image ?? ""}
                      name={res.name}
                      distance={`${distance}`}
                      isOpen={res.isOpen}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <div className="py-24 text-center">
                 <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-surface border border-border mb-8 shadow-sm">
                    <Search className="h-8 w-8 text-secondary/30" />
                 </div>
                 <h3 className="text-xl font-semibold text-foreground tracking-tight">No restaurants found</h3>
                 <p className="mt-2 text-secondary">Try adjusting your search criteria or extending your area.</p>
              </div>
            )}
          </div>
        </section>

        <LiveTracking />
          <Features />
        </div>
      </main>

      {/* Location Selection Modal */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface border border-border/80 shadow-2xl p-6 sm:p-8 z-10 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>📍</span> Change Delivery Location
                </h3>
                <button
                  onClick={() => setIsLocationModalOpen(false)}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* GPS Option */}
              <button
                onClick={handleUseGPS}
                className="w-full flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 p-4 transition-all text-left group cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white group-hover:scale-105 transition-transform">
                  🎯
                </div>
                <div>
                  <p className="font-bold text-sm text-primary">Use Current GPS Location</p>
                  <p className="text-xs text-primary/70 mt-0.5">Detect your location automatically</p>
                </div>
              </button>

              {/* Saved Addresses list */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Saved Addresses
                </h4>

                {loadingAddresses ? (
                  <div className="space-y-2">
                    <div className="h-16 w-full rounded-xl bg-secondary animate-pulse" />
                    <div className="h-16 w-full rounded-xl bg-secondary animate-pulse" />
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border rounded-xl bg-secondary/10">
                    <p className="text-xs font-semibold text-muted-foreground">No saved addresses found</p>
                  </div>
                ) : (
                  <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className="w-full flex gap-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 p-4 transition-all text-left group cursor-pointer"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform font-bold">🏡</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground leading-normal truncate">
                            {addr.formattedAddress}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 font-semibold">📞 {addr.mobile}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Manage addresses link */}
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  navigate("/address");
                }}
                className="w-full py-3 rounded-xl border border-dashed border-border text-center text-sm font-bold text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                + Manage Saved Addresses
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
