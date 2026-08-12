import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Star } from "lucide-react";
import { useTheme } from "../context/ThemeProvider";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const RestaurantCard = ({ id, image, name, distance, isOpen }: props) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const rating = (4 + Math.abs((id.charCodeAt(0) % 10) / 10)).toFixed(1);
  const deliveryMin = 15 + (id.charCodeAt(1) % 15);

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className={`group cursor-pointer overflow-hidden premium-card ${
        !isOpen ? "opacity-60" : ""
      }`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"}
          alt={name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            !isOpen ? "grayscale" : ""
          }`}
        />
        
        {/* Gradient overlay in dark mode */}
        {isDark && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A13]/60 via-transparent to-transparent" />
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {!isOpen ? (
            <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Closed
            </span>
          ) : (
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${
              isDark
                ? "bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
                : "bg-primary shadow-sm"
            }`}>
              Open
            </span>
          )}
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white ${
            isDark
              ? "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 shadow-[0_2px_12px_rgba(236,72,153,0.3)]"
              : "bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm"
          }`}>
            <Star className="h-3 w-3 fill-white text-white" />
            {rating}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className={`truncate text-card-title text-foreground transition-colors duration-300 ${
          isDark ? "group-hover:text-pink-400" : "group-hover:text-primary"
        }`}>
          {name}
        </h3>
        <div className="flex flex-wrap items-center gap-2.5 mt-3">
          <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
            isDark
              ? "bg-white/[0.04] text-white/60 border border-white/[0.06]"
              : "bg-secondary/50 text-secondary-foreground"
          }`}>
            <MapPin className={`h-3.5 w-3.5 ${isDark ? "text-pink-400/60" : "text-primary"}`} />
            {distance} km
          </div>
          <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
            isDark
              ? "bg-white/[0.04] text-white/60 border border-white/[0.06]"
              : "bg-secondary/50 text-secondary-foreground"
          }`}>
            <Clock className={`h-3.5 w-3.5 ${isDark ? "text-purple-400/60" : "text-accent"}`} />
            {deliveryMin}-{deliveryMin + 5} min
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
