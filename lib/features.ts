export type Vector = number[];

export type Landmark = {
  x: number;
  y: number;
  z: number;
};

function dist(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function extractVector(landmarks: Landmark[]): Vector {
  const size = dist(landmarks[0], landmarks[9]); // wrist -> middle MCP

  return [
    dist(landmarks[4], landmarks[8]) / size, // thumb-index
    dist(landmarks[8], landmarks[12]) / size, // index-middle
    dist(landmarks[12], landmarks[16]) / size, // middle-finger
    dist(landmarks[16], landmarks[20]) / size, // ring-pinky
    dist(landmarks[0], landmarks[8]) / size, //wrist-index
  ];
}

export function mirrorVector(vector: Vector): Vector {
  return vector.map((v, i) => (i % 2 === 0 ? -v : v));
}
