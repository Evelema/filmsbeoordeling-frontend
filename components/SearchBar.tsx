"use client";

import { useState, useEffect } from "react";

interface Props {
  initialValue?: string;
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ initialValue = "", onSearch, loading }: Props) {
  const [value, setValue] = useState(initialValue);

  // Als OCR een tekst detecteert, vul het zoekveld in
  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length > 0) onSearch(trimmed);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Filmtitel typen…"
        className="flex-1 bg-cinema-card border border-cinema-border rounded-xl px-4 py-3 text-cinema-text placeholder:text-cinema-muted text-base outline-none focus:border-cinema-gold transition-colors"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        onClick={submit}
        disabled={loading || value.trim().length === 0}
        className="bg-cinema-gold text-black font-bold px-5 py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50 text-lg"
      >
        {loading ? "…" : "🔍"}
      </button>
    </div>
  );
}
