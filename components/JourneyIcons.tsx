/**
 * Line-glyph icons for the Journey timeline wheel, drawn black on the
 * cream node circles. Each is authored in a 24×24 box; the wheel places
 * them with a translate(-12,-12) so (0,0) is the glyph centre.
 */
type IconName = "backpack" | "gradcap" | "briefcase" | "monitor";

const stroke = {
  fill: "none",
  stroke: "#0d0d0d",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function JourneyIcon({ name }: { name: IconName }) {
  switch (name) {
    case "backpack":
      return (
        <g {...stroke}>
          <path d="M8 10 V8 a4 4 0 0 1 8 0 V10" />
          <rect x="5" y="10" width="14" height="11" rx="3" />
          <path d="M8.5 21 V15.5 H15.5 V21" />
          <path d="M8.5 15.5 H15.5" />
        </g>
      );
    case "gradcap":
      return (
        <g {...stroke}>
          <path d="M3 8.5 L12 5 L21 8.5 L12 12 Z" />
          <path d="M6.5 10 V14.5 C6.5 15.9 9 17 12 17 C15 17 17.5 15.9 17.5 14.5 V10" />
          <path d="M21 8.5 V13.6" />
          <circle cx="21" cy="14.3" r="0.9" fill="#0d0d0d" stroke="none" />
        </g>
      );
    case "briefcase":
      return (
        <g {...stroke}>
          <rect x="4" y="8.5" width="16" height="11" rx="2.5" />
          <path d="M9.5 8.5 V7 a1.5 1.5 0 0 1 1.5-1.5 h2 a1.5 1.5 0 0 1 1.5 1.5 V8.5" />
          <path d="M4 13 H20" />
        </g>
      );
    case "monitor":
      return (
        <g {...stroke}>
          <rect x="3.5" y="5" width="17" height="11" rx="2" />
          <path d="M9.5 20 H14.5" />
          <path d="M12 16 V20" />
        </g>
      );
  }
}
