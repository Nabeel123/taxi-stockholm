import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon (apple-touch-icon). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14213d",
          borderRadius: "18%",
        }}
      >
        <span
          style={{
            fontSize: 98,
            fontWeight: 800,
            color: "#ffd60a",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1,
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size },
  );
}
