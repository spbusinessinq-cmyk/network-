import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  layer: 0 | 1 | 2;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  angle: number;
  opacity: number;
  speed: number;
  progress: number;
  phase: "in" | "move" | "out";
  phaseProgress: number;
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const frameRef = useRef<number>(0);
  const lastShootRef = useRef<number>(0);
  const nextShootIntervalRef = useRef<number>(11000);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildStars(canvas.width, canvas.height);
    };

    const buildStars = (w: number, h: number) => {
      const count = Math.floor((w * h) / 10000);
      starsRef.current = Array.from({ length: Math.min(count, 160) }, () => {
        const layer = Math.random() < 0.15 ? 2 : Math.random() < 0.3 ? 1 : 0;
        const baseOp =
          layer === 2
            ? Math.random() * 0.35 + 0.30
            : layer === 1
            ? Math.random() * 0.25 + 0.18
            : Math.random() * 0.18 + 0.08;
        const radius =
          layer === 2
            ? Math.random() * 0.7 + 0.9
            : layer === 1
            ? Math.random() * 0.55 + 0.5
            : Math.random() * 0.5 + 0.2;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius,
          opacity: baseOp,
          baseOpacity: baseOp,
          pulseSpeed: Math.random() * 0.0005 + 0.00015,
          pulseOffset: Math.random() * Math.PI * 2,
          layer: layer as 0 | 1 | 2,
        };
      });
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    const spawnShootingStar = (w: number, h: number) => {
      const angle = (Math.random() * 28 + 18) * (Math.PI / 180);
      shootingStarsRef.current.push({
        x: Math.random() * w * 0.8 + w * 0.05,
        y: Math.random() * h * 0.45,
        length: Math.random() * 110 + 70,
        angle,
        opacity: 0,
        speed: Math.random() * 1.6 + 1.4,
        progress: 0,
        phase: "in",
        phaseProgress: 0,
      });
    };

    const draw = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      t += 0.016;

      for (const star of starsRef.current) {
        const pulse = Math.sin(t * star.pulseSpeed * 1000 + star.pulseOffset) * 0.10;
        star.opacity = Math.max(0.04, Math.min(0.72, star.baseOpacity + pulse));

        if (star.layer === 2 && star.radius > 1.2) {
          const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 2.5);
          grd.addColorStop(0, `rgba(210, 228, 255, ${star.opacity})`);
          grd.addColorStop(1, `rgba(210, 228, 255, 0)`);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205, 225, 255, ${star.opacity})`;
        ctx.fill();
      }

      if (timestamp - lastShootRef.current > nextShootIntervalRef.current) {
        spawnShootingStar(w, h);
        lastShootRef.current = timestamp;
        nextShootIntervalRef.current = 9000 + Math.random() * 16000;
      }

      shootingStarsRef.current = shootingStarsRef.current.filter(ss => {
        const fadeInDur = 16;
        const moveDur = ss.length / ss.speed;
        const fadeOutDur = 20;

        if (ss.phase === "in") {
          ss.phaseProgress += 1;
          ss.opacity = (ss.phaseProgress / fadeInDur) * 0.3;
          if (ss.phaseProgress >= fadeInDur) { ss.phase = "move"; ss.phaseProgress = 0; }
        } else if (ss.phase === "move") {
          ss.x += Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;
          ss.phaseProgress += 1;
          if (ss.phaseProgress >= moveDur) { ss.phase = "out"; ss.phaseProgress = 0; }
        } else {
          ss.phaseProgress += 1;
          ss.opacity = ((fadeOutDur - ss.phaseProgress) / fadeOutDur) * 0.3;
          if (ss.phaseProgress >= fadeOutDur) return false;
        }

        if (ss.x > w + 60 || ss.y > h + 60) return false;

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;
        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `rgba(200, 220, 255, 0)`);
        grad.addColorStop(0.5, `rgba(212, 232, 255, ${ss.opacity * 0.45})`);
        grad.addColorStop(1, `rgba(222, 238, 255, ${ss.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        return true;
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}
