# Digital Coloring Book (Android & Web)

A touch-first digital coloring book application built using React 19, TypeScript, Tailwind CSS, and Capacitor. Designed for mobile touchscreens, tablets, and modern web browsers.

---

## Overview

This project provides an interactive coloring book experience optimized for touchscreen devices. It features an adaptive canvas with an intelligent flood-fill engine, responsive audio feedback, a multi-category illustration library, and local artwork storage.

---

## Key Features

- **Scanline Flood Fill Engine**: High-performance pixel fill algorithm with boundary detection and outline anti-aliasing preservation.
- **Interactive Drawing Tools**:
  - Paint bucket (tap to fill closed areas)
  - Freehand brush with adjustable stroke widths
  - Dynamic rainbow brush
  - Line-art safe eraser
  - Color picker (eyedropper)
- **Extensive Illustration Library**: Multiple themed books with 155 coloring templates.
- **Audio Effects**: Responsive sound effects for actions such as filling, drawing, page turns, and saving.
- **Local Gallery**: Save colored creations locally, inspect in fullscreen, and export as PNG images.
- **Parental Controls**: Numeric challenge gate to safeguard settings and data management.
- **Cross-Platform**: Deployable as an Android APK via Capacitor or as a standalone Progressive Web App (PWA).

---

## Directory Structure

```text
├── assets/                  # Project graphic assets and branding
├── legacy/                  # Historical reference material
├── magicbook-mobile/        # Main application source code
│   ├── android/             # Android native Capacitor project
│   ├── public/              # Static assets (templates, audio, manifest)
│   ├── src/
│   │   ├── components/      # UI components (Header, Toolbar, Canvas, Modals)
│   │   ├── utils/           # Flood-fill engine and audio manager
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Application entry point
│   ├── capacitor.config.ts  # Capacitor mobile configuration
│   ├── package.json         # Dependencies and project scripts
│   └── vite.config.ts       # Vite bundler configuration
├── release/                 # Prebuilt Android APK binary
├── scripts/                 # Asset processing and helper scripts
├── .gitignore               # Git ignore rules for node, Android, and build artifacts
└── README.md                # Project documentation
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Android SDK & JDK 17 (for native Android builds)

### Web Development Mode

```bash
cd magicbook-mobile
npm install
npm run dev
```

Visit `http://localhost:5173` to launch the application with live reload.

### Building the Web Bundle

```bash
cd magicbook-mobile
npm run build
```

### Android Build and Deployment

Sync web assets into the Android native wrapper:

```bash
cd magicbook-mobile
npx cap sync
```

Build the debug APK using Gradle:

```bash
cd android
./gradlew assembleDebug
```

The resulting APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.

Install directly to a connected Android device using ADB:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## License

This project is licensed under the MIT License.
