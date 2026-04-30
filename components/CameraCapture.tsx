"use client";

import { useRef, useState } from "react";

interface Props {
  onTextDetected: (text: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function CameraCapture({ onTextDetected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = async (file: File) => {
    setStatus("processing");
    setLines([]);
    setErrorMsg("");
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const r = await fetch(`${API_URL}/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!r.ok) throw new Error(`OCR fout: ${r.status}`);
      const data = await r.json();
      const detected: string[] = data.lines ?? [];

      if (detected.length > 0) {
        setLines(detected);
        setStatus("done");
      } else {
        setErrorMsg("Geen tekst gevonden in de foto.");
        setStatus("error");
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Onbekende fout");
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

  const reset = () => {
    setStatus("idle");
    setPreviewUrl(null);
    setLines([]);
    setErrorMsg("");
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

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
      />

      {/* Foto preview */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Genomen foto"
          className="w-full max-h-44 object-contain rounded-xl border border-cinema-border"
        />
      )}

      {/* Herkende regels — tik de filmtitel aan */}
      {status === "done" && lines.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <p className="text-cinema-muted text-xs text-center">
            Tik op de <span className="text-cinema-gold font-semibold">filmtitel</span>:
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
          <button onClick={reset} className="text-cinema-muted text-xs underline mt-1">
            Opnieuw proberen
          </button>
        </div>
      )}

      {/* Foutmelding */}
      {status === "error" && (
        <div className="w-full bg-red-900/30 border border-red-700 rounded-xl p-3">
          <p className="text-red-400 text-sm font-medium">{errorMsg || "Tekst niet herkend"}</p>
          <ul className="text-red-400 text-xs mt-1 list-disc list-inside space-y-1">
            <li>Meer licht op de titel</li>
            <li>Richt alleen op de titel, niet de hele poster</li>
            <li>Houd de camera stil</li>
          </ul>
          <button onClick={reset} className="mt-2 text-red-400 text-xs underline">
            Opnieuw proberen
          </button>
        </div>
      )}
    </div>
  );
}
