import React from "react";
import { Brand, resolveColor } from "../../schema";

interface Props {
  brand: Brand;
  isLight?: boolean;
}

export const DataTableMockup: React.FC<Props> = ({ brand, isLight = true }) => {
  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  const rows = [
    {
      id: "MSA-9042",
      title: "Master Services Agreement",
      counterparty: "Anthropic PBC",
      risk: "Low Risk",
      riskScore: "98/100",
      status: "Cleared",
      statusColor: "#10B981",
      latency: "14ms",
      avatar: "AP",
    },
    {
      id: "DORA-218",
      title: "Operational Resilience Audit",
      counterparty: "Barclays EMEA",
      risk: "Audited",
      riskScore: "94/100",
      status: "Compliant",
      statusColor: primaryColor,
      latency: "28ms",
      avatar: "BC",
    },
    {
      id: "IP-7731",
      title: "Mutual Indemnification Cap",
      counterparty: "Snowflake Inc.",
      risk: "Redlined",
      riskScore: "76/100",
      status: "Auto-Redlined",
      statusColor: accentColor,
      latency: "42ms",
      avatar: "SF",
    },
    {
      id: "SLA-049",
      title: "High-Availability 99.99% Addendum",
      counterparty: "Datadog Cloud",
      risk: "Standard",
      riskScore: "99/100",
      status: "Approved",
      statusColor: "#10B981",
      latency: "19ms",
      avatar: "DD",
    },
  ];

  return (
    <div
      style={{
        padding: "20px 24px",
        fontFamily: brand.font,
        color: isLight ? "#0F172A" : "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Table Toolbar (shadcn/ui style) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "12px",
          borderBottom: isLight ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Active Contract Ingestions
          </span>
          <span
            style={{
              backgroundColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)",
              padding: "2px 8px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              color: isLight ? "#475569" : "#94A3B8",
            }}
          >
            4 active
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div
            style={{
              backgroundColor: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.06)",
              border: isLight ? "1px solid rgba(15, 23, 42, 0.12)" : "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 600,
              color: isLight ? "#475569" : "#94A3B8",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>⚡ Filter: All Pipelines</span>
          </div>
        </div>
      </div>

      {/* Table Headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.4fr 1.6fr 1.2fr 1.3fr 0.8fr",
          fontSize: "12px",
          fontWeight: 700,
          color: isLight ? "#64748B" : "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          padding: "4px 8px",
        }}
      >
        <div>Contract Document</div>
        <div>Counterparty</div>
        <div>Safety Score</div>
        <div>Pipeline State</div>
        <div style={{ textAlign: "right" }}>Latency</div>
      </div>

      {/* Table Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {rows.map((row, idx) => (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: "2.4fr 1.6fr 1.2fr 1.3fr 0.8fr",
              alignItems: "center",
              padding: "10px 8px",
              borderRadius: "8px",
              backgroundColor: idx % 2 === 1 ? (isLight ? "rgba(15, 23, 42, 0.02)" : "rgba(255, 255, 255, 0.02)") : "transparent",
              border: isLight ? "1px solid rgba(15, 23, 42, 0.04)" : "1px solid rgba(255, 255, 255, 0.04)",
              fontSize: "13px",
            }}
          >
            {/* Document Title with Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  backgroundColor: isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: primaryColor,
                }}
              >
                📄
              </div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <div style={{ fontWeight: 600, color: isLight ? "#0F172A" : "#F8FAFC" }}>{row.title}</div>
                <div style={{ fontSize: "11px", color: isLight ? "#64748B" : "#94A3B8" }}>{row.id}</div>
              </div>
            </div>

            {/* Counterparty */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 800,
                  color: isLight ? "#1E293B" : "#FFFFFF",
                }}
              >
                {row.avatar}
              </div>
              <span style={{ fontWeight: 500 }}>{row.counterparty}</span>
            </div>

            {/* Safety Score */}
            <div>
              <span
                style={{
                  backgroundColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: isLight ? "#0F172A" : "#FFFFFF",
                }}
              >
                {row.riskScore}
              </span>
            </div>

            {/* Status Chip (shadcn badge) */}
            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: `${row.statusColor}18`,
                  color: row.statusColor,
                  border: `1px solid ${row.statusColor}44`,
                  padding: "3px 9px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: row.statusColor }} />
                {row.status}
              </span>
            </div>

            {/* Latency */}
            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: "12px", color: isLight ? "#64748B" : "#94A3B8" }}>
              {row.latency}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
