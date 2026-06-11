"use client";

import React, { useEffect, useRef } from "react";

export default function Pixelsnow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const getAccentColor = () => {
      if (typeof window !== "undefined") {
        const style = getComputedStyle(document.documentElement);
        return style.getPropertyValue("--hub-accent-color").trim() || "#6366f1";
      }
      return "#6366f1";
    };

    const getBgColor = () => {
      if (typeof window !== "undefined") {
        const style = getComputedStyle(document.documentElement);
        return style.getPropertyValue("--hub-bg-color").trim() || "#090d16";
      }
      return "#090d16";
    };

    class Flake {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedY: number = 0;
      speedX: number = 0;
      opacity: number = 0;

      constructor() {
        this.reset();
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -10;
        this.size = Math.random() > 0.5 ? 3 : 2;
        this.speedY = Math.random() * 1.2 + 0.5;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.opacity = Math.random() * 0.4 + 0.15;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y > height + 10) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        const color = getAccentColor();
        ctx.fillStyle = color;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
      }
    }

    const flakeCount = Math.min(Math.floor(width / 25), 45);
    const flakes: Flake[] = Array.from({ length: flakeCount }, () => new Flake());

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.fillStyle = getBgColor();
      ctx.fillRect(0, 0, width, height);

      flakes.forEach((flake) => {
        flake.update();
        flake.draw();
      });

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
