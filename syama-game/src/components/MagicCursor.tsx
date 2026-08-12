import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  type: 'firefly' | 'leaf' | 'spark' | 'lotus';
  sinOffset: number;
  life: number;
  maxLife: number;
}

interface RingState {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  active: boolean;
}

const PALETTE = [
  '#FFD700', '#FFC200', '#FFAA00',
  '#FFF0A0', '#FFE066', '#DAA520',
];
const SPARK_PALETTE = ['#ffffff', '#fffde7', '#fff9c4', '#FFD700'];
const LOTUS_PALETTE = ['#FFB7C5', '#FF91A4', '#FF6B8A', '#FFC2D4'];

const MAX_PARTICLES = 60;

export const MagicCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const mouse = { x: -200, y: -200, lastX: -200, lastY: -200, active: false };

    // Cursor ring state
    const ring: RingState = { x: -200, y: -200, scale: 1, alpha: 0.7, active: false };
    let ringTargetX = -200, ringTargetY = -200;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // ── PARTICLE FACTORY ──
    const spawnParticle = (x: number, y: number, type: Particle['type'], countOverride?: number) => {
      const count = countOverride ?? 1;
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) return;

        const angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 1.8 + 0.3;
        let size = 3 + Math.random() * 3;
        let color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        let decay = 0.018 + Math.random() * 0.012;

        if (type === 'leaf') {
          size = 7 + Math.random() * 7;
          speed = 0.8 + Math.random() * 0.6;
          decay = 0.006 + Math.random() * 0.006;
        } else if (type === 'spark') {
          size = 1.5 + Math.random() * 2.5;
          speed = 2.5 + Math.random() * 3;
          decay = 0.035 + Math.random() * 0.025;
          color = SPARK_PALETTE[Math.floor(Math.random() * SPARK_PALETTE.length)];
        } else if (type === 'lotus') {
          size = 6 + Math.random() * 8;
          speed = 0.5 + Math.random() * 0.8;
          decay = 0.005 + Math.random() * 0.007;
          color = LOTUS_PALETTE[Math.floor(Math.random() * LOTUS_PALETTE.length)];
        }

        const maxLife = Math.floor(1 / decay);
        particles.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (type === 'leaf' || type === 'lotus' ? 0.2 : 0.7),
          size, maxSize: size, color, alpha: 1.0, decay,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          type, sinOffset: Math.random() * Math.PI * 2,
          life: 0, maxLife,
        });
      }
    };

    // ── CLICK BURST ──
    const handleMouseDown = (e: MouseEvent) => {
      // Spark burst (8 sparks)
      for (let i = 0; i < 8; i++) spawnParticle(e.clientX, e.clientY, 'spark');
      // 1 lotus petal
      spawnParticle(e.clientX, e.clientY, 'lotus');
      // Ring scale pulse
      ring.scale = 1.5;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.active = true;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      ringTargetX = e.clientX;
      ringTargetY = e.clientY;
      ring.active = true;

      const dist = Math.hypot(mouse.x - mouse.lastX, mouse.y - mouse.lastY);
      if (dist < 6) return;

      const speed = Math.min(dist / 10, 1);

      // Spawn only 1 particle per move event, less frequently
      const r = Math.random();
      if (r < 0.08) spawnParticle(mouse.x, mouse.y, 'leaf');
      else spawnParticle(mouse.x, mouse.y, 'firefly', Math.ceil(speed * 0.5));
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      ring.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseleave', handleMouseLeave);

    // ── DRAW HELPERS ──
    const drawBodhiLeaf = (
      context: CanvasRenderingContext2D,
      x: number, y: number, size: number, rotation: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(size / 10, size / 10);
      context.beginPath();
      context.moveTo(0, -10);
      context.bezierCurveTo(6, -5, 10, 2, 8, 8);
      context.bezierCurveTo(6, 12, 2, 11, 0, 9);
      context.bezierCurveTo(-2, 11, -6, 12, -8, 8);
      context.bezierCurveTo(-10, 2, -6, -5, 0, -10);
      context.closePath();
      context.fill();
      context.strokeStyle = 'rgba(255,255,255,0.35)';
      context.lineWidth = 0.6;
      context.beginPath();
      context.moveTo(0, -8);
      context.lineTo(0, 8);
      context.stroke();
      context.restore();
    };

    const drawLotusPetal = (
      context: CanvasRenderingContext2D,
      x: number, y: number, size: number, rotation: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(size / 10, size / 10);
      context.beginPath();
      context.moveTo(0, -11);
      context.bezierCurveTo(5, -6, 7, 2, 4, 9);
      context.bezierCurveTo(2, 12, -2, 12, -4, 9);
      context.bezierCurveTo(-7, 2, -5, -6, 0, -11);
      context.closePath();
      context.fill();
      context.restore();
    };

    const drawCursorRing = () => {
      if (!ring.active) return;

      // Lerp ring toward mouse
      ring.x += (ringTargetX - ring.x) * 0.12;
      ring.y += (ringTargetY - ring.y) * 0.12;

      // Ease scale back to 1
      ring.scale += (1 - ring.scale) * 0.1;

      const r = 18 * ring.scale;

      ctx.save();
      ctx.strokeStyle = `rgba(255, 215, 0, ${ring.alpha * 0.75})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = `rgba(255, 235, 100, ${ring.alpha * 0.6})`;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // ── MAIN RENDER LOOP ──
    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Ambient glow under cursor
      if (mouse.active && mouse.x > 0) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 36);
        grad.addColorStop(0, 'rgba(255,215,0,0.06)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 36, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw cursor ring
      drawCursorRing();

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.sinOffset += 0.06;

        if (p.type === 'leaf') {
          p.x += p.vx + Math.sin(p.sinOffset) * 0.4;
          p.y += p.vy + 0.15;
          p.vy *= 0.98;
          p.vx *= 0.98;
        } else if (p.type === 'lotus') {
          p.x += p.vx + Math.sin(p.sinOffset) * 0.3;
          p.y += p.vy + 0.08;
          p.vy *= 0.97;
          p.vx *= 0.96;
        } else if (p.type === 'spark') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12; // gravity
          p.vx *= 0.96;
          p.vy *= 0.97;
        } else {
          // firefly
          p.x += p.vx + Math.sin(p.sinOffset) * 0.9;
          p.y += p.vy - 0.15;
          p.vy *= 0.94;
          p.vx *= 0.94;
          p.size = p.maxSize * (0.75 + 0.25 * Math.sin(p.sinOffset * 1.5));
        }

        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) { particles.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.type === 'spark' ? '#ffffff' : p.color;
        ctx.shadowBlur = p.type === 'spark' ? 6 : p.type === 'firefly' ? 14 : 8;

        if (p.type === 'leaf') {
          drawBodhiLeaf(ctx, p.x, p.y, p.size, p.rotation);
        } else if (p.type === 'lotus') {
          drawLotusPetal(ctx, p.x, p.y, p.size, p.rotation);
        } else if (p.type === 'spark') {
          ctx.lineWidth = p.size * 0.6;
          ctx.strokeStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 9999,
        cursor: 'none',
      }}
    />
  );
};

export default MagicCursor;
