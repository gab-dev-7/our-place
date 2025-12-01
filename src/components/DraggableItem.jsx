import React from "react";
import { useDraggable } from "@dnd-kit/core";

export function DraggableItem({ item }) {
  // This hook connects the DOM element to the dnd-kit system
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { ...item }, // Pass the item data so we know what we are dragging
  });

  // This calculates where the item is while you are dragging it
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${item.rotation}deg)`
      : `rotate(${item.rotation}deg)`,
    position: "absolute",
    top: `${item.y}px`,
    left: `${item.x}px`,
    zIndex: item.z_index,
    touchAction: "none", // Critical for mobile support
  };

  // Render different styles based on the item type
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-move select-none shadow-lg transition-shadow hover:shadow-2xl"
    >
      {/* If it's text, look like a sticky note */}
      {item.type === "text" && (
        <div className="bg-yellow-200 text-slate-800 p-4 w-40 h-40 flex items-center justify-center text-center font-handwriting rounded-sm transform hover:scale-105 transition-transform font-bold font-mono">
          {item.content}
        </div>
      )}

      {/* If it's an image, look like a polaroid */}
      {item.type === "image" && (
        <div className="bg-white p-2 pb-8 w-48 shadow-md transform hover:scale-105 transition-transform">
          <img
            src={item.content}
            alt="memories"
            className="w-full h-auto object-cover pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}
