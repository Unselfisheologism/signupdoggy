import { useEffect, useRef, useState, useCallback } from 'react';

// ── CatchTheFakes ─────────────────────────────────────────────────────────────
// A 30-second arcade in the footer. You play the security guard: a "▣" at the
// bottom of the screen. Fake signups (disposable emails, Tor exits, VPN ASNs)
// scroll left-to-right. Real signups (green) pass through — don't shoot them.
// You have 3 lives. Hit SPACE to start. Click (or space) to shoot.
// Score = fakes caught × 10 - real shot × 25.
//
// Why a footer game? The author of "32 Viral Product Principles" says
// "A viral product ends with a footer people want to share." A playable
// game IS the most shareable artifact a footer can hold.

const W = 720;
const H = 220;
const LANES = 4;
const LANE_H = (H - 40) / LANES; // 40px reserved for HUD
const PLAYER_Y = H - 18;
const PLAYER_SPEED = 6;
const BULLET_SPEED = 8;
const MAX_LIVES = 3;
const GAME_TIME = 30; // seconds

type Enemy = {
  x: number;
  y: number;
  lane: number;
  speed: number;
  kind: 'disposable' | 'tor' | 'vpn' | 'role';
  real: boolean; // false = fake (shoot it), true = real (let it through)
  hit?: boolean;
};

