"use client";

import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { sounds } from "@/lib/playSound";
import { extractVector, Landmark, mirrorVector } from "@/lib/features";
import { classify, Gesture } from "@/lib/gestures";
import { drawHand } from "@/lib/drawHand";
import { SIGN_HUMOR_VECTOR } from "@/fragments/finger/SignHumorData";

export default function HandTracking() {
  const [handDetected, setHandDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Store vector values in ref to avoid re-renders
  const vectorDisplayRef = useRef<HTMLDivElement>(null);
  const currentVectorRef = useRef<number[]>([0, 0, 0, 0, 0]);

  const lastGestureRef = useRef<Gesture | null>(null);
  const lastGestureTimeRef = useRef<number>(0);
  const lastHandDetectedRef = useRef<boolean>(false);

  const GESTURE_COOLDOWN = 300;
  const UI_UPDATE_INTERVAL = 100; // Update UI only 10 times per second
  const lastUIUpdateRef = useRef<number>(0);

  useEffect(() => {
    let running = true;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!videoRef.current) {
          throw new Error("Video element not found");
        }

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        await videoRef.current.play();

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        setIsLoading(false);

        const detect = () => {
          if (!running || !landmarkerRef.current || !videoRef.current) return;

          const canvasCtx = canvasRef.current?.getContext("2d");
          if (!canvasCtx) {
            animationFrameRef.current = requestAnimationFrame(detect);
            return;
          }

          const now = performance.now();

          try {
            const results = landmarkerRef.current.detectForVideo(
              videoRef.current,
              now
            );

            canvasCtx.clearRect(0, 0, 640, 480);

            const hasHands = results.landmarks.length > 0;

            if (hasHands) {
              if (!lastHandDetectedRef.current) {
                lastHandDetectedRef.current = true;
                setHandDetected(true);
              }

              for (let i = 0; i < results.landmarks.length; i++) {
                const hand = results.landmarks[i];
                drawHand(canvasCtx, hand);

                const vector = extractVector(hand);
                currentVectorRef.current = vector;

                const handLabel =
                  results.handedness && results.handedness[i]
                    ? results.handedness[i]?.[0].categoryName
                    : "Right";

                const processedVector =
                  handLabel === "Left" ? mirrorVector(vector) : vector;

                const gesture = classify(processedVector);

                if (
                  gesture &&
                  gesture !== lastGestureRef.current &&
                  now - lastGestureTimeRef.current > GESTURE_COOLDOWN
                ) {
                  sounds[gesture]?.();
                  lastGestureRef.current = gesture;
                  lastGestureTimeRef.current = now;
                }

                if (!gesture && lastGestureRef.current) {
                  lastGestureRef.current = null;
                }
              }
            } else {
              if (lastHandDetectedRef.current) {
                lastHandDetectedRef.current = false;
                setHandDetected(false);
              }

              if (lastGestureRef.current) {
                lastGestureRef.current = null;
              }
            }

            if (now - lastUIUpdateRef.current > UI_UPDATE_INTERVAL) {
              updateVectorDisplay();
              lastUIUpdateRef.current = now;
            }
          } catch (err) {
            console.error("Detection error:", err);
          }

          animationFrameRef.current = requestAnimationFrame(detect);
        };

        detect();
      } catch (err) {
        console.error("Initialization error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize hand tracking"
        );
        setIsLoading(false);
      }
    };

    const updateVectorDisplay = () => {
      if (!vectorDisplayRef.current) return;

      const spans = vectorDisplayRef.current.querySelectorAll(
        "[data-vector-value]"
      );
      spans.forEach((span, index) => {
        if (currentVectorRef.current[index] !== undefined) {
          span.textContent = currentVectorRef.current[index].toFixed(2);
        }
      });
    };

    init();

    return () => {
      running = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col gap-4 w-full h-full justify-center items-center mx-auto py-20">
        <h1 className="text-3xl font-semibold">Hand Meme Humorism</h1>
        <div className="text-red-500 text-center">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <p className="text-sm mt-2">
            Please ensure camera permissions are granted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full h-full justify-center items-center mx-auto py-20">
      <h1 className="text-3xl font-semibold">Hand Meme Humorism</h1>

      {isLoading && (
        <div className="text-center py-4">
          <p>Loading hand tracking...</p>
        </div>
      )}

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
        <div
          ref={vectorDisplayRef}
          className="flex flex-row text-sm w-full justify-between max-w-150"
        >
          {SIGN_HUMOR_VECTOR.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-center flex-col gap-1"
            >
              <span>{item.title}</span>
              <span data-vector-value={item.key}>0.00</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
