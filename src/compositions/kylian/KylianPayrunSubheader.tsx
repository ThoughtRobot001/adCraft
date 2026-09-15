import React from "react";

interface KylianPayrunSubheaderProps {
  opacity?: number;
}

export const KylianPayrunSubheader: React.FC<KylianPayrunSubheaderProps> = ({
  opacity = 1,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 114,
        left: 258,
        width: 1420,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        zIndex: 26,
        opacity,
      }}
    >
      {/* Left side: Back Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#001026",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.707 6.293a1 1 0 00-1.414 0l-4 4a1 1 0 000 1.414l4 4a1 1 0 001.414-1.414L10.414 13H15a1 1 0 100-2h-4.586l3.293-3.293a1 1 0 000-1.414z"
            fill="#001026"
          />
        </svg>
        <span>Back</span>
      </div>

      {/* Right side: View Pay Runs Button */}
      <div
        style={{
          height: "37px",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderRadius: "7.5px",
          backgroundColor: "#006699",
          color: "#FFFFFF",
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0, 102, 153, 0.2)",
        }}
      >
        <span>View Pay Runs</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.293 4.293a1 1 0 011.414 0l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414-1.414L14.586 12 8.293 5.707a1 1 0 010-1.414z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
};
