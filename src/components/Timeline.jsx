import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../supabaseClient";

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export function Timeline({ onBack, session }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      if (!session) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("memory_date", { ascending: false });

      if (error) {
        console.error("Error fetching memories:", error);
      } else {
        setMemories(data);
      }
      setLoading(false);
    }

    fetchMemories();
  }, [session]);

  const locations = memories.filter(m => m.latitude && m.longitude);

  return (
    <div className="h-screen w-screen overflow-y-scroll bg-slate-900 text-white">
      {/* BACK BUTTON */}
      <div className="fixed top-5 left-5 z-[1001]">
        <button
          onClick={onBack}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-slate-800 flex items-center gap-2"
        >
          <ArrowLeft size={24} /> Back to Room
        </button>
      </div>

      {/* CONTENT */}
      <div className="relative z-40 max-w-4xl mx-auto pt-24 pb-48 px-4">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-tight">
          Our Year, Our Map
        </h1>
        <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
          A map of the places we've been and the memories we've made, followed by a timeline of our journey.
        </p>

        {/* INTERACTIVE MAP */}
        <div className="h-[50vh] w-full rounded-xl overflow-hidden shadow-2xl mb-24 border-4 border-slate-800">
          <MapContainer center={[10, -20]} zoom={2} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {locations.map(location => (
              <Marker key={location.id} position={[location.latitude, location.longitude]}>
                <Popup>
                  <div className="text-base font-bold text-slate-800">{location.title}</div>
                  <p className="text-sm text-slate-600">{location.description}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>


        {/* TIMELINE */}
        <div className="relative max-w-2xl mx-auto">
          {/* The vertical timeline line */}
          <div className="absolute left-4 md:left-1/2 w-1 bg-blue-500/50 h-full transform md:-translate-x-1/2"></div>

          {loading ? (
            <div className="text-center text-slate-400">Loading timeline...</div>
          ) : (
            memories.map((item, index) => (
              <div key={item.id} className="relative mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className={`p-6 bg-slate-800 rounded-lg shadow-2xl relative w-full ml-10 md:ml-0 md:w-5/12 ${index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"}`}
                >
                  <p className="text-sm uppercase text-blue-400 font-bold mb-1">
                    {new Date(item.memory_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 className="text-3xl font-bold mb-3">{item.title}</h2>
                  <p className="text-slate-300 mb-4">{item.description}</p>

                  <div className="w-full h-40 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Circle Marker */}
                  <div
                    className={`absolute top-0 w-4 h-4 rounded-full border-4 border-slate-900 bg-blue-500 
                                 left-[-48px] md:left-auto
                                 ${index % 2 === 0 ? "md:right-[-33px]" : "md:left-[-33px]"} 
                                 transform translate-y-1/2`}
                  ></div>
                </motion.div>
              </div>
            ))
          )}
        </div>
        <h2 className="text-4xl text-center pt-20 text-blue-400 font-bold">
          To be continued...
        </h2>
      </div>
    </div>
  );
}
