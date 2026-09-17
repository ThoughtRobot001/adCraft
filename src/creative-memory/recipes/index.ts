import { CreativeMemoryItem } from "../types";
import { TENSION_OVERLOAD_ITEMS } from "./tension-overload";
import { TECHNICAL_PRECISION_ITEMS } from "./technical-precision";
import { CATHARTIC_RELIEF_ITEMS } from "./cathartic-relief";
import { KINETIC_VELOCITY_ITEMS } from "./kinetic-velocity";
import { EDITORIAL_LUXURY_ITEMS } from "./editorial-luxury";
import { REFERENCE_BREAKDOWN_ITEMS } from "./references-breakdown";
import { BROADCAST_ASSET_ITEMS } from "./broadcast-assets";

export const ALL_PRESEEDED_MEMORY_ITEMS: CreativeMemoryItem[] = [
  ...TENSION_OVERLOAD_ITEMS,
  ...TECHNICAL_PRECISION_ITEMS,
  ...CATHARTIC_RELIEF_ITEMS,
  ...KINETIC_VELOCITY_ITEMS,
  ...EDITORIAL_LUXURY_ITEMS,
  ...REFERENCE_BREAKDOWN_ITEMS,
  ...BROADCAST_ASSET_ITEMS,
];

export {
  TENSION_OVERLOAD_ITEMS,
  TECHNICAL_PRECISION_ITEMS,
  CATHARTIC_RELIEF_ITEMS,
  KINETIC_VELOCITY_ITEMS,
  EDITORIAL_LUXURY_ITEMS,
  REFERENCE_BREAKDOWN_ITEMS,
  BROADCAST_ASSET_ITEMS,
};
