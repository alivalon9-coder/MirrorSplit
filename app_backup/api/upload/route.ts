// MusicItem.jsx
import React from "react";

export default function MusicItem({ item, onUpdated }) {
  const handleEdit = () => {
    // Navigate to edit page or open modal
    window.location.href = `/dashboard/music/edit/${item.id}`;
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this track? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/music/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }
      // Inform parent to remove from list or re-fetch
      onUpdated && onUpdated();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="music-row" onClick={() => console.log("row clicked")}>
      <div>{item.title}</div>
      <div>
        <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
          Edit
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
          Delete
        </button>
      </div>
    </div>
  );
}
