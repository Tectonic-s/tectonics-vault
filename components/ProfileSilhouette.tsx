/**
 * Placeholder profile portrait matching the Figma: a black side-profile
 * head-and-shoulders silhouette on white, inside a rounded, cream-bordered
 * square. Drawn as inline SVG so no raster asset is required — swap for a
 * real photo later by replacing the <svg> with an <Image />.
 */
export default function ProfileSilhouette({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative aspect-square w-full overflow-hidden bg-white ${className}`}
    >
      <svg
        viewBox="0 0 300 300"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* Head-and-shoulders side profile, facing right */}
        <path
          fill="#000000"
          d="M96 300
             C96 258 96 236 108 220
             C118 206 138 200 150 190
             C160 182 162 170 158 160
             C150 168 140 170 132 166
             C120 160 112 146 112 128
             C112 96 134 72 166 72
             C196 72 216 96 216 128
             C216 150 210 170 204 190
             C198 210 196 220 210 232
             C226 246 240 262 246 300
             Z"
        />
      </svg>

      {/* Specular sweep — gallery light travelling across the glass of a
          framed print. Driven by GSAP so it can be paced and paused. */}
      <div
        data-sheen
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 opacity-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}
