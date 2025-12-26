import { isSimilar, Point3D } from "./distance";

export type Gesture = "fah" | "omg" | "get_out";

const GESTURES: Record<Gesture, Point3D> = {
  fah: { x: 0.42, y: 0.3, z: -0.04 },
  omg: { x: 0.6, y: 0.2, z: -0.08 },
  get_out: { x: 0.84, y: 0.34, z: -0.01 },
};

export function coordinateTrack(landmarks: any[]): Gesture | null {
  const p = landmarks[8];

  const current: Point3D = {
    x: p.x,
    y: p.y,
    z: p.z,
  };

  for (const name of Object.keys(GESTURES) as Gesture[]) {
    const ref = GESTURES[name];
    if (isSimilar(current, ref)) {
      return name;
    }
  }

  return null;
}
