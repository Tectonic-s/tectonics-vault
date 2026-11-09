import Image from "next/image";

/**
 * Editorial framed profile portrait for Tharun S.
 * Displays the photo inside a rounded, framed gallery print with
 * subtle specular sweep sheen.
 */
export default function ProfileSilhouette({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative aspect-square w-full overflow-hidden bg-neutral-900 group ${className}`}
    >
      <Image
        src="/profile-square.jpg"
        alt="Tharun S"
        fill
        sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 320px"
        priority
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Specular sweep — gallery light travelling across the glass of a
          framed print. */}
      <div
        data-sheen
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 opacity-40 z-10 transition-opacity duration-300 group-hover:opacity-60"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}
