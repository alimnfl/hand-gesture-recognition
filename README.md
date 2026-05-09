# Hand Gesture Detector ✨

A lightweight real-time hand gesture recognition project using MediaPipe Hands from Google.

This project detects hand gestures using 21 hand landmarks and simple vector matching techniques.

---

## Features

- ✋ Real-time hand tracking
- 🧠 Lightweight gesture recognition
- ⚡ Fast browser inference
- 📷 Webcam support
- 🎯 Custom gesture matching
- 🌐 Works offline

---

# Hand Landmarks

MediaPipe Hands provides 21 landmark points.

| Landmark  | Description   |
| --------- | ------------- |
| `0`       | Wrist         |
| `1 - 4`   | Thumb         |
| `5 - 8`   | Index finger  |
| `9 - 12`  | Middle finger |
| `13 - 16` | Ring finger   |
| `17 - 20` | Pinky finger  |

---

# Registered Gestures

## ✌️ Vine

Peace or V-sign gesture.

---

## ✋ OMG

Open palm gesture.

---

## 🤘 Get Out

Index and pinky finger extended.

---

## 👊 Hidup

Punch or closed fist gesture.

---

## ☝️ Fah

Custom symbolic gesture.

---

# Gesture Detection

The detector works by:

1. Capturing hand landmarks
2. Extracting finger vectors
3. Comparing vectors with gesture profiles
4. Returning the closest gesture

# Technologies

- TypeScript
- MediaPipe Hands
- Canvas API
- Webcam API

---

# Future Improvements

- 🤖 AI-based classification
- ✋ Multi-hand detection
- 📱 Mobile optimization
- ⚡ WASM acceleration
- 🧩 Dynamic gestures

---

# References

- MediaPipe Hands
- TypeScript
- Computer Vision
- Gesture Recognition
