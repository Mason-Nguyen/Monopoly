export const TILE_TYPES = [
  "start",
  "property",
  "tax",
  "jail",
  "go_to_jail",
  "free_parking",
  "neutral"
] as const;
export type TileType = (typeof TILE_TYPES)[number];

export const PROPERTY_COLOR_GROUPS = [
  "brown",
  "light_blue",
  "pink",
  "orange",
  "red",
  "yellow",
  "green",
  "dark_blue"
] as const;
export type PropertyColorGroup = (typeof PROPERTY_COLOR_GROUPS)[number];