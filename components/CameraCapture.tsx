"use client";

import { useRef, useState } from "react";

interface Props {
  onTextDetected: (text: string) => void;
}

export default function CameraCapture({ onTextDetected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setStatus("processing");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Dynamisch laden zodat Tesseract.js niet server-side wordt uitgevoerd
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("nld+eng", 1, {
        logger: () => {}, // stil houden
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const text = data.text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 1)
        .join(" ")
        .replace(/[^a-zA-Z0-9À-ÿ\s:'''\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      setStatus("done");

      if (text.length > 0) {
        onTextDetected(text);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input zodat dezelfde foto opnieuw gebruikt kan worden
    e.target.value = "";
  };

  const statusLabel: Record<typeof status, string> = {
    idle: "",
    processing: "Tekst herkennen...",
    done: "Tekst herkend!",
    error: "Geen tekst gevonden, probeer opnieuw",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Camera knop */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === "processing"}
        className="w-full flex items-center justify-center gap-3 bg-cinema-gold text-black font-bold py-4 rounded-2xl text-lg active:scale-95 transition-transform disabled:opacity-60"
      >
        {status === "processing" ? (
          <>
            <span className="animate-spin text-xl">⏳</span>
            Bezig met herkennen…
          </>
        ) : (
          <>
            <span className="text-2xl">📷</span>
            Foto maken van titel
          </>
        )}
      </button>

      {/* Verborgen file input — opent camera op iPhone */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
      />

      {/* Preview + status */}
      {previewUrl && (
        <div className="w-full flex flex-col items-center gap-2">
          <img
            src={previewUrl}
            alt="Genomen foto"
            className="w-40 h-28 object-cover rounded-xl border border-cinema-border"
          />
          {status !== "idle" && (
            <span
              className={`text-sm ${
                status === "error" ? "text-red-400" : "text-cinema-muted"
              }`}
            >
              {statusLabel[status]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
