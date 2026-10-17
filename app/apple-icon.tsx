import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same mark as app/icon.svg, full-bleed because iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="#1a1a1f" />
        <g stroke="#fff" strokeOpacity=".55" strokeWidth="1.8" strokeLinecap="round">
          <path d="M19.5 19.5L9 9.5M19.5 19.5L23 8.5M19.5 19.5L9.5 23.5M9 9.5L23 8.5" />
        </g>
        <circle cx="9" cy="9.5" r="2.6" fill="#fff" />
        <circle cx="23" cy="8.5" r="2.6" fill="#fff" />
        <circle cx="9.5" cy="23.5" r="2.6" fill="#fff" />
        <circle cx="19.5" cy="19.5" r="4" fill="#ea580c" />
      </svg>
    ),
    size
  );
}
