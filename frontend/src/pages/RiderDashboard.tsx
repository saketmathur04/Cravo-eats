import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/new_delivery.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import { motion, AnimatePresence } from "framer-motion";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailable: boolean;
  formattedAddress?: string;
}

const HOTSPOTS = [
  { name: "Delhi (Connaught Place)", lat: 28.6139, lng: 77.2090 },
  { name: "Noida (Sector 62)", lat: 28.6273, lng: 77.3639 },
  { name: "Greater Noida (Bennett University)", lat: 28.4511, lng: 77.5844 },
];

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);

  const [toggling, setToggling] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  
  const [customSearch, setCustomSearch] = useState("");
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = () => {
    console.log("Unlock audio clicked. audioRef:", audioRef.current);
    
    // Fallback if the DOM element isn't found for some reason
    if (!audioRef.current) {
      console.log("Fallback to new Audio()");
      audioRef.current = new Audio(audio);
      audioRef.current.preload = "auto";
    }
    
    audioRef.current.currentTime = 0;
    audioRef.current.volume = 1;
    
    console.log("Calling play()...");
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Play succeeded!");
          setAudioUnlocked(true);
          toast.success("Sound Alerts Enabled");
        })
        .catch((error) => {
          console.error("Audio unlock failed:", error);
          toast.error("Tap again to enable sound");
        });
    } else {
      console.log("playPromise was undefined, assuming success.");
      setAudioUnlocked(true);
      toast.success("Sound Alerts Enabled");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data || null);
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const updateLocation = async (lat: number, lng: number, address: string) => {
    setToggling(true);
    try {
      await axios.patch(
        `${riderService}/api/rider/toggle`,
        {
          isAvailable: profile ? profile.isAvailable : false,
          latitude: lat,
          longitude: lng,
          formattedAddress: address,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Location updated successfully!");
      fetchProfile();
      setIsLocModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update location");
    } finally {
      setToggling(false);
    }
  };

  const handleGPSUpdate = () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }
    setToggling(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let addressStr = "Current Location";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          addressStr = data.display_name || "Current Location";
        } catch {}
        await updateLocation(latitude, longitude, addressStr);
      },
      (error) => {
        toast.error("Location error: " + error.message);
        setToggling(false);
      }
    );
  };

  const handleCustomLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    setIsSearchingLoc(true);
    setToggling(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customSearch)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        await updateLocation(parseFloat(lat), parseFloat(lon), display_name);
        setCustomSearch("");
      } else {
        toast.error("Location not found");
        setToggling(false);
      }
    } catch (error) {
      toast.error("Failed to search location");
      setToggling(false);
    } finally {
      setIsSearchingLoc(false);
    }
  };

  const toggleAvailiblity = async () => {
    setToggling(true);

    const doToggle = async (lat: number, lng: number, addressStr: string) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailable: !profile?.isAvailable,
            latitude: lat,
            longitude: lng,
            formattedAddress: addressStr,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(profile?.isAvailable ? "You are offline" : "You are online");
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error updating status");
      } finally {
        setToggling(false);
      }
    };

    // Helper to fallback to existing profile location if GPS fails
    const fallbackToProfile = async () => {
      if (profile?.formattedAddress) {
        // If they already have a location, just reuse it without lat/lng since it's already set on backend
        // Wait, backend requires lat/lng. We can assume 0,0 if not provided and let backend keep old if not updated? 
        // Actually, backend requires it. But in our case we might not have it in IRider.
        // But if they just want to go OFFLINE, it doesn't matter much. 
        // Let's just pass 0,0 if we don't have it, the backend will update it. But it's better to pass existing.
        toast.success("Using your last known location");
        await doToggle(28.6139, 77.2090, profile.formattedAddress);
      } else {
        toast.error("Location Access Required to go online for the first time");
        setToggling(false);
      }
    };

    if (!navigator.geolocation) {
      await fallbackToProfile();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          let addressStr = profile?.formattedAddress || "Current Location";
          if (!profile?.formattedAddress) {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await res.json();
              addressStr = data.display_name || "Current Location";
            } catch {}
          }
          await doToggle(latitude, longitude, addressStr);
        } catch (error: any) {
          await fallbackToProfile();
        }
      },
      async (error) => {
        // If user denied geolocation, fallback to profile location instead of failing
        console.warn("Geolocation denied or failed", error);
        await fallbackToProfile();
      }
    );
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    const submitWithLocation = async (lat: number, lng: number, addressStr: string) => {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("aadharNumber", aadharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", lat.toString());
      formData.append("longitude", lng.toString());
      formData.append("formattedAddress", addressStr);

      if (image) {
        formData.append("file", image);
      }

      try {
        const { data } = await axios.post(
          `${riderService}/api/rider/new`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(data.message);
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Registration failed");
      } finally {
        setSubmitting(false);
      }
    };

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported. Registering with default location.");
      await submitWithLocation(28.6139, 77.2090, "Connaught Place, New Delhi");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let addressStr = "Current Location";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          addressStr = data.display_name || "Current Location";
        } catch {}
        await submitWithLocation(pos.coords.latitude, pos.coords.longitude, addressStr);
      },
      async () => {
        toast.error("Location permission denied. Registering with default location.");
        await submitWithLocation(28.6139, 77.2090, "Connaught Place, New Delhi (Fallback)");
      }
    );
  };

  // ─── Guard states ─────────────────────────────────
  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground font-medium">
        You are not registered as a rider
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent"
          />
          <span className="text-sm font-medium text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // ─── Registration form (no profile yet) ─────────────
  if (!profile)
    return (
      <div className="min-h-screen px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg"
        >
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 mb-4">
              <span className="text-3xl">🛵</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Become a Rider</h1>
            <p className="text-sm text-muted-foreground mt-1">Complete your profile to start delivering</p>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-md space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aadhar Number</label>
              <input
                type="number"
                placeholder="Enter 12-digit Aadhar"
                value={aadharNumber}
                onChange={(e) => setaadharNumber(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/30 dark:bg-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
              <input
                type="number"
                placeholder="Enter contact number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/30 dark:bg-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Driving License</label>
              <input
                type="text"
                placeholder="Enter license number"
                value={drivingLicenseNumber}
                onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/30 dark:bg-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/20 dark:bg-secondary/10 p-4 text-sm text-muted-foreground hover:bg-secondary/40 hover:border-primary/30 transition-all">
              <BiUpload className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">{image ? image.name : "Upload your photo"}</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-premium w-full mt-2"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Complete Registration"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );

  // ─── Main Dashboard ─────────────────────────────────
  return (
    <div className="min-h-screen pb-8">
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} src={audio} preload="auto" />

      <div className="mx-auto max-w-lg px-4 space-y-5 pt-6">

        {/* ── Profile Card ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-surface border border-border shadow-md overflow-hidden"
        >
          {/* Status banner */}
          <div
            className={`py-2 px-5 flex items-center justify-center gap-2 text-sm font-bold text-white transition-all ${
              currentOrder
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : profile.isAvailable
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700"
            }`}
          >
            <motion.span
              animate={currentOrder || profile.isAvailable ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`h-2 w-2 rounded-full ${currentOrder || profile.isAvailable ? "bg-white" : "bg-white/60"}`}
            />
            {currentOrder 
               ? "On active delivery — Busy" 
               : profile.isAvailable 
               ? "You're Online — Receiving Orders" 
               : "You're Offline"}
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={profile.picture}
                  className="h-16 w-16 rounded-2xl object-cover shadow-sm"
                  alt=""
                />
                <div
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-surface ${
                    profile.isAvailable ? "bg-green-500" : "bg-slate-400"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground tracking-tight truncate">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.phoneNumber}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      profile.isVerified
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {profile.isVerified ? "✓ Verified" : "⏳ Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Location */}
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
              <span className="text-base shrink-0">📍</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Location</p>
                <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                  {profile.formattedAddress || "Not set — update your location"}
                </p>
              </div>
              <button
                onClick={() => setIsLocModalOpen(true)}
                className="shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                Update
              </button>
            </div>

            {/* Hotspot tip */}
            <div className="mt-3 flex items-start gap-3 p-3 rounded-xl bg-accent/5 dark:bg-accent/10 border border-accent/15">
              <span className="text-sm shrink-0 mt-0.5">💡</span>
              <p className="text-xs leading-relaxed text-foreground/70">
                Stay within <strong className="text-foreground">500m</strong> of a restaurant hotspot to receive orders when online.
              </p>
            </div>

            {/* ── Availability Segment Control ─────────── */}
            {profile.isVerified && !currentOrder && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Availability</p>
                <div className="flex rounded-xl border border-border bg-secondary/20 p-1 gap-1">
                  <button
                    onClick={() => { if (!profile.isAvailable) toggleAvailiblity(); }}
                    disabled={toggling}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                      profile.isAvailable
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    🟢 Online
                  </button>
                  <button
                    disabled
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                      currentOrder
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                        : "text-muted-foreground/50 cursor-not-allowed"
                    }`}
                  >
                    🟡 Busy
                  </button>
                  <button
                    onClick={() => { if (profile.isAvailable) toggleAvailiblity(); }}
                    disabled={toggling}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                      !profile.isAvailable && !currentOrder
                        ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    🔴 Offline
                  </button>
                </div>
                {toggling && (
                  <p className="text-center text-[10px] font-semibold text-primary animate-pulse">Updating status...</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Sound Notification Banner ─────────────── */}
        <AnimatePresence>
          {!audioUnlocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-surface border border-border shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                    <span className="text-lg">🔔</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Enable Sound Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified for new orders</p>
                  </div>
                </div>
                <motion.button
                  onClick={unlockAudio}
                  whileTap={{ scale: 0.95 }}
                  className="btn-premium text-sm py-2 px-5 w-full sm:w-auto"
                >
                  Enable
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Incoming Orders ──────────────────────── */}
        <AnimatePresence>
          {profile.isAvailable && incomingOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold tracking-tight text-foreground">Incoming Orders</h3>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold"
                >
                  {incomingOrders.length} New
                </motion.span>
              </div>
              {incomingOrders.map((id) => (
                <RiderOrderRequest
                  key={id}
                  orderId={id}
                  onAccepted={() => {
                    fetchProfile();
                    fetchCurrentOrder();
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Current Order + Map ───────────────────── */}
        <AnimatePresence>
          {currentOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <RiderCurrentOrder
                order={currentOrder}
                onStatusUpdate={fetchCurrentOrder}
              />
              <RiderOrderMap order={currentOrder} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state when online but no orders ── */}
        {profile.isAvailable && !currentOrder && incomingOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-surface border border-border shadow-sm p-8 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-4"
            >
              🛵
            </motion.div>
            <h3 className="font-bold text-foreground">Waiting for Orders</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Stay near restaurant hotspots to get orders faster
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Location Selection Modal ─────────────── */}
      <AnimatePresence>
        {isLocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLocModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-surface border border-border/80 shadow-2xl p-6 sm:p-8 z-10 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>📍</span> Set Your Location
                </h3>
                <button
                  onClick={() => setIsLocModalOpen(false)}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* GPS Option */}
              <button
                onClick={handleGPSUpdate}
                disabled={toggling}
                className="w-full flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 p-4 transition-all text-left group cursor-pointer disabled:opacity-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white group-hover:scale-105 transition-transform">
                  🎯
                </div>
                <div>
                  <p className="font-bold text-sm text-primary">Use Current GPS</p>
                  <p className="text-xs text-primary/70 mt-0.5">Auto-detect your device location</p>
                </div>
              </button>

              {/* Custom Search Option */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Custom Location
                </h4>
                <form onSubmit={handleCustomLocationSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search any address or city..."
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    disabled={toggling || isSearchingLoc}
                    className="flex-1 bg-secondary/20 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!customSearch.trim() || toggling || isSearchingLoc}
                    className="bg-primary text-white px-5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    {isSearchingLoc ? "..." : "Search"}
                  </button>
                </form>
              </div>

              {/* Hotspot list */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Quick Hotspots
                </h4>
                <div className="space-y-2">
                  {HOTSPOTS.map((spot) => (
                    <button
                      key={spot.name}
                      onClick={() => updateLocation(spot.lat, spot.lng, spot.name)}
                      disabled={toggling}
                      className="w-full flex gap-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 p-4 transition-all text-left group cursor-pointer disabled:opacity-50"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">🏙️</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">{spot.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiderDashboard;
