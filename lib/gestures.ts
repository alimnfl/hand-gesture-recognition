import { Vector } from "./features";

export type Gesture = "vine" | "omg" | "get_out" | "hidup" | "fah";

type GestureProfile = {
  mean: Vector;
  threshold: number;
};

export const GESTURES: Record<Gesture, GestureProfile> = {
  vine: {
    mean: [1.66, 1.59, 0.23, 1.22, 2.14],
    threshold: 0.15,
  },
  omg: {
    mean: [0.9, 0.9, 1.02, 0.24, 1.22],
    threshold: 0.15,
  },
  get_out: {
    mean: [0.77, 1.18, 0.12, 0.095, 1.83],
    threshold: 0.18,
  },
  hidup: {
    mean: [0.28, 0.15, 0.14, 0.14, 0.86],
    threshold: 0.18,
  },
  fah: {
    mean: [1.04, 0.55, 1.13, 0.29, 1.87],
    threshold: 0.18,
  },
};

function vectorDistance(a: Vector, b: Vector) {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

export function classify(vector: Vector): Gesture | null {
  let best: Gesture | null = null;
  let min = Infinity;

  for (const g in GESTURES) {
    const { mean, threshold } = GESTURES[g as Gesture];
    const d = vectorDistance(vector, mean);

    if (d < threshold && d < min) {
      min = d;
      best = g as Gesture;
    }
  }

  return best;
}
