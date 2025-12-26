import { Gesture } from "./gestures";

function playSound(src: string, cooldown = 800) {
  let audio: HTMLAudioElement | null = null;
  let lastPlayed = 0;

  return () => {
    if (typeof window === "undefined") return;

    if (!audio) {
      audio = new Audio(src);
      audio.preload = "auto";
    }

    const now = Date.now();
    if (now - lastPlayed > cooldown) {
      audio.currentTime = 0;
      audio.play();
      lastPlayed = now;
    }
  };
}

export const sounds: Record<Gesture, () => void> = {
  vine: playSound("/sounds/vine_boom.mp3", 800),
  omg: playSound("/sounds/omg.mp3", 800),
  get_out: playSound("/sounds/get_out.mp3", 800),
  hidup: playSound("/sounds/hidup.mp3", 800),
  fah: playSound("/sounds/fah.mp3", 800),
};
