"use client";

import React from "react";

export default function Shapegrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[var(--hub-grid-opacity,0.04)]">
      <style jsx>{`
        .grid-svg {
          width: 100%;
          height: 100%;
        }
      `}</style>
      <svg className="grid-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="shape-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="24" cy="24" r="1" fill="currentColor" />
            <path d="M 0 24 L 6 24 M 42 24 L 48 24 M 24 0 L 24 6 M 24 42 L 24 48" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#shape-grid-pattern)" />
      </svg>
    </div>
  );
}
