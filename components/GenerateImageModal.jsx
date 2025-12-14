"use client";

import { useState } from "react";
import { generateAndUploadImage } from "@/app/actions/openai";
import { toast } from "sonner";

export default function GenerateImageModal({ onSelect, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);

    const res = await generateAndUploadImage(prompt);

    if (res.success) {
      onSelect(res.url);
      toast.success("Image generated!");
      onClose();
    } else {
      toast.error(res.error);
    }

    setLoading(false);
  }

  return (
    <div className="p-6 bg-slate-900 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">Generate Image with AI</h3>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image..."
        className="w-full p-3 rounded bg-slate-800 text-white"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 w-full bg-purple-600 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>
    </div>
  );
}
