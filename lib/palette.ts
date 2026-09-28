// Validated categorical order (fixed, never cycled) — see the dataviz skill's
// reference palette. Values reference CSS custom properties (defined in
// globals.css) so charts pick up the dark-mode-validated steps automatically
// via @media (prefers-color-scheme: dark), instead of a separate JS palette.
export const CATEGORICAL = [
  "var(--chart-cat-1)", // blue
  "var(--chart-cat-2)", // orange
  "var(--chart-cat-3)", // aqua
  "var(--chart-cat-4)", // yellow
  "var(--chart-cat-5)", // magenta
] as const;

export const OTHER_COLOR = "var(--chart-other)"; // neutral — "Other" never gets a generated hue

export const STATUS_COLOR = {
  good: "var(--chart-good)",
  warning: "var(--chart-warning)",
} as const;
