import axios from "axios";
import { useState } from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
import { motion } from "framer-motion";

const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      alert("Name price and image is required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);
      await axios.post(`${restaurantService}/api/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item added successfully");
      resetForm();
      onItemAdded();
    } catch (error) {
      console.log(error);
      toast.error("failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-border bg-secondary/30 dark:bg-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md space-y-4 m-auto rounded-2xl bg-surface border border-border/50 p-6"
      style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}
    >
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Add Menu Item</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Add a new dish to your menu</p>
      </div>

      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClasses}
      />
      <textarea
        placeholder="Item description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputClasses} min-h-[80px] resize-none`}
      />
      <input
        type="number"
        placeholder="Price ₹"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className={inputClasses}
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-secondary/30 dark:hover:bg-secondary/20 transition-colors">
        <BiUpload className="h-5 w-5 text-primary" />
        {image ? (
          <span className="text-foreground font-medium">{image.name}</span>
        ) : (
          "Upload item image"
        )}
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
        disabled={loading}
        onClick={handleSubmit}
        className="btn-premium w-full disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Item"}
      </motion.button>
    </motion.div>
  );
};

export default AddMenuItem;
