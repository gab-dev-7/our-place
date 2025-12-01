import React, { useEffect, useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
// Note: We use .. to go up to the source folder
import { supabase } from "../supabaseClient";
import { DraggableItem } from "./DraggableItem";
import { DeepDiveClipboard } from "./DeepDiveClipboard";
import { Plus, ArrowLeft } from "lucide-react";

export function Fridge({ onBack }) {
  const [items, setItems] = useState([]);

  // 1. Setup Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // 2. Load items (Moved INSIDE useEffect to prevent linter errors)
  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from("fridge_items").select("*");
      if (!error) setItems(data);
    }

    fetchItems();
  }, []);

  // 3. Handle Dragging
  async function handleDragEnd(event) {
    const { active, delta } = event;
    const item = items.find((i) => i.id === active.id);
    if (!item) return;

    const newX = Number(item.x) + delta.x;
    const newY = Number(item.y) + delta.y;

    // Optimistic UI Update
    setItems((prev) =>
      prev.map((i) => (i.id === active.id ? { ...i, x: newX, y: newY } : i)),
    );

    await supabase
      .from("fridge_items")
      .update({ x: newX, y: newY })
      .eq("id", active.id);
  }

  // 4. Add Note
  async function addNote() {
    const text = prompt("What do you want to stick on the fridge?");
    if (!text) return;

    const newItem = {
      type: "text",
      content: text,
      x: 150 + Math.random() * 50,
      y: 150 + Math.random() * 50,
      rotation: Math.floor(Math.random() * 20) - 10,
      z_index: 100,
    };

    const { data, error } = await supabase
      .from("fridge_items")
      .insert([newItem])
      .select();

    if (!error) {
      setItems((prev) => [...prev, ...data]);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 overflow-hidden relative">
      {/* Background Dots */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none bg-slate-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
        }}
      ></div>
      {/* Header */}
      <div className="absolute top-5 left-5 z-50 flex items-center gap-4">
        <button
          onClick={onBack}
          className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all flex items-center justify-center text-slate-700"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-slate-700">Our Fridge 🧊</h1>
      </div>

      {/* Interactive Elements */}
      <DeepDiveClipboard />

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
      </DndContext>

      {/* Add Button */}
      <button
        onClick={addNote}
        className="absolute bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 hover:scale-110 transition-all z-50 flex items-center gap-2 font-bold"
      >
        <Plus size={24} /> Add Note
      </button>
    </div>
  );
}
