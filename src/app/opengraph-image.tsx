// FILE: src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "Sportivity - AI fitness form coach";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 45%, #f8f2fc 100%)",
          color: "#242424",
          padding: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderRadius: "999px",
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            padding: "16px 22px",
            fontSize: 28,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "#7161ef",
            }}
          />
          Sportivity
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: 820 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 72, lineHeight: 1.04, fontWeight: 600 }}>
            <div>Train smarter.</div>
            <div>Fix form faster.</div>
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "#595959" }}>
            AI-powered workout video feedback for squat, deadlift, and push-up form coaching.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: 24,
            color: "#595959",
          }}
        >
          <div
            style={{
              borderRadius: "999px",
              background: "#f2f2f2",
              padding: "12px 18px",
              border: "1px solid #e0e0e0",
            }}
          >
            pose tracking
          </div>
          <div
            style={{
              borderRadius: "999px",
              background: "#f2f2f2",
              padding: "12px 18px",
              border: "1px solid #e0e0e0",
            }}
          >
            session scores
          </div>
          <div
            style={{
              borderRadius: "999px",
              background: "#f2f2f2",
              padding: "12px 18px",
              border: "1px solid #e0e0e0",
            }}
          >
            voice coaching
          </div>
        </div>
      </div>
    ),
    size,
  );
}
