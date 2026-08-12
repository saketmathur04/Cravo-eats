import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";
import { motion } from "framer-motion";

interface props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchMyRestaurant }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      alert("All field are required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurant Added successfully");
      fetchMyRestaurant();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-border bg-secondary/30 dark:bg-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-lg rounded-2xl bg-surface border border-border/50 p-6 sm:p-8 space-y-5"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">🏪 Add Your Restaurant</h1>
          <p className="text-sm text-muted-foreground mt-1">Fill in the details to get started</p>
        </div>

        <input
          type="text"
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
        />
        <input
          type="number"
          placeholder="Contact Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClasses}
        />
        <textarea
          placeholder="Restaurant Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClasses} min-h-[80px] resize-none`}
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-secondary/30 dark:hover:bg-secondary/20 transition-colors">
          <BiUpload className="h-5 w-5 text-primary" />
          {image ? (
            <span className="text-foreground font-medium">{image.name}</span>
          ) : (
            "Upload restaurant image"
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <div className="flex items-start gap-3 rounded-xl bg-secondary/30 dark:bg-secondary/20 border border-border/50 p-4">
          <BiMapPin className="mt-0.5 h-5 w-5 text-primary shrink-0" />
          <div className="text-sm text-muted-foreground">
            {loadingLocation
              ? "Fetching your location..."
              : location?.formattedAddress || "Location not available"}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-premium w-full"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Add Restaurant"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AddRestaurant;
