import React from "react";
import { Composition, staticFile } from "remotion";
import { z } from "zod";
import { AdComposition, computeTotalDurationFrames } from "./compositions/AdComposition";
import { MotionIR, MotionIRSchema } from "./schema";
import defaultAd from "../examples/saas-product-ad.json";
import { HedgeCommercial } from "./recreations/hedge/HedgeCommercial";
import { RcrutScene1 } from "./compositions/reconstructions/RcrutScene1";
import { KylianPayrunInteraction } from "./compositions/kylian/KylianPayrunInteraction";
import { KylianProductDashboard } from "./compositions/kylian/KylianProductDashboard";
const AdPropsSchema = z.union([
  z.object({ motionIR: MotionIRSchema }),
  MotionIRSchema,
]);

export const Root: React.FC = () => {
  const typedDefaultAd = defaultAd as unknown as MotionIR;
  const defaultTotalFrames = computeTotalDurationFrames(typedDefaultAd.scenes);

  return (
    <>
      <Composition
        id="KylianProductDashboard"
        component={KylianProductDashboard}
        durationInFrames={330}
        fps={30}
        width={1678}
        height={1080}
      />
      <Composition
        id="KylianFramePreview"
        component={() => (
          <div style={{ width: 1556, height: 997, backgroundColor: "#fff" }}>
            <img
              src={staticFile("assets/kylian/timer-bar-isolated.svg")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              alt="Timer Bar"
            />
          </div>
        )}
        durationInFrames={1}
        fps={30}
        width={1556}
        height={997}
      />
      <Composition
        id="KylianPayrunInteraction"
        component={KylianPayrunInteraction}
        durationInFrames={290}
        fps={30}
        width={1678}
        height={1080}
      />
      <Composition
        id="RcrutScene1Static"
        component={() => <RcrutScene1 isStatic={true} />}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="RcrutScene1Animated"
        component={() => <RcrutScene1 isStatic={false} />}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="HedgeCommercial"
        component={HedgeCommercial}
        durationInFrames={772}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AdComposition"
        component={AdComposition}
        schema={AdPropsSchema}
        durationInFrames={defaultTotalFrames}
        fps={typedDefaultAd.meta.fps || 30}
        width={typedDefaultAd.meta.width || 1080}
        height={typedDefaultAd.meta.height || 1920}
        defaultProps={{
          motionIR: typedDefaultAd,
        }}
        calculateMetadata={async ({ props }) => {
          const raw = props as any;
          const ir: MotionIR = raw?.scenes ? (raw as MotionIR) : raw?.motionIR || typedDefaultAd;
          const totalFrames = computeTotalDurationFrames(ir.scenes);
          return {
            durationInFrames: totalFrames,
            fps: ir.meta?.fps || 30,
            width: ir.meta?.width || 1080,
            height: ir.meta?.height || 1920,
          };
        }}
      />
    </>
  );
};
