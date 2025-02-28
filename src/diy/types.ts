export type AnimationEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "step-start"
  | "step-end"
  | `cubic-bezier(${number}, ${number}, ${number}, ${number})`
  | `steps(${number}, ${"start" | "end"})`;

export type AnimationOptions = {
  duration?: number;
  easing?: AnimationEasing;
};
