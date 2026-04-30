"use client";

import { useRef, useState } from "react";

interface Props {
  onTextDetected: (text: string) => void;
}

function cleanOcrText(raw: string): string {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2)
    // Houd alleen regels met minstens 2 gewone letters
    .filter((l) => (l.match(/[a-zA-ZÀ-ÿ]/g) || []).length >= 2)
    .join(" ")
    // Verwijder alles behalve letters, cijfers en basisleestekens
    .replace(/[^a-zA-Z0-9À-ÿ\s:\-']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CameraCapture({ onTextDetected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>("");

  const handleFile = async (file: File) => {
    setStatus("processing");
    setRawText("");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const { createWorker } = await import("tesseract.js");
      // Gebruik alleen Engels voor snellere en betrouwbaardere herkenning
      const worker = await createWorker("eng", 1, {
        logger: () => {},
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const text = cleanOcrText(data.text);
      setRawText(text);

      if (text.length > 1) {
        setStatus("done");
        // Zet tekst in zoekbalk maar zoek NIET automatisch —
        // gebruiker controleert eerst en tikt dan op 🔍
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
    e.target.value = "";
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
            Tekst herkennen…
          </>
        ) : (
          <>
            <span className="text-2xl">📷</span>
            Foto maken van titel
          </>
        )}
      </button>

      {/* Verborgen file input */}
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

          {status === "processing" && (
            <span className="text-cinema-muted text-sm">Bezig met herkennen…</span>
          )}

          {status === "done" && rawText && (
            <div className="w-full bg-cinema-card border border-cinema-gold/40 rounded-xl p-3">
              <p className="text-cinema-muted text-xs mb-1">Herkende tekst — controleer en druk op 🔍:</p>
              <p className="text-cinema-text text-sm font-medium">{rawText}</p>
            </div>
          )}

          {status === "error" && (
            <div className="w-full bg-red-900/30 border border-red-700 rounded-xl p-3">
              <p className="text-red-400 text-sm">Tekst niet herkend. Probeer:</p>
              <ul className="text-red-400 text-xs mt-1 list-disc list-inside">
                <li>Meer licht op de titel</li>
                <li>Dichter bij de tekst</li>
                <li>Rustige achtergrond</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
