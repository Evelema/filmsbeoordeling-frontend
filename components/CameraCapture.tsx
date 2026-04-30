"use client";

import { useRef, useState } from "react";

interface Props {
  onTextDetected: (text: string) => void;
}

function cleanLine(line: string): string {
  return line
    .replace(/[^a-zA-Z0-9À-ÿ\s:\-']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CameraCapture({ onTextDetected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);

  const handleFile = async (file: File) => {
    setStatus("processing");
    setLines([]);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, { logger: () => {} });
      const { data } = await worker.recognize(file);
      await worker.terminate();

      // Haal alle afzonderlijke regels op en filter op kwaliteit
      const detectedLines = data.lines
        ?.map((l) => cleanLine(l.text))
        .filter((l) => l.length > 1 && (l.match(/[a-zA-ZÀ-ÿ]/g) || []).length >= 2)
        ?? [];

      if (detectedLines.length > 0) {
        setLines(detectedLines);
        setStatus("done");
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

  const handleSelectLine = (line: string) => {
    onTextDetected(line);
    setLines([]);
    setStatus("idle");
    setPreviewUrl(null);
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

      {/* Foto preview */}
      {previewUrl && status !== "idle" && (
        <img
          src={previewUrl}
          alt="Genomen foto"
          className="w-full max-h-40 object-contain rounded-xl border border-cinema-border"
        />
      )}

      {/* Kiesbare tekstregels */}
      {status === "done" && lines.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <p className="text-cinema-muted text-xs text-center">
            Tik op de <span className="text-cinema-gold font-semibold">filmtitel</span> hieronder:
          </p>
          {lines.map((line, i) => (
            <button
              key={i}
              onClick={() => handleSelectLine(line)}
              className="w-full text-left bg-cinema-card border border-cinema-border rounded-xl px-4 py-3 text-cinema-text text-sm active:border-cinema-gold active:bg-cinema-gold/10 transition-colors"
            >
              {line}
            </button>
          ))}
          <button
            onClick={() => { setLines([]); setStatus("idle"); setPreviewUrl(null); }}
            className="text-cinema-muted text-xs text-center mt-1 underline"
          >
            Opnieuw proberen
          </button>
        </div>
      )}

      {/* Foutmelding */}
      {status === "error" && (
        <div className="w-full bg-red-900/30 border border-red-700 rounded-xl p-3">
          <p className="text-red-400 text-sm font-medium">Tekst niet herkend</p>
          <ul className="text-red-400 text-xs mt-1 list-disc list-inside space-y-1">
            <li>Zorg voor genoeg licht</li>
            <li>Richt alleen op de titel, niet de hele hoes</li>
            <li>Houd de camera stil en recht</li>
          </ul>
          <button
            onClick={() => { setStatus("idle"); setPreviewUrl(null); }}
            className="mt-2 text-red-400 text-xs underline"
          >
            Opnieuw proberen
          </button>
        </div>
      )}
    </div>
  );
}
