import React from "react";
import { Composition } from "remotion";
import { z } from "zod";
import { AdComposition, computeTotalDurationFrames } from "./compositions/AdComposition";
import { MotionIR, MotionIRSchema } from "./schema";
import defaultAd from "../examples/saas-product-ad.json";

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
