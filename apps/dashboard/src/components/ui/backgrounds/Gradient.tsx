"use client";

import React from "react";

export default function Gradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style jsx>{`
        .gradient-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            -45deg,
            var(--hub-bg-color, #090d16),
            var(--hub-card-bg, rgba(255, 255, 255, 0.03)),
            var(--hub-bg-color, #090d16)
          );
          background-size: 400% 400%;
          animation: gradient-anim 15s ease infinite;
        }
        @keyframes gradient-anim {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="gradient-bg" />
    </div>
  );
}
