import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulseOffset: number;
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
  const nextShootIntervalRef = useRef<number>(12000);

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
      const count = Math.floor((w * h) / 14000);
      starsRef.current = Array.from({ length: Math.min(count, 140) }, () => {
        const baseOp = Math.random() * 0.28 + 0.04;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 0.8 + 0.2,
          opacity: baseOp,
          baseOpacity: baseOp,
          pulseSpeed: Math.random() * 0.0006 + 0.0002,
          pulseOffset: Math.random() * Math.PI * 2,
        };
      });
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    const spawnShootingStar = (w: number, h: number) => {
      const angle = (Math.random() * 25 + 20) * (Math.PI / 180);
      shootingStarsRef.current.push({
        x: Math.random() * w * 0.85 + w * 0.05,
        y: Math.random() * h * 0.4,
        length: Math.random() * 90 + 60,
        angle,
        opacity: 0,
        speed: Math.random() * 1.4 + 1.2,
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

      // Stars
      for (const star of starsRef.current) {
        const pulse = Math.sin(t * star.pulseSpeed * 1000 + star.pulseOffset) * 0.08;
        star.opacity = Math.max(0.02, Math.min(0.4, star.baseOpacity + pulse));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity})`;
        ctx.fill();
      }

      // Spawn shooting star
      if (timestamp - lastShootRef.current > nextShootIntervalRef.current) {
        spawnShootingStar(w, h);
        lastShootRef.current = timestamp;
        nextShootIntervalRef.current = 10000 + Math.random() * 14000;
      }

      // Draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter(ss => {
        const fadeInDur = 18;
        const moveDur = ss.length / ss.speed;
        const fadeOutDur = 22;

        if (ss.phase === "in") {
          ss.phaseProgress += 1;
          ss.opacity = (ss.phaseProgress / fadeInDur) * 0.22;
          if (ss.phaseProgress >= fadeInDur) { ss.phase = "move"; ss.phaseProgress = 0; }
        } else if (ss.phase === "move") {
          ss.x += Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;
          ss.phaseProgress += 1;
          if (ss.phaseProgress >= moveDur) { ss.phase = "out"; ss.phaseProgress = 0; }
        } else {
          ss.phaseProgress += 1;
          ss.opacity = ((fadeOutDur - ss.phaseProgress) / fadeOutDur) * 0.22;
          if (ss.phaseProgress >= fadeOutDur) return false;
        }

        if (ss.x > w + 50 || ss.y > h + 50) return false;

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;
        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `rgba(200, 220, 255, 0)`);
        grad.addColorStop(0.6, `rgba(210, 230, 255, ${ss.opacity * 0.5})`);
        grad.addColorStop(1, `rgba(220, 235, 255, ${ss.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.7;
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
