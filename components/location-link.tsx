import { mapsUrl } from "@/lib/maps";

export function LocationLink({ location, className }: { location: string; className?: string }) {
  return (
    <a
      href={mapsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? "text-neutral-500 underline decoration-dotted hover:text-neutral-900"}
    >
      {location}
    </a>
  );
}
