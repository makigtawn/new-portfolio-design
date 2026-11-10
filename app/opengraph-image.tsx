import { ImageResponse } from "next/og";
import { getSiteContent } from "@/src/lib/content/load";

export const alt = "Developer portfolio social preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const content = getSiteContent();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "#F6F3EE",
        color: "#1B1A17",
        border: "1px solid #DCD7CE",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          color: "#716D65",
          fontSize: 22,
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        {content.profile.role} <span>·</span> {content.profile.location}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <div
          style={{
            fontSize: 76,
            lineHeight: 1.05,
            letterSpacing: "-5px",
            maxWidth: "1000px",
          }}
        >
          {content.profile.name}
        </div>
        <div style={{ color: "#B4532A", fontSize: 30 }}>
          {content.profile.proofPoint}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 21,
          color: "#716D65",
        }}
      >
        <span>{content.seo.siteTitle}</span>
        <span>Available for thoughtful projects</span>
      </div>
    </div>,
    size,
  );
}
