"use client";

import React from "react";

export default function Lightrays() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style jsx>{`
        .rays-container {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 150vmax;
          height: 150vmax;
          background: conic-gradient(
            from 180deg at 50% 50%,
            transparent 0deg,
            var(--hub-accent-color, #6366f1) 15deg,
            transparent 30deg,
            var(--hub-accent-color, #6366f1) 45deg,
            transparent 60deg,
            var(--hub-accent-color, #6366f1) 90deg,
            transparent 120deg,
            var(--hub-accent-color, #6366f1) 150deg,
            transparent 180deg,
            var(--hub-accent-color, #6366f1) 210deg,
            transparent 240deg,
            var(--hub-accent-color, #6366f1) 270deg,
            transparent 300deg,
            var(--hub-accent-color, #6366f1) 330deg,
            transparent 360deg
          );
          opacity: calc(var(--hub-spotlight-opacity, 0.12) * 0.4);
          animation: spin 100s linear infinite;
          mix-blend-mode: screen;
        }
        @keyframes spin {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
      `}</style>
      <div className="rays-container" />
    </div>
  );
}
