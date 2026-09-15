import { AssetMetadata } from "../types";
import { BACKGROUND_ASSETS } from "./backgrounds";
import { CARD_ASSETS } from "./cards";
import { DEVICE_ASSETS } from "./devices";
import { BUTTON_ASSETS } from "./buttons";
import { ATMOSPHERE_ASSETS } from "./atmosphere";
import { SHADER_ASSETS } from "./shaders";

export * from "./backgrounds";
export * from "./cards";
export * from "./devices";
export * from "./buttons";
export * from "./atmosphere";
export * from "./shaders";

export const ALL_ASSETS: AssetMetadata[] = [
  ...BACKGROUND_ASSETS,
  ...CARD_ASSETS,
  ...DEVICE_ASSETS,
  ...BUTTON_ASSETS,
  ...ATMOSPHERE_ASSETS,
  ...SHADER_ASSETS,
];
