import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface KylianCursorProps {
  clickCheckinFrame?: number;     // default 70
  clickPayrunSidebarFrame?: number; // default 175
  clickStartPayrunFrame?: number; // default 235
  click1Frame?: number; // backwards compatibility alias for clickPayrunSidebarFrame
  click2Frame?: number; // backwards compatibility alias for clickStartPayrunFrame
}

export const KylianCursor: React.FC<KylianCursorProps> = ({
  clickCheckinFrame = 70,
  clickPayrunSidebarFrame: rawPayrunSidebar = 175,
  clickStartPayrunFrame: rawStartPayrun = 235,
  click1Frame,
  click2Frame,
}) => {
  const clickPayrunSidebarFrame = click1Frame ?? rawPayrunSidebar;
  const clickStartPayrunFrame = click2Frame ?? rawStartPayrun;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Key Coordinates (in 1678x1080 canvas)
  const entryPos = { x: 1250, y: 880 };
  const checkinBtnPos = { x: 327, y: 141 };
  const dashboardInspectPos = { x: 580, y: 440 };
  const payrunSidebarPos = { x: 150, y: 636 };
  const startPayrunBtnPos = { x: 588, y: 554 };

  // Cursor is hidden during initial loader hydration until frame 42
  if (frame < 42) return null;

  let currentX = entryPos.x;
  let currentY = entryPos.y;
  let cursorOpacity = 1;

  if (frame < clickCheckinFrame) {
    // Leg 1: Entry from bottom right to Checkin button (frames 42 to 68)
    const t = interpolate(frame, [42, 68], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const arc = Math.sin(t * Math.PI) * -45;
    currentX = entryPos.x + (checkinBtnPos.x - entryPos.x) * eased;
    currentY = entryPos.y + (checkinBtnPos.y - entryPos.y) * eased + arc;
  } else if (frame < clickCheckinFrame + 14) {
    // Hold on Checkin button during and right after click
    currentX = checkinBtnPos.x;
    currentY = checkinBtnPos.y;
  } else if (frame < 145) {
    // Leg 2: Drift down to inspect dashboard cards and scroll (frames 84 to 125)
    const t = interpolate(frame, [84, 125], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    currentX = checkinBtnPos.x + (dashboardInspectPos.x - checkinBtnPos.x) * eased;
    currentY = checkinBtnPos.y + (dashboardInspectPos.y - checkinBtnPos.y) * eased;
  } else if (frame < clickPayrunSidebarFrame) {
    // Leg 3: Glide from dashboard inspect to Payrun sidebar (frames 145 to 172)
    const t = interpolate(frame, [145, 172], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const arc = Math.sin(t * Math.PI) * 30;
    currentX = dashboardInspectPos.x + (payrunSidebarPos.x - dashboardInspectPos.x) * eased;
    currentY = dashboardInspectPos.y + (payrunSidebarPos.y - dashboardInspectPos.y) * eased + arc;
  } else if (frame < clickPayrunSidebarFrame + 12) {
    // Hold on Payrun sidebar item during click
    currentX = payrunSidebarPos.x;
    currentY = payrunSidebarPos.y;
  } else if (frame < clickStartPayrunFrame) {
    // Leg 4: Move from Payrun sidebar to "Start Payrun" button (frames 187 to 230)
    const t = interpolate(frame, [187, 230], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const arc = Math.sin(t * Math.PI) * -25;
    currentX = payrunSidebarPos.x + (startPayrunBtnPos.x - payrunSidebarPos.x) * eased;
    currentY = payrunSidebarPos.y + (startPayrunBtnPos.y - payrunSidebarPos.y) * eased + arc;
  } else {
    // Leg 5: Settle on Start Payrun button, then drift and fade out before modal
    const drift = interpolate(frame, [clickStartPayrunFrame + 4, clickStartPayrunFrame + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    currentX = startPayrunBtnPos.x + 25 * drift;
    currentY = startPayrunBtnPos.y + 35 * drift;
    cursorOpacity = interpolate(frame, [clickStartPayrunFrame + 6, clickStartPayrunFrame + 16], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // Click 1 Bounce (Checkin button)
  const clickCheckinRel = Math.max(0, frame - clickCheckinFrame);
  const clickCheckinScale =
    frame >= clickCheckinFrame && clickCheckinRel < 14
      ? spring({
          frame: clickCheckinRel,
          fps,
          config: { damping: 14, mass: 0.3, stiffness: 280 },
          from: 0.86,
          to: 1.0,
        })
      : 1.0;

  // Click 2 Bounce (Payrun sidebar)
  const clickSidebarRel = Math.max(0, frame - clickPayrunSidebarFrame);
  const clickSidebarScale =
    frame >= clickPayrunSidebarFrame && clickSidebarRel < 14
      ? spring({
          frame: clickSidebarRel,
          fps,
          config: { damping: 14, mass: 0.3, stiffness: 280 },
          from: 0.86,
          to: 1.0,
        })
      : 1.0;

  // Click 3 Bounce (Start Payrun button)
  const clickStartRel = Math.max(0, frame - clickStartPayrunFrame);
  const clickStartScale =
    frame >= clickStartPayrunFrame && clickStartRel < 14
      ? spring({
          frame: clickStartRel,
          fps,
          config: { damping: 14, mass: 0.3, stiffness: 280 },
          from: 0.86,
          to: 1.0,
        })
      : 1.0;

  const totalScale = clickCheckinScale * clickSidebarScale * clickStartScale;

  // Ripple 1
  const isRipple1Active = frame >= clickCheckinFrame && clickCheckinRel < 20;
  const ripple1Radius = interpolate(clickCheckinRel, [0, 20], [4, 40], { extrapolateRight: "clamp" });
  const ripple1Opacity = interpolate(clickCheckinRel, [0, 20], [0.8, 0], { extrapolateRight: "clamp" });

  // Ripple 2
  const isRipple2Active = frame >= clickPayrunSidebarFrame && clickSidebarRel < 20;
  const ripple2Radius = interpolate(clickSidebarRel, [0, 20], [4, 44], { extrapolateRight: "clamp" });
  const ripple2Opacity = interpolate(clickSidebarRel, [0, 20], [0.75, 0], { extrapolateRight: "clamp" });

  // Ripple 3
  const isRipple3Active = frame >= clickStartPayrunFrame && clickStartRel < 20;
  const ripple3Radius = interpolate(clickStartRel, [0, 20], [4, 48], { extrapolateRight: "clamp" });
  const ripple3Opacity = interpolate(clickStartRel, [0, 20], [0.8, 0], { extrapolateRight: "clamp" });

  return (
    <>
      {/* Ripple Ring 1 */}
      {isRipple1Active && (
        <div
          style={{
            position: "absolute",
            left: checkinBtnPos.x - ripple1Radius,
            top: checkinBtnPos.y - ripple1Radius,
            width: ripple1Radius * 2,
            height: ripple1Radius * 2,
            borderRadius: "50%",
            border: "2px solid rgba(22, 163, 74, 0.9)",
            opacity: ripple1Opacity,
            pointerEvents: "none",
            zIndex: 69,
          }}
        />
      )}

      {/* Ripple Ring 2 */}
      {isRipple2Active && (
        <div
          style={{
            position: "absolute",
            left: payrunSidebarPos.x - ripple2Radius,
            top: payrunSidebarPos.y - ripple2Radius,
            width: ripple2Radius * 2,
            height: ripple2Radius * 2,
            borderRadius: "50%",
            border: "2px solid rgba(0, 102, 153, 0.9)",
            opacity: ripple2Opacity,
            pointerEvents: "none",
            zIndex: 69,
          }}
        />
      )}

      {/* Ripple Ring 3 */}
      {isRipple3Active && (
        <div
          style={{
            position: "absolute",
            left: startPayrunBtnPos.x - ripple3Radius,
            top: startPayrunBtnPos.y - ripple3Radius,
            width: ripple3Radius * 2,
            height: ripple3Radius * 2,
            borderRadius: "50%",
            border: "2px solid rgba(0, 102, 153, 0.9)",
            opacity: ripple3Opacity,
            pointerEvents: "none",
            zIndex: 69,
          }}
        />
      )}

      {/* Realistic Desktop Cursor (from authentic Figma vector) */}
      <div
        style={{
          position: "absolute",
          left: currentX,
          top: currentY,
          transform: `scale(${totalScale}) translate(-3px, -3px)`,
          transformOrigin: "top left",
          opacity: cursorOpacity,
          pointerEvents: "none",
          zIndex: 70,
          filter: "drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.35))",
          transition: "opacity 0.15s ease",
        }}
      >
        <svg
          width="26"
          height="28"
          viewBox="0 0 36.48 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.381 3.177C8.302 2.386 9.221 1.895 9.835 2.4L32.958 21.433C33.526 21.901 33.315 22.817 32.599 22.989L24.363 24.972L27.395 31.188C27.603 31.614 27.44 32.129 27.026 32.359L23.813 34.141C23.376 34.383 22.826 34.22 22.592 33.779L19.242 27.475L12.725 32.822C12.174 33.274 11.342 32.929 11.271 32.221L8.381 3.177Z"
            fill="#0F172A"
            stroke="#FFFFFF"
            strokeWidth="1.6"
          />
        </svg>
      </div>
    </>
  );
};
