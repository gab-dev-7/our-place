import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Image, Calendar, BookOpen, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const OPENCAGE_API_KEY = "YOUR_OPENCAGE_API_KEY"; // TODO: Replace with your actual API key

async function getCoordinatesForLocation(location) {
  if (!location) return null;

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    location
  )}&key=${OPENCAGE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}


export function Couch({ onBack, session }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemory, setNewMemory] = useState({ title: "", description: "", memory_date: "", file: null, location: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMemory({ ...newMemory, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewMemory({ ...newMemory, file: e.target.files[0] });
    }
  };

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!newMemory.file || !newMemory.title || !newMemory.memory_date) {
      alert("Please fill in title, date, and select an image.");
      return;
    }

    setUploading(true);

    let coords = null;
    if (newMemory.location) {
      coords = await getCoordinatesForLocation(newMemory.location);
      if (!coords) {
        alert(`Could not find coordinates for "${newMemory.location}". Please check the spelling or be more specific.`);
        setUploading(false);
        return;
      }
    }

    const user = session.user;
    const fileExt = newMemory.file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("memories")
      .upload(filePath, newMemory.file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      alert("Failed to upload image.");
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("memories")
      .getPublicUrl(filePath);

    // Insert metadata into Supabase table
    const { error: insertError } = await supabase.from("memories").insert({
      user_id: user.id,
      image_url: publicUrl,
      title: newMemory.title,
      description: newMemory.description,
      memory_date: newMemory.memory_date,
      latitude: coords ? coords.latitude : null,
      longitude: coords ? coords.longitude : null,
    });

    if (insertError) {
      console.error("Error inserting memory:", insertError);
      alert("Failed to save memory.");
    } else {
      setNewMemory({ title: "", description: "", memory_date: "", file: null, location: "" });
      setIsModalOpen(false);
      fetchMemories(); // Refresh the gallery
    }

    setUploading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-800 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-800/80 backdrop-blur-lg shadow-md p-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="bg-white/90 hover:bg-white p-2 rounded-full text-slate-800 flex items-center gap-2"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Memory Archive 🛋️</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Add Memory
        </button>
      </div>

      {/* Gallery */}
      <div className="p-6">
        {loading ? (
          <div className="text-center text-slate-400">Loading memories...</div>
        ) : memories.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            <h2 className="text-2xl font-bold mb-2">No memories yet!</h2>
            <p>Click "Add Memory" to start our collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <div key={memory.id} className="bg-slate-700 rounded-lg shadow-lg overflow-hidden group">
                <img src={memory.image_url} alt={memory.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{memory.title}</h3>
                  <p className="text-sm text-slate-400 mb-2">
                    {new Date(memory.memory_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-slate-300">{memory.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-700"
              onClick={(e) => e.stopPropagation()} // Prevent closing on click inside
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add a New Memory</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-700">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddMemory} className="space-y-4">
                {/* Title */}
                <div className="relative">
                  <BookOpen className="absolute top-3 left-3 text-slate-500" size={20} />
                  <input
                    type="text"
                    name="title"
                    placeholder="Memory Title"
                    value={newMemory.title}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 pl-10 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                {/* Description */}
                <textarea
                  name="description"
                  placeholder="What happened?"
                  value={newMemory.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 h-24 focus:outline-none focus:border-blue-500"
                />
                {/* Date */}
                <div className="relative">
                  <Calendar className="absolute top-3 left-3 text-slate-500" size={20} />
                  <input
                    type="date"
                    name="memory_date"
                    value={newMemory.memory_date}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 pl-10 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                {/* Location */}
                <div className="relative">
                  <MapPin className="absolute top-3 left-3 text-slate-500" size={20} />
                  <input
                    type="text"
                    name="location"
                    placeholder="City, Country"
                    value={newMemory.location}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 pl-10 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {/* File Input */}
                <div className="relative">
                  <Image className="absolute top-3 left-3 text-slate-500" size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 pl-10 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? "Saving..." : "Save Memory"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
