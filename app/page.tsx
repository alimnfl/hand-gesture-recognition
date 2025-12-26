"use client";

import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { sounds } from "@/lib/playSound";
import { extractVector, Landmark, mirrorVector } from "@/lib/features";
import { classify, Gesture } from "@/lib/gestures";
import { drawHand } from "@/lib/drawHand";
import { SIGN_HUMOR_VECTOR } from "@/fragments/finger/SignHumorData";

export default function HandTracking() {
  const [vectorValue, setVectorValue] = useState<number[] | null>([
    0, 0, 0, 0, 0,
  ]);

  const [lastGesture, setLastGesture] = useState<Gesture | null>(null);
  const [handDetected, setHandDetected] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let landmarker: HandLandmarker | null = null;
    let running = true;

    // Set detect per 20fps
    let lastDetect = 0;
    const DETECT_INTERVAL = 200;

    const init = async () => {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );

      landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      const detect = () => {
        if (!running || !landmarker || !videoRef.current) return;

        const canvasCtx = canvasRef.current?.getContext("2d");
        if (!canvasCtx) return;

        const now = performance.now();

        if (now - lastDetect < DETECT_INTERVAL) {
          requestAnimationFrame(detect);
          return;
        }

        lastDetect = now;

        const results = landmarker.detectForVideo(videoRef.current, now);

        if (results.landmarks.length > 0) {
          setHandDetected(true);
          for (let i = 0; i < results.landmarks.length; i++) {
            const hand = results.landmarks[i];
            drawHand(canvasCtx, hand);

            const vector = extractVector(hand);
            setVectorValue(vector);

            const handLabel =
              results.handedness && results.handedness[i]
                ? results.handedness[i]?.[0].categoryName
                : "right";
            const processedVector =
              handLabel === "Left" ? mirrorVector(vector) : vector;

            const gesture = classify(processedVector);

            if (gesture && gesture !== lastGesture) {
              sounds[gesture]?.();
              setLastGesture(gesture);
            }

            if (!gesture) {
              setLastGesture(null);
            }
          }
        } else {
          setHandDetected(false);
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    init();

    return () => {
      running = false;
      landmarker?.close();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full h-full justify-center items-center mx-auto py-20">
      <h1 className="text-3xl font-semibold">Hand Meme Humorism</h1>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={640}
          height={480}
          style={{ background: "#000" }}
        />

        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={`top-0 left-0 ${handDetected ? "absolute" : "hidden"}`}
        />
      </div>

      <div className="flex flex-col gap-4 w-full justify-center items-center">
        <h3 className="font-medium">Vector Value</h3>
        <div className="flex flex-row text-sm w-full justify-between max-w-150">
          {SIGN_HUMOR_VECTOR.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-center flex-col gap-1"
            >
              <span>{item.title}</span>
              <span>{vectorValue?.[item.key].toFixed(2) ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
