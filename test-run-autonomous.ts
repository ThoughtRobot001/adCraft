import { studioGenerationService } from "./src/studio/server/generation-service";

async function test() {
  try {
    const brief = {
      productName: "Morrow Coffee",
      productDescription: "Create a premium 15-second vertical ad for Morrow Coffee, a modern specialty coffee brand. The product is a beautifully packaged bag of coffee beans designed for people who care about great coffee and a refined daily ritual. The ad should make Morrow feel distinctive, premium, warm, and contemporary — not like a generic coffee commercial. Focus on the feeling of the first great cup of coffee in the morning: anticipation, aroma, craft, and the ritual of making something worth slowing down for. Make the coffee package/product the hero and build a clear visual story around it. Use sophisticated motion design, strong typography, intentional composition, elegant transitions, and cinematic pacing. Keep the visual language restrained and editorial rather than noisy.",
      goal: "free_trial" as const,
      targetDurationSeconds: 15,
      aspectRatio: "9:16" as const,
      outputChannels: ["tiktok" as const, "instagram-reels" as const]
    };
    const brand = {
      name: "Morrow Coffee",
      tagline: "Refined morning ritual",
      colors: {
        primary: "#2C1810",
        accent: "#D4A373",
        secondary: "#1A0F0A"
      }
    };
    const res = await studioGenerationService.runAutonomousPipeline(brand, brief);
    console.log("TEST SUCCESS! Ad ID:", res.motionIR.id, "Scenes:", res.motionIR.scenes.length, "Score:", res.critique.overallScore);
  } catch (err: any) {
    console.error("TEST FAILED WITH ERROR:", err.stack || err.message || err);
  }
}

test();
