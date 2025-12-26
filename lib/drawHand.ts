import { Landmark } from "./features";

export function drawHand(ctx: CanvasRenderingContext2D, landmarks: Landmark[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = "rgba(255, 99, 71, 0.9)";
  landmarks.forEach((lm) => {
    ctx.beginPath();
    ctx.arc(
      lm.x * ctx.canvas.width,
      lm.y * ctx.canvas.height,
      5,
      0,
      2 * Math.PI
    );
    ctx.fill();

    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4], // thumb
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8], // index
      [0, 9],
      [9, 10],
      [10, 11],
      [11, 12], // middle
      [0, 13],
      [13, 14],
      [14, 15],
      [15, 16], // ring
      [0, 17],
      [17, 18],
      [18, 19],
      [19, 20], // pinky
    ];

    ctx.strokeStyle = "rgba(64, 224, 208, 0.8)";
    ctx.lineWidth = 2;
    connections.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(
        landmarks[i].x * ctx.canvas.width,
        landmarks[i].y * ctx.canvas.height
      );
      ctx.lineTo(
        landmarks[j].x * ctx.canvas.width,
        landmarks[j].y * ctx.canvas.height
      );
      ctx.stroke();
    });
  });
}
