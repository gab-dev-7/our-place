import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { X } from "lucide-react";

export function DraggableItem({ item, onDelete }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { ...item },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${item.rotation}deg)`
      : `rotate(${item.rotation}deg)`,
    position: "absolute",
    top: `${item.y}px`,
    left: `${item.x}px`,
    zIndex: item.z_index,
    touchAction: "none",
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent the drag from starting
    onDelete(item.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-move select-none shadow-lg transition-shadow hover:shadow-2xl group"
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
        aria-label="Delete item"
      >
        <X size={16} />
      </button>

      {item.type === "text" && (
        <div className="bg-yellow-200 text-slate-800 p-4 w-40 h-40 flex items-center justify-center text-center font-handwriting rounded-sm transform hover:scale-105 transition-transform font-bold font-mono">
          {item.content}
        </div>
      )}

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
