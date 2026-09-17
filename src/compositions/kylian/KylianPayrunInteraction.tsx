import React from "react";
import {
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KylianCursor } from "./KylianCursor";
import { PayrollCompletedModal } from "./PayrollCompletedModal";

export const KylianPayrunInteraction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Keyframe Milestones (Timeline at 30 FPS)
  // Frames 0–142 (0.0s–4.73s): Original feed reveal loader + dashboard scroll
  // Frame 105 (3.5s): Desktop cursor enters smoothly
  // Frame 142 (4.73s): Cursor clicks "Payrun" in sidebar + camera zoom starts
  // Frames 148–168 (4.93s–5.6s): Content area reveals Payrun page
  // Frame 195 (6.5s): Cursor clicks "Start Payrun"
  // Frame 210 (7.0s): Confirmation modal appears with success state
  // Frames 210–290 (7.0s–9.67s): Modal holds as final visual focus
  const CLICK_PAYRUN_FRAME = 142;
  const CONTENT_TRANSITION_START = 148;
  const CONTENT_TRANSITION_END = 168;
  const CLICK_START_PAYRUN_FRAME = 195;
  const MODAL_APPEAR_FRAME = 210;

  // 1. Subtle, intentional camera zoom
  // Smoothly scales from 1.0 to 1.12 anchored between Payrun sidebar item and Payrun card (260px, 600px).
  // Keeps full sidebar (X: 42 to 258) with active Payrun item completely visible on screen,
  // while bringing the main Payrun card into sharp focus.
  const cameraZoomProgress = interpolate(
    frame,
    [CLICK_PAYRUN_FRAME, CLICK_PAYRUN_FRAME + 32],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const cameraScale = interpolate(cameraZoomProgress, [0, 1], [1.0, 1.12]);

  // 2. Sidebar active state
  // Before frame 142: Original video plays Home active state
  // At frame 142: Payrun snaps to active (white pill background, dark text/icon)
  const isPayrunSidebarActive = frame >= CLICK_PAYRUN_FRAME;

  // 3. Main Content Area Transition (frames 148 to 168)
  // Reveals the Payrun screen in the main content area preserving visual truth
  const contentTransitionProgress = interpolate(
    frame,
    [CONTENT_TRANSITION_START, CONTENT_TRANSITION_END],
    [0, 1],
    {
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 4. Start Payrun Button Pressed State
  const isButtonPressed =
    frame >= CLICK_START_PAYRUN_FRAME && frame < CLICK_START_PAYRUN_FRAME + 10;
  const isButtonHovered =
    frame >= 188 && frame < CLICK_START_PAYRUN_FRAME;

  return (
    <div
      style={{
        width: 1678,
        height: 1080,
        backgroundColor: "#E2E2E6",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Frame-Synced Sound Effects */}
      <Sequence from={CLICK_PAYRUN_FRAME} durationInFrames={20}>
        <Audio src={staticFile("audio/sfx/click.wav")} volume={0.65} />
      </Sequence>

      <Sequence from={CLICK_START_PAYRUN_FRAME} durationInFrames={20}>
        <Audio src={staticFile("audio/sfx/click.wav")} volume={0.7} />
      </Sequence>

      <Sequence from={MODAL_APPEAR_FRAME} durationInFrames={70}>
        <Audio src={staticFile("audio/sfx/chime.wav")} volume={0.75} />
      </Sequence>

      {/* Camera Rig Container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transform: `scale(${cameraScale})`,
          transformOrigin: "260px 600px",
        }}
      >
        {/* Base Layer: Original Video with Loader Feed Reveal & Scroll */}
        {/* Plays the genuine loader feed reveal (0–1.5s) and full scroll (1.5–4.7s) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
          }}
        >
          <OffthreadVideo
            src={staticFile("assets/kylian/frame-36384.mp4")}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>

        {/* Layer 2: Payrun Sidebar Active State Switch (Frame >= 142) */}
        {/* Swaps sidebar (X: 0 to 258) to active Payrun item on click */}
        {isPayrunSidebarActive && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "258px",
              height: "1080px",
              overflow: "hidden",
              zIndex: 20,
            }}
          >
            <Img
              src={staticFile("assets/kylian/kylian-payrun.png")}
              style={{
                width: "1678px",
                height: "1080px",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          </div>
        )}

        {/* Layer 3: Main Content Area Transition to Payrun View (X > 258, Y > 122) */}
        {frame >= CONTENT_TRANSITION_START && (
          <div
            style={{
              position: "absolute",
              top: "122px",
              left: "258px",
              width: "1420px",
              height: "958px",
              overflow: "hidden",
              opacity: contentTransitionProgress,
              zIndex: 30,
            }}
          >
            <Img
              src={staticFile("assets/kylian/kylian-payrun.png")}
              style={{
                width: "1678px",
                height: "1080px",
                position: "absolute",
                top: "-122px",
                left: "-258px",
              }}
            />
          </div>
        )}

        {/* Layer 4: Interactive Button State on 'Start Payrun' */}
        {frame >= CONTENT_TRANSITION_END && (
          <div
            style={{
              position: "absolute",
              left: "317px",
              top: "529px",
              width: "542px",
              height: "50px",
              borderRadius: "8px",
              backgroundColor: isButtonPressed
                ? "rgba(0, 0, 0, 0.22)"
                : isButtonHovered
                ? "rgba(255, 255, 255, 0.08)"
                : "transparent",
              boxShadow: isButtonPressed
                ? "inset 0 2px 5px rgba(0, 0, 0, 0.35)"
                : "none",
              pointerEvents: "none",
              zIndex: 40,
              transition: "background-color 0.08s ease",
            }}
          />
        )}

        {/* Layer 5: Realistic Desktop Cursor (within camera coordinate space) */}
        <KylianCursor
          click1Frame={CLICK_PAYRUN_FRAME}
          click2Frame={CLICK_START_PAYRUN_FRAME}
        />
      </div>

      {/* Layer 6: Confirmation Modal (Screen space / Viewport centered, pristine focus) */}
      <PayrollCompletedModal appearFrame={MODAL_APPEAR_FRAME} />
    </div>
  );
};
