import React, { useState } from "react";
import { Fridge } from "./components/Fridge";
import { motion, AnimatePresence } from "framer-motion";
import roomImage from "./ourRoom2.png";

export default function App() {
  const [view, setView] = useState("ROOM"); // Options: 'ROOM', 'FRIDGE'

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-white">
      <AnimatePresence mode="wait">
        {/* VIEW 1: THE COZY ROOM */}
        {view === "ROOM" && (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, x: 100 }} // Slight zoom + shift right when entering fridge
            transition={{ duration: 0.5 }}
            className="relative h-full w-full bg-cover bg-center"
            style={{
              // 1. Point to your local file in the public folder
              backgroundImage: `url(${roomImage})`,
            }}
          >
            {/* Dark Overlay (lighter this time so we see the art) */}
            <div className="absolute inset-0 bg-black/10"></div>

            {/* The "Welcome" Text */}
            <div className="absolute top-10 left-0 right-0 text-center drop-shadow-md z-10">
              <h1 className="text-4xl font-bold font-serif tracking-widest text-white/90">
                OUR PLACE
              </h1>
              <p className="text-sm uppercase tracking-[0.3em] opacity-80 mt-2">
                Est. 2024
              </p>
            </div>

            {/* --- CLICK ZONE: The Fridge --- */}
            {/* I calculated these % based on your image. It covers the fridge on the left. */}
            <div
              onClick={() => setView("FRIDGE")}
              className="absolute top-[35%] left-[6%] w-[18%] h-[50%] cursor-pointer group z-20"
            >
              {/* Hover Effect: A subtle glow around the fridge area */}
              <div className="w-full h-full rounded-xl border-2 border-white/0 group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-300 relative">
                {/* The Label tag */}
                <div className="absolute -right-2 top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-10">
                  <div className="bg-white text-black px-3 py-1 rounded shadow-lg font-bold text-sm whitespace-nowrap">
                    Open Fridge 🧊
                    {/* Little triangle pointer */}
                    <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white border-b-[6px] border-b-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- COMING SOON ZONES (Optional placeholders) --- */}

            {/* The Map (Orbit) */}
            <div
              className="absolute top-[10%] left-[25%] w-[25%] h-[30%] cursor-help opacity-50 hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
              title="Coming Soon: Orbit Map"
            ></div>

            {/* The PC (Games) */}
            <div
              className="absolute bottom-[20%] right-[0%] w-[30%] h-[40%] cursor-help opacity-50 hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
              title="Coming Soon: Arcade"
            ></div>
          </motion.div>
        )}

        {/* VIEW 2: THE FRIDGE */}
        {view === "FRIDGE" && (
          <motion.div
            key="fridge"
            initial={{ opacity: 0, x: -50 }} // Slide in from left (since fridge is on left)
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
          >
            <Fridge onBack={() => setView("ROOM")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
