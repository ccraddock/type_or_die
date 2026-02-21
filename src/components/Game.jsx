import { useState, useEffect, useRef, useCallback } from 'react';
import Zombie from './Zombie';
import HUD from './HUD';
import StartScreen from './StartScreen';
import GameOver from './GameOver';
import { getWordForWave } from '../data/words';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 550;
const ZOMBIE_WIDTH = 80;
const ZOMBIE_HEIGHT = 110; // word label (~30px) + figure (~60px) + padding
const BASE_SPEED = 28; // px per second
const BASE_SPAWN_INTERVAL = 3000; // ms
const WAVE_DURATION = 30000; // ms per wave
// y at which a zombie collides with the player (player occupies bottom 90px)
const COLLISION_Y = GAME_HEIGHT - 90;

export default function Game() {
  const [screen, setScreen] = useState('start');
  const [zombies, setZombies] = useState([]);
  const [dyingZombies, setDyingZombies] = useState([]);
  const [typedText, setTypedText] = useState('');
  const [targetId, setTargetId] = useState(null);
  const [wave, setWave] = useState(1);
  const [stats, setStats] = useState({ wpm: 0, errors: 0, kills: 0 });
  const [flashError, setFlashError] = useState(false);

  // All mutable game state lives in a ref so animation-frame callbacks
  // always read the latest values without stale-closure issues.
  const gRef = useRef(null);
  const animFrameRef = useRef(null);
  const flashTimerRef = useRef(null);

  /** Remove a zombie from the game, update stats, and queue the death animation. */
  const killZombie = useCallback((g, zombie) => {
    g.zombies = g.zombies.filter((z) => z.id !== zombie.id);
    g.kills++;
    g.totalChars += zombie.word.length;
    g.typedText = '';
    g.targetId = null;
    setTypedText('');
    setTargetId(null);

    // Death animation: keep a copy in dyingZombies for 500 ms
    const deadCopy = { ...zombie };
    setDyingZombies((prev) => [...prev, deadCopy]);
    setTimeout(() => {
      setDyingZombies((prev) => prev.filter((z) => z.id !== deadCopy.id));
    }, 500);
  }, []);

  const startGame = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    gRef.current = {
      zombies: [],
      nextId: 0,
      lastSpawnTime: null,
      startTime: null,
      wave: 1,
      errors: 0,
      kills: 0,
      totalChars: 0,
      typedText: '',
      targetId: null,
    };
    setZombies([]);
    setDyingZombies([]);
    setTypedText('');
    setTargetId(null);
    setWave(1);
    setStats({ wpm: 0, errors: 0, kills: 0, totalChars: 0 });
    setFlashError(false);
    setScreen('playing');
  }, []);

  // ─── Keyboard input ────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'playing') return;

    const triggerError = () => {
      const g = gRef.current;
      if (!g) return;
      g.errors++;
      setFlashError(true);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlashError(false), 300);
    };

    const handleKeyDown = (e) => {
      const g = gRef.current;
      if (!g) return;

      if (e.key === 'Escape') {
        g.typedText = '';
        g.targetId = null;
        setTypedText('');
        setTargetId(null);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (g.typedText.length > 0) {
          g.typedText = g.typedText.slice(0, -1);
          if (!g.typedText) {
            g.targetId = null;
            setTargetId(null);
          }
          setTypedText(g.typedText);
        }
        return;
      }

      if (!/^[a-zA-Z]$/.test(e.key)) return;
      e.preventDefault();

      const char = e.key.toLowerCase();
      const newTyped = g.typedText + char;

      // ── Already locked onto a target ──
      if (g.targetId !== null) {
        const target = g.zombies.find((z) => z.id === g.targetId);

        if (!target) {
          // Target disappeared; reset and treat this key as a fresh start
          g.typedText = '';
          g.targetId = null;
          setTypedText('');
          setTargetId(null);
          return;
        }

        if (target.word.startsWith(newTyped)) {
          g.typedText = newTyped;
          setTypedText(newTyped);

          if (target.word === newTyped) {
            killZombie(g, target);
          }
        } else {
          // Wrong letter for this target
          triggerError();
        }
        return;
      }

      // ── No current target — find best matching zombie ──
      // Prefer the zombie whose word starts with newTyped AND is closest to the player (highest y).
      const candidates = g.zombies.filter((z) => z.word.startsWith(newTyped));
      if (candidates.length > 0) {
        const target = candidates.reduce((best, z) => (z.y > best.y ? z : best));
        g.typedText = newTyped;
        g.targetId = target.id;
        setTypedText(newTyped);
        setTargetId(target.id);

        if (target.word === newTyped) {
          killZombie(g, target);
        }
      } else {
        triggerError();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [screen, killZombie]);

  // ─── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'playing') return;

    let lastTime = null;

    const spawnZombie = (timestamp) => {
      const g = gRef.current;
      const speed = BASE_SPEED + (g.wave - 1) * 7;
      // Random x, keep some margin so the zombie stays fully inside
      const x = Math.floor(Math.random() * (GAME_WIDTH - ZOMBIE_WIDTH - 20)) + 10;

      // Avoid duplicate words on screen
      const usedWords = new Set(g.zombies.map((z) => z.word));
      let word = getWordForWave(g.wave);
      for (let i = 0; i < 10 && usedWords.has(word); i++) {
        word = getWordForWave(g.wave);
      }

      g.zombies.push({ id: g.nextId++, word, x, y: -ZOMBIE_HEIGHT, speed });
      g.lastSpawnTime = timestamp;
    };

    const loop = (timestamp) => {
      const g = gRef.current;
      if (!g) return;

      // First frame init
      if (lastTime === null) {
        lastTime = timestamp;
        g.startTime = timestamp;
        g.lastSpawnTime = timestamp;
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const delta = Math.min(timestamp - lastTime, 100); // cap to avoid huge jumps
      lastTime = timestamp;

      const elapsed = timestamp - g.startTime;

      // ── Wave progression ──
      const newWave = Math.floor(elapsed / WAVE_DURATION) + 1;
      if (newWave !== g.wave) {
        g.wave = newWave;
        setWave(newWave);
      }

      // ── Spawn ──
      const spawnInterval = Math.max(500, BASE_SPAWN_INTERVAL - (g.wave - 1) * 200);
      const maxZombies = Math.min(2 + g.wave, 8);
      if (g.zombies.length < maxZombies && timestamp - g.lastSpawnTime > spawnInterval) {
        spawnZombie(timestamp);
      }

      // ── Move ──
      g.zombies = g.zombies.map((z) => ({ ...z, y: z.y + z.speed * (delta / 1000) }));

      // ── Collision detection ──
      if (g.zombies.some((z) => z.y + ZOMBIE_HEIGHT >= COLLISION_Y)) {
        setScreen('gameover');
        return;
      }

      // ── WPM ──
      const mins = elapsed / 60000;
      const wpm = mins > 0.05 ? Math.round(g.totalChars / 5 / mins) : 0;

      // Sync render state
      setZombies([...g.zombies]);
      setStats({ wpm, errors: g.errors, kills: g.kills, totalChars: g.totalChars });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [screen]);

  // ─── Render ────────────────────────────────────────────────────────────────
  if (screen === 'start') return <StartScreen onStart={startGame} />;
  if (screen === 'gameover') return <GameOver stats={stats} wave={wave} onRestart={startGame} />;

  return (
    <div className="game-container">
      <HUD wave={wave} stats={stats} typedText={typedText} />
      <div className={`game-area${flashError ? ' flash-error' : ''}`}>
        {/* Active zombies */}
        {zombies.map((z) => (
          <Zombie
            key={z.id}
            zombie={z}
            targeted={z.id === targetId}
            typedText={z.id === targetId ? typedText : ''}
          />
        ))}

        {/* Dying zombies (death animation) */}
        {dyingZombies.map((z) => (
          <Zombie key={`dead-${z.id}`} zombie={z} targeted={false} typedText="" dying />
        ))}

        {/* Player */}
        <div className="player">
          <div className="player-figure">🧑</div>
          <div className="player-label">YOU</div>
        </div>

        {/* Danger-zone line */}
        <div className="danger-zone" />
      </div>
    </div>
  );
}
