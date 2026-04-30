"use client";

import StarRating from "./StarRating";

export interface Film {
  id: string | null;
  title: string;
  year: number | null;
  rating: number | null;
  votes: number | null;
  url: string;
  poster: string;
  description: string;
}

interface Props {
  film: Film;
}

export default function MovieCard({ film }: Props) {
  return (
    <div className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden shadow-lg">
      <div className="flex gap-3 p-4">
        {/* Poster */}
        {film.poster ? (
          <img
            src={film.poster}
            alt={film.title}
            className="w-20 h-28 object-cover rounded-lg flex-shrink-0 bg-cinema-border"
          />
        ) : (
          <div className="w-20 h-28 rounded-lg flex-shrink-0 bg-cinema-border flex items-center justify-center text-3xl">
            🎬
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col gap-2 min-w-0">
          <div>
            <h2 className="text-cinema-text font-bold text-base leading-tight line-clamp-2">
              {film.title}
            </h2>
            {film.year && (
              <span className="text-cinema-muted text-sm">{film.year}</span>
            )}
          </div>

          <StarRating rating={film.rating} />

          {film.votes != null && film.votes > 0 && (
            <span className="text-cinema-muted text-xs">
              {film.votes.toLocaleString("nl-NL")} stemmen
            </span>
          )}

          {film.url && (
            <a
              href={film.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cinema-gold text-xs underline mt-auto"
            >
              Bekijk op MovieMeter →
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {film.description && (
        <div className="px-4 pb-4">
          <p className="text-cinema-muted text-sm line-clamp-3 leading-relaxed">
            {film.description}
          </p>
        </div>
      )}
    </div>
  );
}
