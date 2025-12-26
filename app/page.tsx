"use client";

import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { coordinateTrack, Gesture } from "@/lib/coordinate";
import { sounds } from "@/lib/playSound";
import { Landmark } from "@/lib/features";

export default function HandTracking() {
  const [coords, setCoords] = useState<Landmark | null>({
    x: 0,
    y: 0,
    z: 0,
  });

  const [lastGesture, setLastGesture] = useState<Gesture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

        const now = performance.now();

        if (now - lastDetect < DETECT_INTERVAL) {
          requestAnimationFrame(detect);
          return;
        }

        lastDetect = now;

        const results = landmarker.detectForVideo(videoRef.current, now);

        if (results.landmarks.length > 0) {
          const p = results.landmarks[0][8];
          const gesture = coordinateTrack(results.landmarks[0]);

          if (gesture && gesture !== lastGesture) {
            sounds[gesture]?.();
            setLastGesture(gesture);
          }

          if (!gesture) {
            setLastGesture(null);
          }

          setCoords({
            x: Number(p.x.toFixed(3)),
            y: Number(p.y.toFixed(3)),
            z: Number(p.z.toFixed(3)),
          });
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
      <h1>Hand Tracking</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={640}
        height={480}
        style={{ background: "#000" }}
      />

      <div className="flex flex-col gap-2 w-full justify-center items-center">
        <h3>Coodinate</h3>
        <div className="flex flex-row w-full justify-between max-w-150">
          <div className="flex flex-col gap-1">
            <span>X</span>
            <span>{coords?.x}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span>Y</span>
            <span>{coords?.y}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span>Y</span>
            <span>{coords?.z}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
