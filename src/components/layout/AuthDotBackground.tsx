// FILE: src/components/layout/AuthDotBackground.tsx
"use client";

import { useEffect, useRef } from "react";

const SPACING = 20;       // grid pitch (px)
const BASE_RADIUS = 1.4;  // resting dot radius
const MAX_EXTRA = 2.8;    // max extra radius added near cursor
const INFLUENCE = 110;    // px — how far the cursor effect reaches

export function AuthDotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef(0);
  const dirtyRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      dirtyRef.current = true;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      if (!dirtyRef.current) return;
      dirtyRef.current = false;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      const colStart = Math.round(((w % SPACING) / 2) + SPACING / 2);
      const rowStart = Math.round(((h % SPACING) / 2) + SPACING / 2);

      for (let x = colStart; x < w; x += SPACING) {
        for (let y = rowStart; y < h; y += SPACING) {
          // Vignette: 0 opacity at centre → 0.20 at corners
          const vignette = Math.min(
            Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist,
            1,
          ) * 0.20;

          if (vignette < 0.003) continue;

          // Mouse proximity → grow radius with smooth quadratic falloff
          let radius = BASE_RADIUS;
          if (mouse) {
            const d = Math.sqrt((x - mouse.x) ** 2 + (y - mouse.y) ** 2);
            if (d < INFLUENCE) {
              const t = 1 - d / INFLUENCE;
              radius += MAX_EXTRA * t * t;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(36,36,36,${vignette.toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    draw();

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      dirtyRef.current = true;
    };
    const onLeave = () => {
      mouseRef.current = null;
      dirtyRef.current = true;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  );
}
