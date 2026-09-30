import React, { useEffect, useState, useRef } from 'react';

export const LightningEntrance: React.FC = () => {
  const [active, setActive] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();

    const startTime = Date.now();
    const duration = 1200; // 1.2 seconds total animation duration (<= 1.5s)

    // Function to generate jagged lightning segments using midpoint displacement
    const generateJaggedPath = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displace: number
    ): { x: number; y: number }[] => {
      if (displace < 4) {
        return [
          { x: x1, y: y1 },
          { x: x2, y: y2 }
        ];
      }

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;

      const path1 = generateJaggedPath(x1, y1, midX, midY, displace * 0.5);
      const path2 = generateJaggedPath(midX, midY, x2, y2, displace * 0.5);

      return [...path1, ...path2.slice(1)];
    };

    // SINGLE diagonal lightning path travelling from top-left to bottom-right (NO X or crossing pattern)
    const mainPath = generateJaggedPath(-10, -10, canvas.width + 10, canvas.height + 10, 140);

    // Optional short offshoot spurs branching off main trunk
    const branches: { startIdx: number; path: { x: number; y: number }[] }[] = [];
    for (let i = 6; i < mainPath.length - 6; i += 7) {
      if (Math.random() < 0.35) {
        const pt = mainPath[i];
        const angle = Math.atan2(canvas.height, canvas.width) + (Math.random() > 0.5 ? 0.75 : -0.75);
        const len = 25 + Math.random() * 45;
        const bx2 = pt.x + Math.cos(angle) * len;
        const by2 = pt.y + Math.sin(angle) * len;
        branches.push({
          startIdx: i,
          path: generateJaggedPath(pt.x, pt.y, bx2, by2, 18)
        });
      }
    }

    let animationFrameId: number;

    const render = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (progress < 1.0) {
        // 1. Brief subtle screen illumination / flash when lightning strikes (peaks around progress ~0.2 - 0.4)
        if (progress > 0.05 && progress < 0.55) {
          const flashAlpha = 0.20 * Math.sin(((progress - 0.05) / 0.50) * Math.PI);
          ctx.fillStyle = `rgba(34, 211, 238, ${flashAlpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.35})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Rapid travel progression across screen (travel completes in first ~45% of time)
        const travelProgress = Math.min(1, progress / 0.45);
        const drawCount = Math.max(1, Math.floor(mainPath.length * travelProgress));

        // 3. Smooth fade out towards the end of the duration
        let fadeAlpha = 1;
        if (progress > 0.45) {
          fadeAlpha = 1 - (progress - 0.45) / 0.55;
        }

        // 4. Brief electrical flicker effect
        const flicker = Math.random() > 0.12 ? 1 : 0.45;
        const alpha = fadeAlpha * flicker;

        if (drawCount > 1 && alpha > 0.01) {
          // --- Outer Electric Blue/Cyan Glow ---
          ctx.beginPath();
          ctx.moveTo(mainPath[0].x, mainPath[0].y);
          for (let i = 1; i < drawCount; i++) {
            ctx.lineTo(mainPath[i].x, mainPath[i].y);
          }
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.85 * alpha})`;
          ctx.lineWidth = 7;
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 24;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // --- Inner Bright White Core ---
          ctx.beginPath();
          ctx.moveTo(mainPath[0].x, mainPath[0].y);
          for (let i = 1; i < drawCount; i++) {
            ctx.lineTo(mainPath[i].x, mainPath[i].y);
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * alpha})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // --- Short Offshoot Spurs ---
          branches.forEach((b) => {
            if (b.startIdx < drawCount) {
              ctx.beginPath();
              ctx.moveTo(b.path[0].x, b.path[0].y);
              for (let j = 1; j < b.path.length; j++) {
                ctx.lineTo(b.path[j].x, b.path[j].y);
              }
              ctx.strokeStyle = `rgba(56, 189, 248, ${0.65 * alpha})`;
              ctx.lineWidth = 1.5;
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 10;
              ctx.stroke();
            }
          });
        }

        animationFrameId = requestAnimationFrame(render);
      } else {
        setActive(false);
      }
    };

    render();

    const timer = setTimeout(() => {
      setActive(false);
    }, duration + 50);

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
