"use client";

import { useState, useCallback } from "react";
import CameraCapture from "@/components/CameraCapture";
import SearchBar from "@/components/SearchBar";
import MovieCard, { Film } from "@/components/MovieCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Status = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [ocrText, setOcrText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Film[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const search = useCallback(async (query: string) => {
    setSearchQuery(query);
    setStatus("loading");
    setResults([]);
    setErrorMsg("");

    try {
      const res = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error(`Server fout: ${res.status}`);
      const data = await res.json();
      const films: Film[] = data.results ?? [];
      setResults(films);
      setStatus("done");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Onbekende fout opgetreden"
      );
      setStatus("error");
    }
  }, []);

  const handleOcrText = useCallback((text: string) => {
    // Vul de zoekbalk in maar zoek nog niet —
    // gebruiker controleert de herkende tekst eerst
    setOcrText(text);
  }, []);

  return (
    <main className="min-h-screen bg-cinema-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cinema-bg/95 backdrop-blur border-b border-cinema-border px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-cinema-gold font-bold text-xl tracking-tight mb-1">
            🎬 Filmsbeoordeling
          </h1>
          <p className="text-cinema-muted text-xs">
            Beoordelingen via MovieMeter.nl
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Camera sectie */}
        <section>
          <CameraCapture onTextDetected={handleOcrText} />
        </section>

        {/* Scheidingslijn */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-cinema-border" />
          <span className="text-cinema-muted text-xs uppercase tracking-wider">
            of typ handmatig
          </span>
          <div className="flex-1 h-px bg-cinema-border" />
        </div>

        {/* Zoekbalk */}
        <section>
          <SearchBar
            initialValue={ocrText}
            onSearch={search}
            loading={status === "loading"}
          />
        </section>

        {/* Resultaten */}
        <section className="flex flex-col gap-4">
          {/* Laden */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-10 text-cinema-muted">
              <span className="text-4xl animate-pulse">🎞️</span>
              <span>MovieMeter wordt geraadpleegd…</span>
            </div>
          )}

          {/* Foutmelding */}
          {status === "error" && (
            <div className="bg-red-900/30 border border-red-700 rounded-2xl p-4 text-red-400 text-sm">
              <strong>Fout:</strong> {errorMsg}
              <br />
              <span className="text-red-500 text-xs">
                Controleer of de backend actief is op{" "}
                <code className="bg-red-900/50 px-1 rounded">{API_URL}</code>
              </span>
            </div>
          )}

          {/* Geen resultaten */}
          {status === "done" && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-cinema-muted">
              <span className="text-4xl">🔎</span>
              <p>
                Geen films gevonden voor{" "}
                <strong className="text-cinema-text">"{searchQuery}"</strong>
              </p>
              <p className="text-xs">Probeer een andere spelling</p>
            </div>
          )}

          {/* Film resultaten */}
          {status === "done" && results.length > 0 && (
            <>
              <p className="text-cinema-muted text-sm">
                {results.length} resultaa{results.length === 1 ? "t" : "ten"}{" "}
                voor{" "}
                <strong className="text-cinema-text">"{searchQuery}"</strong>
              </p>
              {results.map((film, i) => (
                <MovieCard key={film.id ?? i} film={film} />
              ))}
            </>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-cinema-muted text-xs border-t border-cinema-border">
        Data via{" "}
        <a
          href="https://www.moviemeter.nl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cinema-gold underline"
        >
          MovieMeter.nl
        </a>
      </footer>
    </main>
  );
}
