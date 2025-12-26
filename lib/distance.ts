export type Point3D = { x: number; y: number; z: number };

function distance3D(a: Point3D, b: Point3D) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function isSimilar(current: Point3D, target: Point3D, threshold = 0.05) {
  return distance3D(current, target) < threshold;
}
