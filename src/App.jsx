import React, { useState, useEffect } from "react";
import { Fridge } from "./components/Fridge";
import { motion, AnimatePresence } from "framer-motion";
import roomImage from "./ourRoom2.png";
import { Timeline } from "./components/Timeline";
import { Arcade } from "./components/Arcade";
import { LivingRoom } from "./components/LivingRoom"; // New Import
import { supabase } from "./supabaseClient";
import { Auth } from "./components/Auth";

export default function App() {
  const [view, setView] = useState("ROOM"); // Options: 'ROOM', 'FRIDGE', 'TIMELINE', 'ARCADE', 'LIVING_ROOM' // Updated comment
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper component for invisible buttons to keep code clean
  function ClickZone({ top, left, width, height, label, onClick }) {
    return (
      <div
        onClick={onClick}
        className="absolute cursor-pointer group z-20"
        style={{ top, left, width, height }}
      >
        {/* The Glow Effect (Only visible on hover) */}
        <div className="w-full h-full rounded-xl border-2 border-white/0 group-hover:border-white/50 group-hover:bg-white/10 transition-all duration-300 relative">
          {/* The Floating Label */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-lg font-bold text-xs whitespace-nowrap border border-white/20">
              {label}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-white font-sans">
      <AnimatePresence mode="wait">
        {/* VIEW 1: THE COZY ROOM */}
        {view === "ROOM" && (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, x: 100 }}
            transition={{ duration: 0.5 }}
            className="relative h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${roomImage})` }}
          >
            {/* Dark Overlay (Very subtle, just to blend it) */}
            <div className="absolute inset-0 bg-black/10"></div>
            {/* Header Text */}
            <div className="absolute top-8 left-0 right-0 text-center z-10 pointer-events-none">
              <h1
                className="text-3xl md:text-5xl font-bold tracking-widest text-white drop-shadow-lg opacity-90"
                style={{ fontFamily: "serif" }}
              >
                OUR PLACE
              </h1>
              <p className="text-xs uppercase tracking-[0.4em] opacity-80 mt-2">
                Est. 2024
              </p>
            </div>
            {/* --- CLICK ZONES --- */}
            {/* 1. FRIDGE (Left side, tall) */}
            <ClickZone
              top="28%"
              left="1%"
              width="17%"
              height="58%"
              label="Open Fridge 🧊"
              onClick={() => setView("FRIDGE")}
            />
            {/* 2. MAP (Wall, above sofa) */}
            <ClickZone
              top="10%"
              left="24%"
              width="28%"
              height="32%"
              label="Orbit Map 📍"
              onClick={() => setView("TIMELINE")}
            />
            {/* 3. TV (Center-Right, foreground) */}
            <ClickZone
              top="45%"
              left="52%"
              width="28%"
              height="35%"
              label="Watch Movie 🎬"
              onClick={() => setView("LIVING_ROOM")} // Updated onClick
            />
            // 4. PC (Far Right, desk)
            <ClickZone
              top="48%"
              left="82%"
              width="18%"
              height="40%"
              label="Arcade 👾"
              onClick={() => setView("ARCADE")} // <--- MUST BE 'ARCADE', NOT 'BINDER'
            />
          </motion.div>
        )}

        {/* VIEW 2: THE FRIDGE */}
        {view === "FRIDGE" && (
          <motion.div
            key="fridge"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
          >
            <Fridge onBack={() => setView("ROOM")} />
          </motion.div>
        )}
        {/* VIEW 3: THE TIMELINE (Memory Lane) */}
        {view === "TIMELINE" && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
          >
            {/* We will build this component next! */}
            <Timeline onBack={() => setView("ROOM")} />
          </motion.div>
        )}
        {/* VIEW 4: THE ARCADE (Gamified RPG) */}
        {view === "ARCADE" && (
          <motion.div
            key="arcade"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
          >
            <Arcade session={session} onBack={() => setView("ROOM")} />
          </motion.div>
        )}

        {/* VIEW 5: THE VIRTUAL LIVING ROOM */}
        {view === "LIVING_ROOM" && (
          <motion.div
            key="living-room"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
          >
            <LivingRoom session={session} onBack={() => setView("ROOM")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
