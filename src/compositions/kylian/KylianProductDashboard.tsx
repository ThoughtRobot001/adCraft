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
import { KylianCheckinWidget } from "./KylianCheckinWidget";
import { KylianPayrunSubheader } from "./KylianPayrunSubheader";
import { KylianCursor } from "./KylianCursor";
import { PayrollCompletedModal } from "./PayrollCompletedModal";

export const KylianProductDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline Milestones (30 FPS, total 330 frames = 11.0 seconds)
  // Frames 0–45 (0.0s–1.5s): Home feed reveal loader & dashboard card hydration
  // Frame 70 (2.33s): Cursor clicks "Checkin" button → button turns green, timer starts ticking live
  // Frames 85–145 (2.83s–4.83s): Viewport scrolls down through dashboard metrics (Requisitions, Punctual, Birthdays)
  // Frame 175 (5.83s): Cursor clicks "Payrun" in left sidebar → active pill transitions
  // Frames 178–198 (5.93s–6.6s): Subheader switches to "Back / View Pay Runs", content area reveals Payrun card
  // Frame 235 (7.83s): Cursor clicks "Start Payrun" primary CTA button
  // Frame 248 (8.27s): Success confirmation modal springs into center with celebration chime
  // Frames 248–330 (8.27s–11.0s): Pristine modal hold with live summary stats
  const CLICK_CHECKIN_FRAME = 70;
  const CLICK_PAYRUN_FRAME = 175;
  const CONTENT_TRANSITION_START = 178;
  const CONTENT_TRANSITION_END = 198;
  const CLICK_START_PAYRUN_FRAME = 235;
  const MODAL_APPEAR_FRAME = 248;

  // 1. Intentional, cinematic camera push-in during Payrun workflow
  const cameraZoomProgress = interpolate(
    frame,
    [CLICK_PAYRUN_FRAME, CLICK_PAYRUN_FRAME + 34],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const cameraScale = interpolate(cameraZoomProgress, [0, 1], [1.0, 1.10]);

  // 2. Sidebar active state switch
  const isPayrunSidebarActive = frame >= CLICK_PAYRUN_FRAME;

  // 3. Subheader crossfade from Checkin widget to Payrun subheader
  const subheaderTransition = interpolate(
    frame,
    [CLICK_PAYRUN_FRAME + 2, CLICK_PAYRUN_FRAME + 16],
    [0, 1],
    {
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 4. Main Content Area transition to Payrun screen
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

  // 5. Start Payrun button pressed feedback
  const isStartPayrunPressed =
    frame >= CLICK_START_PAYRUN_FRAME && frame < CLICK_START_PAYRUN_FRAME + 10;

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
      {/* Frame-Synced Audio Layer */}
      {/* Sound 1: Checkin button click */}
      <Sequence from={CLICK_CHECKIN_FRAME} durationInFrames={20}>
        <Audio src={staticFile("audio/sfx/click.wav")} volume={0.7} />
      </Sequence>

      {/* Sound 2: Live timer activation switch */}
      <Sequence from={CLICK_CHECKIN_FRAME + 3} durationInFrames={25}>
        <Audio src={staticFile("audio/sfx/switch.wav")} volume={0.5} />
      </Sequence>

      {/* Sound 3: Payrun sidebar selection click */}
      <Sequence from={CLICK_PAYRUN_FRAME} durationInFrames={20}>
        <Audio src={staticFile("audio/sfx/click.wav")} volume={0.7} />
      </Sequence>

      {/* Sound 4: Start Payrun CTA button click */}
      <Sequence from={CLICK_START_PAYRUN_FRAME} durationInFrames={20}>
        <Audio src={staticFile("audio/sfx/click.wav")} volume={0.75} />
      </Sequence>

      {/* Sound 5: Celebration chime on payroll completion */}
      <Sequence from={MODAL_APPEAR_FRAME} durationInFrames={75}>
        <Audio src={staticFile("audio/sfx/chime.wav")} volume={0.8} />
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
        {/* Layer 1: Base Video with Genuine Feed Reveal & Scrolled Dashboard */}
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

        {/* Layer 2: Frame 36386 Check-in Widget with Live Count-up Timer */}
        {frame < CLICK_PAYRUN_FRAME + 18 && (
          <KylianCheckinWidget
            checkinClickFrame={CLICK_CHECKIN_FRAME}
            opacity={1 - subheaderTransition}
          />
        )}

        {/* Layer 3: Frame 36386 Payrun Subheader (Back / View Pay Runs) */}
        {frame >= CLICK_PAYRUN_FRAME && (
          <KylianPayrunSubheader opacity={subheaderTransition} />
        )}

        {/* Layer 4: Payrun Sidebar Active State Switch (Frame >= 175) */}
        {isPayrunSidebarActive && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "258px",
              height: "1080px",
              overflow: "hidden",
              zIndex: 28,
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

        {/* Layer 5: Main Content Area Transition to Payrun Screen (X > 258, Y > 174) */}
        {frame >= CONTENT_TRANSITION_START && (
          <div
            style={{
              position: "absolute",
              top: "174px",
              left: "258px",
              width: "1420px",
              height: "906px",
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
                top: "-174px",
                left: "-258px",
              }}
            />

            {/* Start Payrun Button Click Depression Overlay */}
            {isStartPayrunPressed && (
              <div
                style={{
                  position: "absolute",
                  left: "37px",
                  top: "313px",
                  width: "581px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(0, 0, 0, 0.16)",
                  pointerEvents: "none",
                  zIndex: 35,
                }}
              />
            )}
          </div>
        )}

        {/* Layer 6: Realistic Desktop Cursor Choreography */}
        <KylianCursor
          clickCheckinFrame={CLICK_CHECKIN_FRAME}
          clickPayrunSidebarFrame={CLICK_PAYRUN_FRAME}
          clickStartPayrunFrame={CLICK_START_PAYRUN_FRAME}
        />

        {/* Layer 7: Payroll Completed Success Modal */}
        <PayrollCompletedModal appearFrame={MODAL_APPEAR_FRAME} />
      </div>
    </div>
  );
};
