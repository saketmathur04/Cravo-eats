import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState, useRef } from "react";
import { ShoppingCart, MapPin, Search, Sun, Moon, User, Palette } from "lucide-react";
import { useTheme, ACCENT_COLORS, type AccentKey } from "../context/ThemeProvider";
import { Button } from "./ui/button";

const Navbar = () => {
  const { isAuth, city, quantity } = useAppData();
  const { resolvedTheme, setTheme, accentColor, setAccentColor } = useTheme();
  const currLocation = useLocation();

  const isHomePage = currLocation.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setIsPaletteOpen(false);
      }
    }
    if (isPaletteOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isPaletteOpen]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link 
          to={"/"} 
          className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-colors">
            <span className="text-xl font-bold">C</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground hidden sm:block">
            Cravo
          </span>
        </Link>

        {isHomePage && (
           <div className="hidden md:flex flex-1 max-w-md mx-8 items-center rounded-full border border-border bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300 overflow-hidden">
             <div className="flex items-center gap-2 pl-4 pr-3 border-r border-border text-foreground/70">
               <MapPin className="h-4 w-4 text-primary transition-colors" />
               <span className="text-sm truncate w-24 font-medium">{city}</span>
             </div>
             <div className="flex flex-1 items-center gap-2 px-4 shadow-inner">
               <Search className="h-4 w-4 text-foreground/50" />
               <input
                 type="text"
                 placeholder="Search for restaurants..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/50"
               />
             </div>
           </div>
        )}

        <div className="flex items-center gap-1 sm:gap-3">
          
          {/* Theme customizer popover */}
          <div className="relative" ref={paletteRef}>
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              aria-label="Customize accent color"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-hover hover:text-foreground transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Palette className="h-5 w-5" />
            </button>
            {isPaletteOpen && (
              <div className="absolute top-12 right-0 bg-surface border border-border shadow-xl rounded-2xl p-3 flex gap-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                {(Object.keys(ACCENT_COLORS) as Array<AccentKey>).map((key) => (
                   <button
                     key={key}
                     onClick={() => setAccentColor(key)}
                     aria-label={`Set theme to ${key}`}
                     className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                       accentColor === key ? "scale-110 border-foreground/50 shadow-md" : "border-transparent"
                     }`}
                     style={{ backgroundColor: ACCENT_COLORS[key].base }}
                   />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Theme"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-hover hover:text-foreground transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link 
            to={"/cart"} 
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-hover transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
          >
            <ShoppingCart className="h-5 w-5 text-foreground/80 group-hover:text-primary transition-colors" />
            {(quantity > 0) && (
              <span className="absolute top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-md transform translate-x-1/4 -translate-y-1/4 transition-colors">
                {quantity}
              </span>
            )}
          </Link>

          {isAuth ? (
            <Link to="/account" tabIndex={-1}>
              <Button variant="outline" className="hidden sm:flex rounded-full border-border/50 shadow-sm gap-2 h-10">
                <User className="h-4 w-4" />
                <span>Account</span>
              </Button>
              <Button variant="ghost" className="sm:hidden rounded-full h-10 w-10 p-0 flex items-center justify-center border border-border/50 shadow-sm" aria-label="Account">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/Login" tabIndex={-1}>
              <Button variant="primary" className="rounded-full px-5 shadow-md shadow-primary/20 h-10 transition-colors">Login</Button>
            </Link>
          )}
        </div>
      </div>

      {isHomePage && (
         <div className="md:hidden border-t border-border px-4 py-3 bg-background/50 backdrop-blur-sm">
           <div className="mx-auto flex items-center rounded-full border border-border bg-background shadow-inner focus-within:ring-2 focus-within:ring-primary/50 transition-all">
             <div className="flex items-center gap-2 px-3 border-r border-border text-foreground/70">
               <MapPin className="h-4 w-4 text-primary shrink-0 transition-colors" />
               <span className="text-sm truncate max-w-[80px] font-medium">{city}</span>
             </div>
             <div className="flex flex-1 items-center gap-2 px-3">
               <Search className="h-4 w-4 text-foreground/50 shrink-0" />
               <input
                 type="text"
                 placeholder="Search restaurants"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full py-2.5 text-sm bg-transparent outline-none text-foreground"
               />
             </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default Navbar;
