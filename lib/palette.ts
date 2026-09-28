// Validated categorical order (fixed, never cycled) — see the dataviz skill's
// reference palette. Status colors are separate and reserved.
export const CATEGORICAL = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#4a3aa7", // violet
] as const;

export const OTHER_COLOR = "#c3c2b7"; // neutral — "Other" never gets a generated hue

export const STATUS_COLOR = {
  good: "#0ca30c",
  warning: "#fab219",
} as const;
