import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Video served from public/ folder — NOT bundled into JS
// This lets the page load instantly while video streams in background
const heroVideo = "/hero-video.mp4";

interface HeroProps {
  localSearch: string;
  setLocalSearch: (value: string) => void;
}

const PHRASES = [
  "What are you craving tonight?",
  "Something spicy or comforting?",
  "Your next meal, just a tap away",
  "Hungry? Let's fix that.",
  "Discover something delicious",
];

export function Hero({ localSearch, setLocalSearch }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[95vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Dark overlay gradient for text readability and cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
        
        {/* Using local video asset */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105"
          src={heroVideo}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center px-6 w-full h-full text-white text-center mt-12 pb-16">
        
        {/* CravoEats Logo Typemark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-[5rem] lg:text-[6rem] font-black tracking-tighter italic" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
            Cravo<span className="text-primary italic">Eats</span>
          </h1>
        </motion.div>

        {/* Hero Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 text-balance drop-shadow-2xl"
        >
          Your culinary journey, perfected.
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-xl font-medium mb-6 opacity-90 max-w-2xl drop-shadow-md text-balance"
        >
          Curated dishes from elite kitchens, delivered with precision.
        </motion.p>

        {/* Dynamic Rotating Text Before Search */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8, delay: 0.3 }}
           className="relative h-8 mb-5 w-full flex justify-center text-primary font-medium text-lg md:text-xl"
        >
           <AnimatePresence mode="wait">
             <motion.span
                key={phraseIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="absolute drop-shadow-md tracking-wide"
             >
               {PHRASES[phraseIndex]}
             </motion.span>
           </AnimatePresence>
        </motion.div>

        {/* Smart Search Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-[800px] mb-12 shadow-2xl"
        >
          <div className="relative w-full shadow-2xl overflow-hidden rounded-2xl group border border-white/20 bg-white/10 backdrop-blur-md transition-all hover:bg-white/15 focus-within:bg-white/20">
            <input
              type="text"
              placeholder="Search for restaurants or dishes..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-transparent px-8 py-5 md:py-6 pl-14 text-lg md:text-xl text-white placeholder-white/50 focus:outline-none"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-focus-within:text-white transition-colors">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </motion.div>



        {/* Scroll Down Indicator */}
        <div 
           onClick={handleScrollDown}
           className="absolute bottom-8 flex flex-col items-center gap-2 opacity-70 cursor-pointer animate-bounce hover:opacity-100 transition-opacity z-30"
        >
           <span className="text-xs font-semibold uppercase tracking-widest text-white">Scroll down</span>
           <ChevronDown className="h-6 w-6 text-white" />
        </div>
      </div>
    </section>
  );
}
