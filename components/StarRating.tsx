"use client";

interface Props {
  rating: number | null;
  max?: number;
}

export default function StarRating({ rating, max = 5 }: Props) {
  if (rating === null || rating === undefined) {
    return <span className="text-cinema-muted text-sm">Geen beoordeling</span>;
  }

  const percentage = (rating / max) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block">
        {/* Background stars (grey) */}
        <div className="flex text-cinema-border text-2xl leading-none select-none">
          {"★★★★★"}
        </div>
        {/* Foreground stars (gold), clipped */}
        <div
          className="absolute inset-0 flex text-cinema-gold text-2xl leading-none overflow-hidden select-none"
          style={{ width: `${percentage}%` }}
        >
          {"★★★★★"}
        </div>
      </div>
      <span className="text-cinema-gold font-bold text-lg">
        {rating.toFixed(1)}
        <span className="text-cinema-muted text-sm font-normal"> / {max}</span>
      </span>
    </div>
  );
}
