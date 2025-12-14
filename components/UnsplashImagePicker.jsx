"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadUnsplashImage } from "@/lib/uploadUnsplashImage";

export default function UnsplashImagePicker({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchImages() {
    if (!query.trim()) {
      toast.error("Enter a search keyword");
      return;
    }

    setLoading(true);
    setImages([]);

    try {
      const res = await fetch("/api/imagekit/unsplash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      toast.error(err.message || "Failed to search images");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(img) {
    if (!img?.url) {
      toast.error("Invalid image selection");
      return;
    }
    const toastId = toast.loading("Uploading image…");
    console.log(img);
    try {
      const uploaded = await uploadUnsplashImage(img);
      if (uploaded.success) {
        onSelect(uploaded.data);
      }
      toast.success("Image added!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl bg-slate-900 border border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Search Unsplash</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. ai workspace, dashboard, minimal"
            className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none"
          />
          <button
            onClick={searchImages}
            disabled={loading}
            className="px-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>

        {/* Grid */}
        <div className="px-4 pb-4 overflow-y-auto max-h-[70vh]">
          {loading && (
            <div className="flex justify-center py-12 text-slate-400">
              Searching images…
            </div>
          )}

          {!loading && images.length === 0 && (
            <p className="text-slate-500 text-center py-12">
              Search for something to see results
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => handleSelect(img)}
                className="group relative overflow-hidden rounded-lg border border-slate-700 hover:border-purple-500 transition"
              >
                <img
                  src={img.thumb}
                  alt={img.alt}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                />

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-end p-2 transition">
                  <p className="text-xs text-white truncate">
                    {img.attribution.photographer}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
