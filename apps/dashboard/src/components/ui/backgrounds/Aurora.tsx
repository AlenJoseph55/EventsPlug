"use client";

import React from "react";

export default function Aurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style jsx>{`
        .aurora-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: var(--hub-aurora-accent-opacity, 0.08);
          mix-blend-mode: screen;
          transition: all 0.5s ease;
        }
        .blob-1 {
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: var(--hub-accent-color, #6366f1);
          animation: drift-1 25s infinite ease-in-out alternate;
        }
        .blob-2 {
          bottom: -10%;
          right: -10%;
          width: 45vw;
          height: 45vw;
          background: #ec4899;
          animation: drift-2 30s infinite ease-in-out alternate-reverse;
          opacity: var(--hub-aurora-pink-opacity, 0.05);
        }
        .blob-3 {
          top: 40%;
          left: 50%;
          width: 30vw;
          height: 30vw;
          background: var(--hub-accent-color, #6366f1);
          animation: drift-3 20s infinite ease-in-out alternate;
          opacity: calc(var(--hub-aurora-accent-opacity, 0.08) * 0.5);
        }

        @keyframes drift-1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(80px, -40px) scale(1.15); }
        }
        @keyframes drift-2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-60px, 80px) scale(0.9); }
        }
        @keyframes drift-3 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(100px, 50px) scale(1.1); }
        }
      `}</style>
      <div className="aurora-container">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
    </div>
  );
}
