import Link from "next/link";
import { BRAND } from "@/lib/config";

export function Logo({
  className = "",
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "cream";
}) {
  const color = tone === "cream" ? "text-cream" : "text-forest";
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label={`${BRAND.name} home`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-full border ${
          tone === "cream" ? "border-cream/40" : "border-forest/30"
        } transition-transform group-hover:rotate-12`}
      >
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${color}`} fill="none">
          <path
            d="M12 21c0-5 3-9 8-11-1 6-4 9-8 11Zm0 0c0-5-3-9-8-11 1 6 4 9 8 11Zm0 0V9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={`font-display text-2xl leading-none tracking-tight ${color}`}
      >
        {BRAND.name}
      </span>
    </Link>
  );
}
