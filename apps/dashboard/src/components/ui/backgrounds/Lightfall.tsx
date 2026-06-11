"use client";

import React, { useEffect, useRef } from "react";

export default function Lightfall() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Get brand accent color
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

    class Drop {
      x: number = 0;
      y: number = 0;
      speed: number = 0;
      length: number = 0;
      opacity: number = 0;

      constructor() {
        this.reset();
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -20;
        this.speed = Math.random() * 4 + 2;
        this.length = Math.random() * 30 + 10;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.y += this.speed;
        if (this.y > height + 20) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length);
        const color = getAccentColor();
        grad.addColorStop(0, `${color}00`);
        grad.addColorStop(1, `${color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
      }
    }

    const dropCount = Math.min(Math.floor(width / 15), 60);
    const drops: Drop[] = Array.from({ length: dropCount }, () => new Drop());

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.fillStyle = getBgColor();
      ctx.fillRect(0, 0, width, height);

      drops.forEach((drop) => {
        drop.update();
        drop.draw();
      });

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
