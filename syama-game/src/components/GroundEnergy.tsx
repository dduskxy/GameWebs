import React, { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────
   GROUND ENERGY EFFECT  —  สุวรรณสามชาดก
   Three rendering layers:
     1. Ground mist  — slow ambient haze at floor
     2. Energy wisps — sinusoidal rising streams
     3. Pulse rings  — periodic radial shockwaves
   ───────────────────────────────────────────────── */

interface Wisp {
  x: number;
  baseX: number;
  y: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  hue: number;       // 35–55 gold/amber range
  sinAmp: number;
  sinFreq: number;
  sinOffset: number;
  layer: 1 | 2 | 3; // depth layers — 1=far,3=close
}

interface PulseRing {
  x: number;
  y: number;         // fixed at ground level
  r: number;
  maxR: number;
  alpha: number;
  speed: number;
  hue: number;
}

interface MistParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
}

const WISPS_MAX = 35;
const MIST_MAX = 25;
const RINGS_MAX = 3;

// Gold/amber color palette (HSL for easy variation)
const goldHue = () => 35 + Math.random() * 22;   // 35–57°  gold→amber

export const GroundEnergy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const wisps: Wisp[] = [];
    const mist: MistParticle[] = [];
    const rings: PulseRing[] = [];
    let frame = 0;

    // ── RESIZE ──
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const GROUND = () => H();   // visual "ground" = bottom of viewport

    // ── SPAWN HELPERS ──
    const spawnWisp = () => {
      if (wisps.length >= WISPS_MAX) return;
      const layer = (Math.random() < 0.35 ? 1 : Math.random() < 0.55 ? 2 : 3) as 1|2|3;
      const sizeBase = layer === 1 ? 2 : layer === 2 ? 3.5 : 5.5;
      wisps.push({
        x: Math.random() * W(),
        baseX: Math.random() * W(),
        y: GROUND() + Math.random() * 30,
        vy: (0.28 + Math.random() * 0.55) * layer * 0.6,
        size: sizeBase + Math.random() * sizeBase * 0.6,
        alpha: 0,
        decay: (0.003 + Math.random() * 0.004) / layer,
        hue: goldHue(),
        sinAmp: 18 + Math.random() * 32,
        sinFreq: 0.008 + Math.random() * 0.014,
        sinOffset: Math.random() * Math.PI * 2,
        layer,
      });
    };

    const spawnMist = () => {
      if (mist.length >= MIST_MAX) return;
      const x = Math.random() * W();
      mist.push({
        x,
        y: GROUND() - Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.04 + Math.random() * 0.12),
        size: 40 + Math.random() * 80,
        alpha: 0,
        decay: 0.0012 + Math.random() * 0.001,
      });
    };

    const spawnRing = () => {
      if (rings.length >= RINGS_MAX) return;
      rings.push({
        x: W() * 0.15 + Math.random() * W() * 0.7,
        y: GROUND() - 4,
        r: 0,
        maxR: 120 + Math.random() * 180,
        alpha: 0.55,
        speed: 1.2 + Math.random() * 1.4,
        hue: goldHue(),
      });
    };

    // ── DRAW: Ground haze gradient ──
    const drawGroundHaze = () => {
      const grd = ctx.createLinearGradient(0, GROUND() - 120, 0, GROUND());
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(0.5, `hsla(42,90%,48%,0.015)`);
      grd.addColorStop(0.85, `hsla(38,100%,40%,0.04)`);
      grd.addColorStop(1, `hsla(35,100%,30%,0.08)`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, GROUND() - 120, W(), 120);
    };

    // ── DRAW: Horizontal ground line glow ──
    const drawGroundLine = () => {
      const t = frame * 0.018;
      const grd = ctx.createLinearGradient(0, 0, W(), 0);
      grd.addColorStop(0,   'rgba(0,0,0,0)');
      grd.addColorStop(0.15, `hsla(45,100%,65%,${0.05 + 0.03 * Math.sin(t)})`);
      grd.addColorStop(0.5,  `hsla(42,100%,70%,${0.12 + 0.04 * Math.sin(t + 1.2)})`);
      grd.addColorStop(0.85, `hsla(45,100%,65%,${0.05 + 0.03 * Math.sin(t + 2.4)})`);
      grd.addColorStop(1,   'rgba(0,0,0,0)');

      ctx.save();
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur  = 8;
      ctx.strokeStyle = grd;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND() - 2);
      ctx.lineTo(W(), GROUND() - 2);
      ctx.stroke();
      ctx.restore();
    };

    // ── DRAW: Pulse rings ──
    const updateRings = () => {
      for (let i = rings.length - 1; i >= 0; i--) {
        const rn = rings[i];
        rn.r     += rn.speed;
        rn.alpha -= rn.alpha * 0.025;

        if (rn.r >= rn.maxR || rn.alpha < 0.01) { rings.splice(i, 1); continue; }

        // Ellipse (perspective foreshortening)
        const rx  = rn.r;
        const ry  = rn.r * 0.22;
        const pct = rn.r / rn.maxR;

        ctx.save();
        ctx.globalAlpha = rn.alpha * (1 - pct * 0.6);
        ctx.strokeStyle = `hsl(${rn.hue},100%,70%)`;
        ctx.lineWidth   = 1.8 * (1 - pct * 0.8);
        ctx.shadowColor = `hsl(${rn.hue},100%,65%)`;
        ctx.shadowBlur  = 14;
        ctx.beginPath();
        ctx.ellipse(rn.x, rn.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    // ── DRAW: Mist blobs ──
    const updateMist = () => {
      for (let i = mist.length - 1; i >= 0; i--) {
        const m = mist[i];
        m.x += m.vx;
        m.y += m.vy;

        // Fade in, then fade out
        if (m.alpha < 0.12) m.alpha += 0.006;
        else                m.alpha -= m.decay;

        if (m.alpha <= 0) { mist.splice(i, 1); continue; }

        const grd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size);
        grd.addColorStop(0, `hsla(42,90%,55%,${m.alpha * 0.85})`);
        grd.addColorStop(0.5, `hsla(40,80%,42%,${m.alpha * 0.4})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ── DRAW: Energy wisps ──
    const updateWisps = () => {
      for (let i = wisps.length - 1; i >= 0; i--) {
        const w = wisps[i];
        w.sinOffset += w.sinFreq * 60;  // per frame
        w.x = w.baseX + Math.sin(w.sinOffset) * w.sinAmp;
        w.y -= w.vy;

        // Fade in quickly, then hold, then fade out near top
        const distFromGround = GROUND() - w.y;
        const travel = Math.min(H() * 0.55, 400);
        if (distFromGround < 40)  w.alpha = Math.min(1, w.alpha + 0.04);
        else if (distFromGround > travel) w.alpha -= w.decay * 2.5;
        else w.alpha -= w.decay;

        if (w.alpha <= 0 || w.y < -20) { wisps.splice(i, 1); continue; }

        // Size tapers as it rises
        const t    = Math.max(0, Math.min(1, distFromGround / travel));
        const size = w.size * (0.2 + t * 0.8);

        // Layer-based blur/glow
        const blur    = w.layer === 1 ? 6 : w.layer === 2 ? 10 : 16;
        const bright  = w.layer === 1 ? '55%' : w.layer === 2 ? '65%' : '78%';

        ctx.save();
        ctx.globalAlpha = w.alpha * (w.layer === 1 ? 0.2 : w.layer === 2 ? 0.35 : 0.5);
        ctx.shadowColor = `hsl(${w.hue},100%,${bright})`;
        ctx.shadowBlur  = blur * 0.5;
        ctx.fillStyle   = `hsl(${w.hue},100%,${bright})`;
        ctx.beginPath();
        ctx.arc(w.x, w.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    // ── MAIN LOOP ──
    const render = () => {
      ctx.clearRect(0, 0, W(), H());

      // Spawn on schedule
      if (frame % 5  === 0) spawnWisp();
      if (frame % 20 === 0) spawnMist();
      if (frame % 180 === 0) spawnRing();

      drawGroundHaze();
      updateMist();           // Layer: behind wisps
      updateRings();          // Layer: at ground, perspective ellipses
      updateWisps();          // Layer: foreground rising particles
      drawGroundLine();       // Layer: top — animated glow line

      frame++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 5,       // above background, below game UI (z-index 10)
      }}
    />
  );
};

export default GroundEnergy;
