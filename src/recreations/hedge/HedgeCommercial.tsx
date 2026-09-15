import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { SceneGrid } from "./SceneGrid";
import { SceneText } from "./SceneText";
import { ScenePhone } from "./ScenePhone";
import { SceneDesktop } from "./SceneDesktop";
import { SceneLogo } from "./SceneLogo";
import { SceneFlyingText } from "./SceneFlyingText";

export const HedgeCommercial: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0C", color: "white", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif" }}>
      {/* Exact Sound Design & Music Bed */}
      <Audio src={staticFile("hedge-audio.mp3")} />

      {/* 0:00 - 0:03 (Frames 0 - 90): 3D Grid Dolly */}
      <Sequence from={0} durationInFrames={92}>
        <SceneGrid />
      </Sequence>

      {/* 0:02.5 - 0:06.8 (Frames 75 - 205): Kinetic Typography ("Prediction markets capped..." -> "We unlocked the rest." -> "Meet") */}
      <Sequence from={75} durationInFrames={135}>
        <SceneText />
      </Sequence>

      {/* 0:06.7 - 0:10.3 (Frames 200 - 310): 3D Phone & Hex Grid + "the leverage layer for event markets." */}
      <Sequence from={200} durationInFrames={110}>
        <ScenePhone />
      </Sequence>

      {/* 0:10.2 - 0:14.0 (Frames 305 - 420): Flying Blur Cards + "Trade major news/elections" + "with up to 10x leverage" */}
      <Sequence from={305} durationInFrames={115}>
        <SceneFlyingText />
      </Sequence>

      {/* 0:13.8 - 0:20.5 (Frames 415 - 615): Desktop UI ("Trade the event" -> "Not the outcome", slider interaction, buying progress circular modal) */}
      <Sequence from={415} durationInFrames={200}>
        <SceneDesktop />
      </Sequence>

      {/* 0:20.3 - 0:25.7 (Frames 610 - 772): "This is" -> Logo reveal + Tagline */}
      <Sequence from={610} durationInFrames={162}>
        <SceneLogo />
      </Sequence>
    </AbsoluteFill>
  );
};
