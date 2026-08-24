import React, { useEffect, useState, useRef } from 'react';

export const LightningEntrance: React.FC = () => {
  const [active, setActive] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const startTime = Date.now();
    const duration = 1200; // 1.2 seconds total animation duration

    // Function to generate jagged lightning segments between two points
    const generateLightningPath = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displace: number
    ): { x: number; y: number }[] => {
      const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;

      if (displace > 8) {
        const path1 = generateLightningPath(x1, y1, midX, midY, displace / 2);
        const path2 = generateLightningPath(midX, midY, x2, y2, displace / 2);
        return [...path1, ...path2.slice(1)];
      }

      points.push({ x: x2, y: y2 });
      return points;
    };

    const path1 = generateLightningPath(0, 0, canvas.width, canvas.height, 120);
    const path2 = generateLightningPath(canvas.width, 0, 0, canvas.height, 120);

    let animationFrameId: number;

    const render = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (progress < 0.9) {
        // Flash screen briefly when lightning strokes cross (at ~40% to 60% progress)
        if (progress > 0.35 && progress < 0.55) {
          ctx.fillStyle = `rgba(34, 211, 238, ${0.15 * (1 - Math.abs(progress - 0.45) * 10)})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const drawStreak = (path: { x: number; y: number }[]) => {
          const drawCount = Math.floor(path.length * Math.min(1, progress * 1.8));

          // Outer Glow
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < drawCount; i++) {
            ctx.lineTo(path[i].x, path[i].y);
          }
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
          ctx.lineWidth = 8;
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 25;
          ctx.stroke();

          // Inner Bright Core
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < drawCount; i++) {
            ctx.lineTo(path[i].x, path[i].y);
          }
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.stroke();
        };

        drawStreak(path1);
        drawStreak(path2);

        animationFrameId = requestAnimationFrame(render);
      } else {
        setActive(false);
      }
    };

    render();

    const timer = setTimeout(() => {
      setActive(false);
    }, duration);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, []);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    />
  );
};
