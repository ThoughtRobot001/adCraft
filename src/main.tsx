import React from "react";
import ReactDOM from "react-dom/client";
import { Studio } from "./studio/Studio";
import "./studio/studio.css";

class StudioErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("[AdCraft ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px",
            color: "#F43F5E",
            background: "#07080C",
            minHeight: "100vh",
            fontFamily: "monospace",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "20px", color: "#FDA4AF", marginBottom: "12px" }}>
              🚨 AdCraft Studio Render Exception
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "20px" }}>
              A client-side runtime error occurred during component rendering.
            </p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "rgba(244,63,94,0.08)",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid rgba(244,63,94,0.3)",
                fontSize: "13px",
                lineHeight: "1.5",
                color: "#FECDD3",
              }}
            >
              {this.state.error?.toString()}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#8B5CF6",
                color: "#FFF",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <StudioErrorBoundary>
      <Studio />
    </StudioErrorBoundary>
  </React.StrictMode>
);
