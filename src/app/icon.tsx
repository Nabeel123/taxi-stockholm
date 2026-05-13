import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** App icon for manifest / Android — navy tile, accent “T”. */
export default function Icon() {
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
          borderRadius: "20%",
        }}
      >
        <span
          style={{
            fontSize: 280,
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
