import React from "react";
import { ArrowLeft } from "lucide-react";
import { memoryTimeline } from "../data/memories";
import { motion, useScroll, useTransform } from "framer-motion";

// This is where the magic happens!
export function Timeline({ onBack }) {
  const { scrollYProgress } = useScroll(); // Get scroll progress from 0 to 1

  // Map the scroll progress to a background Y position (parallax effect)
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <div className="h-screen w-screen overflow-y-scroll bg-slate-900 text-white relative">
      {/* 1. BACKGROUND MAP (Parallax Effect) */}
      <motion.div
        className="fixed inset-0 w-full h-[150vh] opacity-40 bg-cover bg-center"
        style={{
          backgroundImage: `url('/ourRoom2.jpg')`, // Use your room image zoomed in!
          y: y, // Apply the vertical movement based on scroll
        }}
      />
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      {/* 2. BACK BUTTON */}
      <div className="fixed top-5 left-5 z-50">
        <button
          onClick={onBack}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-slate-800 flex items-center gap-2"
        >
          <ArrowLeft size={24} /> Back to Room
        </button>
      </div>

      {/* 3. CONTENT (Actual Scrollable Story) */}
      <div className="relative z-40 max-w-2xl mx-auto pt-24 pb-48">
        <h1 className="text-5xl font-extrabold text-center mb-16 tracking-tight">
          Our Year, Our Map
        </h1>

        {memoryTimeline.map((item, index) => (
          <div key={item.id} className="relative mb-32">
            {/* The vertical timeline line (Placeholder) */}
            <div className="absolute left-1/2 w-1 bg-blue-500 h-full transform -translate-x-1/2"></div>

            <motion.div
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }} // Triggers when 30% of item is visible
              className={`p-6 bg-slate-800 rounded-lg shadow-2xl relative w-full md:w-5/12 
                         ${index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"}`}
            >
              <p className="text-sm uppercase text-blue-400 font-bold mb-1">
                {item.date}
              </p>
              <h2 className="text-3xl font-bold mb-3">{item.title}</h2>
              <p className="text-slate-300 mb-4">{item.description}</p>

              {/* Image Placeholder */}
              <div className="w-full h-40 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                {/* Replace this with your image later! */}
                <span className="text-sm">Image Placeholder: {item.image}</span>
              </div>

              {/* Circle Marker */}
              <div
                className={`absolute top-0 w-4 h-4 rounded-full border-4 border-slate-900 bg-blue-500 
                             ${index % 2 === 0 ? "md:right-[-25px]" : "md:left-[-25px]"} 
                             transform translate-y-1/2 md:translate-x-0`}
              ></div>
            </motion.div>
          </div>
        ))}
        <h2 className="text-4xl text-center pt-20 text-blue-400 font-bold">
          To be continued...
        </h2>
      </div>
    </div>
  );
}
