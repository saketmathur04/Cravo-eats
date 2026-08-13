import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash } from "react-icons/bi";
import { motion } from "framer-motion";

// 🔧 Fix leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
  _id: string;
  formattedAddress: string;
  flat?: string;
  landmark?: string;
  label?: "home" | "work" | "other";
  mobile: number;
}

// 📍 Click-to-select location
const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// 🎯 Locate me button
const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => toast.error("Location permission denied")
    );
  };
  return (
    <button
      onClick={locateUser}
      className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm font-medium shadow-md hover:bg-secondary dark:hover:bg-secondary/50 text-foreground border border-border/50 transition-all"
    >
      <LuLocateFixed size={16} className="text-primary" />
      Use current location
    </button>
  );
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 📋 Form state
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [flat, setFlat] = useState("");
  const [landmark, setLandmark] = useState("");
  const [label, setLabel] = useState<"home" | "work" | "other">("home");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // 🌍 Reverse geocoding
  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch {
      toast.error("Failed to fetch address");
    }
  };

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };

  // 📡 Fetch addresses
  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAddresses(data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ➕ Add address
  const addAddress = async () => {
    if (
      !mobile ||
      !formattedAddress ||
      latitude === null ||
      longitude === null
    ) {
      toast.error("Please select location on map");
      return;
    }
    try {
      setAdding(true);
      await axios.post(
        `${restaurantService}/api/address/new`,
        {
          formattedAddress,
          flat,
          landmark,
          label,
          mobile,
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Address added");
      setMobile("");
      setFormattedAddress("");
      setFlat("");
      setLandmark("");
      setLabel("home");
      setLatitude(null);
      setLongitude(null);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setAdding(false);
    }
  };

  // 🗑 Delete address
  const deleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Address deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Select Delivery Address</h1>
        <p className="text-sm text-muted-foreground mt-1">Tap on the map to choose a location</p>
      </motion.div>

      {/* 🗺 Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-border shadow-md"
      >
        <MapContainer
          center={[latitude || 28.6139, longitude || 77.209]}
          zoom={13}
          className="h-full w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocationPicker setLocation={setLocation} />
          <LocateMeButton onLocate={setLocation} />
          {latitude && longitude && <Marker position={[latitude, longitude]} />}
        </MapContainer>
      </motion.div>

      {/* 📍 Selected address */}
      {formattedAddress && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl bg-success/5 dark:bg-success/10 border border-success/20 p-4 text-sm text-foreground"
        >
          <span className="font-semibold text-success">📍 Selected:</span>{" "}
          {formattedAddress}
        </motion.div>
      )}

      {/* 📝 Address Details Form */}
      {formattedAddress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Flat / House / Floor / Building"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              className="w-full rounded-xl border border-border bg-background dark:bg-surface/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
            />
            <input
              type="text"
              placeholder="Nearby Landmark (optional)"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full rounded-xl border border-border bg-background dark:bg-surface/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
            />
          </div>

          <div className="flex gap-3">
            {(["home", "work", "other"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLabel(l)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-all ${
                  label === l
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background dark:bg-surface/50 text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                {l === "home" ? "🏠 " : l === "work" ? "🏢 " : "📍 "}
                {l}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="number"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background dark:bg-surface/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={adding}
              onClick={addAddress}
              className="btn-premium flex items-center justify-center gap-2 px-8 py-3 text-sm disabled:opacity-60"
            >
              {adding ? <BiLoader className="animate-spin" /> : <BiPlus />}
              Save Address
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 📋 Saved Addresses */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Saved Addresses</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
            />
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-8 text-center shadow-sm">
            <div className="text-4xl mb-3">📍</div>
            <p className="font-medium text-foreground">No addresses saved</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first delivery address above</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <motion.div
              key={addr._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-2xl bg-surface border border-border p-4 shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {addr.label && (
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {addr.label === "home" ? "🏠" : addr.label === "work" ? "🏢" : "📍"} {addr.label}
                    </span>
                  )}
                  {addr.flat && <span className="text-sm font-bold text-foreground">{addr.flat}</span>}
                </div>
                <p className="text-sm font-medium text-foreground/80 line-clamp-2 leading-relaxed">
                  {addr.formattedAddress}
                  {addr.landmark ? `, Near ${addr.landmark}` : ""}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-2">
                  📞 {addr.mobile}
                </p>
              </div>
              <button
                onClick={() => deleteAddress(addr._id)}
                disabled={deletingId === addr._id}
                className="ml-3 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {deletingId === addr._id ? (
                  <BiLoader size={16} className="animate-spin" />
                ) : (
                  <BiTrash size={16} />
                )}
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddAddressPage;