type Bullet = { x: number; y: number; vy: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

const FAKE_LABELS: Array<Enemy['kind']> = ['disposable', 'tor', 'vpn', 'role'];
const FAKE_GLYPHS: Record<Enemy['kind'], string> = {
  disposable: '📧',
  tor: '🧅',
  vpn: '🛡',
  role: '👤',
};

export default function CatchTheFakes() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(window.localStorage.getItem('sd_highscore') || '0', 10);
  });

  // Mutable game state lives in refs so the RAF loop can mutate without
  // forcing React re-renders every frame.
  const playerXRef = useRef(W / 2);
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [k: string]: boolean }>({});
  const spawnTimerRef = useRef(0);
  const startTimeRef = useRef(0);
  const stateRef = useRef({ running: false, over: false, score: 0, lives: MAX_LIVES, t: GAME_TIME });

  // ── Start / stop ──────────────────────────────────────────────────────────
  const start = useCallback(() => {
    setRunning(true);
    setOver(false);
    setScore(0);
    setLives(MAX_LIVES);
    setTimeLeft(GAME_TIME);
    enemiesRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    playerXRef.current = W / 2;
    spawnTimerRef.current = 0;
    startTimeRef.current = performance.now();
    stateRef.current = { running: true, over: false, score: 0, lives: MAX_LIVES, t: GAME_TIME };
  }, []);

  const stop = useCallback(() => {
    stateRef.current.running = false;
    stateRef.current.over = true;
    setRunning(false);
    setOver(true);
    setHighScore(prev => {
      const next = Math.max(prev, stateRef.current.score);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sd_highscore', String(next));
      }
      return next;
    });
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  // ── Input ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (down && k === ' ' && !stateRef.current.running) {
        e.preventDefault();
        start();
        return;
      }
      if (down && k === ' ') {
        e.preventDefault();
        // Fire a bullet
        bulletsRef.current.push({ x: playerXRef.current, y: PLAYER_Y, vy: -BULLET_SPEED });
      }
      keysRef.current[k] = down;
    };
    const dn = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', dn);
      window.removeEventListener('keyup', up);
    };
  }, [start]);

  const shoot = useCallback(() => {
    if (!stateRef.current.running) return;
    bulletsRef.current.push({ x: playerXRef.current, y: PLAYER_Y, vy: -BULLET_SPEED });
  }, []);

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastT = performance.now();
    const loop = (now: number) => {
      const dtMs = Math.min(40, now - lastT);
      lastT = now;
      const dt = dtMs / 16.67; // normalized to 60fps

      if (stateRef.current.running) {
        // Timer
        const elapsed = (now - startTimeRef.current) / 1000;
        const remaining = Math.max(0, GAME_TIME - elapsed);
        stateRef.current.t = remaining;
        if (remaining <= 0) {
          stop();
        }

        // Player movement
        if (keysRef.current['arrowleft'] || keysRef.current['a']) {
          playerXRef.current = Math.max(14, playerXRef.current - PLAYER_SPEED * dt);
        }
        if (keysRef.current['arrowright'] || keysRef.current['d']) {
          playerXRef.current = Math.min(W - 14, playerXRef.current + PLAYER_SPEED * dt);
        }

        // Spawn enemies
        spawnTimerRef.current -= dt;
        if (spawnTimerRef.current <= 0) {
          spawnTimerRef.current = 18 + Math.random() * 22;
          const lane = Math.floor(Math.random() * LANES);
          const isFake = Math.random() < 0.78; // 78% fakes
          enemiesRef.current.push({
            x: -20,
            y: 20 + lane * LANE_H + LANE_H / 2,
            lane,
            speed: (1.0 + Math.random() * 1.2 + Math.max(0, (30 - remaining) / 30) * 1.5) * dt,
            kind: FAKE_LABELS[Math.floor(Math.random() * FAKE_LABELS.length)],
            real: !isFake,
          });
        }

        // Move enemies
        for (const e of enemiesRef.current) {
          e.x += e.speed;
        }
        // Move bullets
        for (const b of bulletsRef.current) {
          b.y += b.vy * dt;
        }
        // Move particles
        for (const p of particlesRef.current) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 0.15 * dt;
          p.life -= dt;
        }

        // Collisions: bullets vs enemies
        const remainingEnemies: Enemy[] = [];
        for (const e of enemiesRef.current) {
          let hit = false;
          for (const b of bulletsRef.current) {
            if (Math.abs(b.x - e.x) < 16 && Math.abs(b.y - e.y) < 12) {
              hit = true;
              b.y = -999; // mark bullet dead
              // Particles
              for (let i = 0; i < 8; i++) {
                particlesRef.current.push({
                  x: e.x, y: e.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4 - 1,
                  life: 18 + Math.random() * 8,
                  color: e.real ? '#FF5F56' : '#DCFE52',
                });
              }
              if (e.real) {
                stateRef.current.score = Math.max(0, stateRef.current.score - 25);
              } else {
                stateRef.current.score += 10;
              }
              break;
            }
          }
          if (!hit) {
            // Reached the right side
            if (e.x > W + 20) {
              if (!e.real) {
                // A fake got through — lose a life
                stateRef.current.lives = Math.max(0, stateRef.current.lives - 1);
                if (stateRef.current.lives === 0) {
                  stop();
                }
              } else {
                // Real user got through cleanly — bonus
                stateRef.current.score += 1;
              }
            } else {
              remainingEnemies.push(e);
            }
          }
        }
        enemiesRef.current = remainingEnemies;
        bulletsRef.current = bulletsRef.current.filter(b => b.y > -10);
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);

        // Sync to React state at 10Hz (not every frame)
        if (Math.floor(now / 100) !== Math.floor((now - dtMs) / 100)) {
          setScore(stateRef.current.score);
          setLives(stateRef.current.lives);
          setTimeLeft(remaining);
        }
      }

      // ── Draw ──
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      // Lane separators
      ctx.strokeStyle = '#1F1F21';
      ctx.lineWidth = 1;
      for (let i = 1; i < LANES; i++) {
        const y = 20 + i * LANE_H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      // Top HUD bar
      ctx.fillStyle = '#0F0F10';
      ctx.fillRect(0, 0, W, 20);

      // HUD text
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#DCFE52';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const tRem = stateRef.current.t.toFixed(1);
      ctx.fillText(`SCORE ${String(stateRef.current.score).padStart(4, '0')}`, 10, 10);
      ctx.fillStyle = '#9494C9';
      ctx.fillText(`TIME  ${tRem}s`, W / 2 - 40, 10);
      ctx.fillStyle = '#FF5F56';
      const hearts = '◼'.repeat(stateRef.current.lives) + '◻'.repeat(MAX_LIVES - stateRef.current.lives);
      ctx.fillText(`LIVES ${hearts}`, W - 130, 10);

      // Enemies
      for (const e of enemiesRef.current) {
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (e.real) {
          ctx.fillStyle = '#27C93F';
          ctx.fillText('✓ REAL', e.x, e.y);
        } else {
          ctx.fillStyle = '#FF5F56';
          const glyph = e.kind === 'disposable' ? '✉ DISP' : e.kind === 'tor' ? '◉ TOR' : e.kind === 'vpn' ? '⛔ VPN' : '✗ ROLE';
          ctx.fillText(glyph, e.x, e.y);
        }
      }

      // Bullets
      ctx.fillStyle = '#DCFE52';
      for (const b of bulletsRef.current) {
        ctx.fillRect(b.x - 1, b.y - 4, 2, 8);
      }

      // Particles
      for (const p of particlesRef.current) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
      }

      // Player ship
      ctx.font = '18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#DCFE52';
      ctx.fillText('▣', playerXRef.current, PLAYER_Y);
      // A subtle "shield" arc
      ctx.strokeStyle = 'rgba(220, 254, 82, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(playerXRef.current, PLAYER_Y, 14, Math.PI, 2 * Math.PI);
      ctx.stroke();

      // Start / Game Over overlay
      if (!stateRef.current.running) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillStyle = '#DCFE52';
        ctx.textAlign = 'center';
        if (stateRef.current.over) {
          ctx.fillText('GAME OVER', W / 2, H / 2 - 30);
          ctx.font = '14px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FEFEFE';
          ctx.fillText(`SCORE: ${stateRef.current.score}`, W / 2, H / 2);
          ctx.fillStyle = '#9494C9';
          ctx.fillText(`HIGH SCORE: ${highScore}`, W / 2, H / 2 + 22);
          ctx.fillStyle = '#DCFE52';
          ctx.fillText('PRESS SPACE TO PLAY AGAIN', W / 2, H / 2 + 56);
        } else {
          ctx.fillText('CATCH-THE-FAKES', W / 2, H / 2 - 30);
          ctx.font = '12px "JetBrains Mono", monospace';
          ctx.fillStyle = '#9494C9';
          ctx.fillText('←/→ OR A/D TO MOVE · SPACE TO SHOOT', W / 2, H / 2 - 4);
          ctx.fillStyle = '#FEFEFE';
          ctx.fillText('SHOOT THE FAKES · LET THE REAL ONES THROUGH', W / 2, H / 2 + 16);
          ctx.fillStyle = '#DCFE52';
          ctx.fillText('PRESS SPACE TO START', W / 2, H / 2 + 50);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, stop, highScore]);

  return (
    <div className="catch-game">
      <div className="catch-meta">
        <span className="catch-title">$ ./play --game=catch-the-fakes</span>
        <span className="catch-hint">CLICK THE CANVAS, THEN USE ARROW KEYS + SPACE</span>
        <span className="catch-hs">HIGH SCORE: {highScore}</span>
      </div>
      <div className="catch-frame">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={shoot}
          tabIndex={0}
          aria-label="Catch the fakes mini-game"
        />
      </div>
    </div>
  );
}
