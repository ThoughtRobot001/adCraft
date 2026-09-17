import React from "react";
import { Brand, resolveColor } from "../../schema";

interface Props {
  brand: Brand;
  isLight?: boolean;
}

export const DiffEditorMockup: React.FC<Props> = ({ brand, isLight = true }) => {
  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  return (
    <div
      style={{
        padding: "20px 24px",
        fontFamily: brand.font,
        color: isLight ? "#0F172A" : "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* File Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "12px",
          borderBottom: isLight ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: primaryColor }}>
            § Section 14.2
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: isLight ? "#475569" : "#94A3B8" }}>
            enterprise_master_services_agreement.docx
          </span>
        </div>
        <div
          style={{
            backgroundColor: isLight ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.2)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#10B981",
            padding: "3px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span>✓</span>
          <span>Redline Verified</span>
        </div>
      </div>

      {/* Redline / Diff Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* Diff Lines */}
        <div
          style={{
            backgroundColor: isLight ? "rgba(15, 23, 42, 0.02)" : "rgba(255, 255, 255, 0.03)",
            borderRadius: "10px",
            padding: "16px 18px",
            fontSize: "13px",
            lineHeight: 1.6,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Deletion Line */}
          <div
            style={{
              backgroundColor: isLight ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.15)",
              borderLeft: "3px solid #EF4444",
              padding: "6px 10px",
              borderRadius: "0 6px 6px 0",
              color: isLight ? "#991B1B" : "#FCA5A5",
              textDecoration: "line-through",
            }}
          >
            - 14.2 Supplier shall remain liable without limitation for all direct, indirect, and punitive damages under European commercial code.
          </div>

          {/* Addition Line (AI Redline) */}
          <div
            style={{
              backgroundColor: isLight ? "rgba(16, 185, 129, 0.09)" : "rgba(16, 185, 129, 0.18)",
              borderLeft: "3px solid #10B981",
              padding: "8px 10px",
              borderRadius: "0 6px 6px 0",
              color: isLight ? "#065F46" : "#6EE7B7",
              fontWeight: 600,
            }}
          >
            + 14.2 Aggregate liability shall be strictly capped at total fees paid in the twelve (12) months preceding the incident.
          </div>

          {/* Retained Standard Clause */}
          <div
            style={{
              padding: "4px 10px",
              color: isLight ? "#64748B" : "#94A3B8",
              fontSize: "12px",
            }}
          >
            &nbsp; 14.3 Mutual confidentiality obligations survive termination for a period of three (3) years.
          </div>
        </div>

        {/* Floating AI Agent Insight Pill (shadcn Card style) */}
        <div
          style={{
            backgroundColor: isLight ? "#FFFFFF" : "rgba(30, 41, 59, 0.9)",
            border: isLight ? "1px solid rgba(15, 23, 42, 0.12)" : "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "12px",
            padding: "14px 16px",
            boxShadow: isLight
              ? "0 12px 28px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)"
              : "0 15px 35px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px", color: primaryColor }}>✦</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: primaryColor, textTransform: "uppercase" }}>
              {brand.name} Autonomous Legal Redlining
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.45, color: isLight ? "#334155" : "#E2E8F0" }}>
            Uncapped liability removed and pegged to standard 12-month aggregate fee cap. Risk score improved from 42 &rarr; 98.
          </p>
          <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
            <span
              style={{
                backgroundColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 600,
                color: isLight ? "#475569" : "#CBD5E1",
              }}
            >
              ⚡ Instant MSA Ingestion
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
