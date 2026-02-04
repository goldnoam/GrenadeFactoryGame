
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GrenadeType, PowerupType, GameStatus, Theme, GrenadeInstance, PowerupInstance, Particle, BOX_CAPACITY, UpgradesState, HighScore } from './types';
import GameBoard from './components/GameBoard';
import HUD from './components/HUD';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import ExplosionOverlay from './components/ExplosionOverlay';
import UpgradeShop from './components/UpgradeShop';

const INITIAL_LIVES = 5;
const MAX_LIVES = 10;
const INITIAL_LINES = 3;
const GAME_DURATION = 180;
const STORAGE_KEY = 'grenade_factory_high_scores';
const THEME_KEY = 'grenade_factory_theme';

// Native TTS Helper
export const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  }
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('START');
  const [theme, setTheme] = useState<Theme>('dark');
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [score, setScore] = useState(0);
  const [boxCount, setBoxCount] = useState(0);
  const [currentLines, setCurrentLines] = useState(INITIAL_LINES);
  const [grenades, setGrenades] = useState<GrenadeInstance[]>([]);
  const [powerups, setPowerups] = useState<PowerupInstance[]>([]);
  const [playerPosition, setPlayerPosition] = useState(1);
  const [activeExplosions, setActiveExplosions] = useState<Particle[]>([]);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isSlowed, setIsSlowed] = useState(false);
  const [isStunned, setIsStunned] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Upgrade State
  const [upgrades, setUpgrades] = useState<UpgradesState>({
    catcherWidth: 1,
    spawnRate: 1,
    unlockAdvanced: false,
    scoreMultiplier: 1
  });

  const gameLoopRef = useRef<number>(null);
  const lastSpawnTime = useRef<number>(0);
  const lastPowerupSpawnTime = useRef<number>(0);
  const speedMultiplier = useRef<number>(1);
  const slowEffectTimeoutRef = useRef<number>(null);
  const stunTimeoutRef = useRef<number>(null);

  useEffect(() => {
    const savedScores = localStorage.getItem(STORAGE_KEY);
    if (savedScores) {
      try { setHighScores(JSON.parse(savedScores)); } catch (e) { console.error(e); }
    }
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const saveHighScore = (name: string, finalScore: number) => {
    const newScores = [...highScores, { name, score: finalScore }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setHighScores(newScores);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newScores));
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    speak(nextTheme === 'dark' ? 'מצב לילה' : 'מצב יום');
  };

  const startGame = () => {
    speak('המשמרת מתחילה');
    setLives(INITIAL_LIVES);
    setScore(0);
    setBoxCount(0);
    setCurrentLines(INITIAL_LINES);
    setGrenades([]);
    setPowerups([]);
    setPlayerPosition(1);
    setActiveExplosions([]);
    setLevel(1);
    setTimeLeft(GAME_DURATION);
    setIsSlowed(false);
    setIsStunned(false);
    speedMultiplier.current = 1;
    setStatus('PLAYING');
  };

  const resetGame = () => {
    speak('מאתחל משחק');
    startGame();
    setShowShop(false);
  };

  const handleExplosion = (type: GrenadeType, x: number, y: number) => {
    const newExplosion: Particle = {
      id: Math.random().toString(),
      type,
      x,
      y
    };
    setActiveExplosions(prev => [...prev, newExplosion]);
    setLives(prev => Math.max(0, prev - 1));
    
    if (type === GrenadeType.STUN) {
      setIsStunned(true);
      if (stunTimeoutRef.current) clearTimeout(stunTimeoutRef.current);
      stunTimeoutRef.current = window.setTimeout(() => setIsStunned(false), 1500);
    }

    setTimeout(() => {
      setActiveExplosions(prev => prev.filter(e => e.id !== newExplosion.id));
    }, 5000);
  };

  const applyPowerup = (type: PowerupType) => {
    speak('בונוס נאסף');
    switch (type) {
      case PowerupType.LIFE:
        setLives(prev => Math.min(MAX_LIVES, prev + 1));
        break;
      case PowerupType.TIME:
        setTimeLeft(prev => prev + 30);
        break;
      case PowerupType.SLOW:
        setIsSlowed(true);
        if (slowEffectTimeoutRef.current) clearTimeout(slowEffectTimeoutRef.current);
        slowEffectTimeoutRef.current = window.setTimeout(() => {
          setIsSlowed(false);
        }, 8000);
        break;
    }
  };

  const getWeightedType = useCallback((lvl: number, unlocked: boolean): GrenadeType => {
    const weights: Record<GrenadeType, number> = {
      [GrenadeType.FRAG]: 40,
      [GrenadeType.SMOKE]: 40,
      [GrenadeType.STUN]: 20,
      [GrenadeType.STICKY]: 0,
      [GrenadeType.INCENDIARY]: 0,
    };
    if (unlocked || lvl >= 2) weights[GrenadeType.STICKY] = unlocked ? 20 : 15;
    if (unlocked || lvl >= 3) weights[GrenadeType.INCENDIARY] = unlocked ? 25 : 20;

    const entries = Object.entries(weights) as [GrenadeType, number][];
    const totalWeight = entries.reduce((acc, [_, w]) => acc + w, 0);
    let random = Math.random() * totalWeight;
    for (const [type, weight] of entries) {
      if (random < weight) return type;
      random -= weight;
    }
    return GrenadeType.FRAG;
  }, []);

  const updateGame = useCallback(() => {
    if (status !== 'PLAYING') return;

    if (score > 100 && level === 1) {
      setLevel(2); setCurrentLines(4); speedMultiplier.current = 1.2;
    } else if (score > 250 && level === 2) {
      setLevel(3); setCurrentLines(5); speedMultiplier.current = 1.4;
    } else if (score > 500 && level === 3) {
      setLevel(4); setCurrentLines(6); speedMultiplier.current = 1.7;
    }

    const currentMultiplier = isSlowed ? speedMultiplier.current * 0.5 : speedMultiplier.current;

    setGrenades(prev => {
      const nextGrenades: GrenadeInstance[] = [];
      const fallSpeed = 0.5 * currentMultiplier;
      for (const g of prev) {
        const nextY = g.y + fallSpeed;
        if (nextY >= 88 && nextY <= 95 && g.lineIndex === playerPosition) {
          setBoxCount(bc => {
            const nextBc = bc + 1;
            const pts = (nextBc === BOX_CAPACITY ? 20 : 5) * upgrades.scoreMultiplier;
            setScore(s => s + Math.floor(pts));
            if (nextBc === BOX_CAPACITY) speak('קופסה מלאה');
            return nextBc === BOX_CAPACITY ? 0 : nextBc;
          });
          continue; 
        }
        if (nextY > 100) {
          handleExplosion(g.type, (g.lineIndex / (currentLines - 1)) * 100, 100);
          continue;
        }
        nextGrenades.push({ ...g, y: nextY });
      }
      return nextGrenades;
    });

    setPowerups(prev => {
      const nextPowerups: PowerupInstance[] = [];
      const fallSpeed = 0.3 * currentMultiplier;
      for (const p of prev) {
        const nextY = p.y + fallSpeed;
        if (nextY >= 88 && nextY <= 95 && p.lineIndex === playerPosition) {
          applyPowerup(p.type);
          setScore(s => s + 10);
          continue;
        }
        if (nextY > 100) continue;
        nextPowerups.push({ ...p, y: nextY });
      }
      return nextPowerups;
    });

    const now = Date.now();
    const spawnInterval = Math.max(700, 2000 - (level * 300)) / upgrades.spawnRate;
    const effectiveSpawnInterval = isSlowed ? spawnInterval * 1.5 : spawnInterval;

    if (now - lastSpawnTime.current > effectiveSpawnInterval) {
      const randomLine = Math.floor(Math.random() * currentLines);
      const randomType = getWeightedType(level, upgrades.unlockAdvanced);
      setGrenades(prev => [...prev, {
        id: Math.random().toString(),
        type: randomType,
        lineIndex: randomLine,
        y: 0
      }]);
      lastSpawnTime.current = now;
    }

    if (now - lastPowerupSpawnTime.current > 15000 + (Math.random() * 10000)) {
      const randomLine = Math.floor(Math.random() * currentLines);
      const types = [PowerupType.LIFE, PowerupType.TIME, PowerupType.SLOW];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setPowerups(prev => [...prev, {
        id: Math.random().toString(),
        type: randomType,
        lineIndex: randomLine,
        y: 0
      }]);
      lastPowerupSpawnTime.current = now;
    }

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [status, playerPosition, currentLines, level, score, getWeightedType, isSlowed, upgrades]);

  useEffect(() => {
    if (status === 'PLAYING') {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [status, updateGame]);

  useEffect(() => {
    let timerId: number;
    if (status === 'PLAYING' && timeLeft > 0) {
      timerId = window.setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    }
    return () => clearInterval(timerId);
  }, [status, timeLeft]);

  useEffect(() => {
    if (lives <= 0 || timeLeft === 0) {
      setStatus('GAMEOVER');
      speak('המשמרת נגמרה');
    }
  }, [lives, timeLeft]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (status !== 'PLAYING' || isStunned) return;
    // WASD and Arrows support
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setPlayerPosition(p => Math.min(currentLines - 1, p + 1));
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setPlayerPosition(p => Math.max(0, p - 1));
    else if (e.key === 'Escape' || e.key === ' ') {
      setStatus('PAUSED');
      speak('הפסקה');
    }
  }, [status, currentLines, isStunned]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const purchaseUpgrade = (type: keyof UpgradesState, cost: number) => {
    if (score >= cost) {
      speak('שדרוג נרכש');
      setScore(s => s - cost);
      setUpgrades(prev => {
        if (type === 'catcherWidth') return { ...prev, catcherWidth: prev.catcherWidth + 0.1 };
        if (type === 'spawnRate') return { ...prev, spawnRate: prev.spawnRate + 0.2 };
        if (type === 'unlockAdvanced') return { ...prev, unlockAdvanced: true };
        if (type === 'scoreMultiplier') return { ...prev, scoreMultiplier: prev.scoreMultiplier + 0.5 };
        return prev;
      });
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col font-sans select-none transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212]' : 'bg-[#f0f2f5]'}`}>
      <HUD 
        lives={lives} score={score} boxCount={boxCount} level={level} 
        timeLeft={timeLeft} isSlowed={isSlowed} isStunned={isStunned} 
        theme={theme} onPause={() => { setStatus('PAUSED'); speak('הפסקה'); }} 
      />
      
      <GameBoard 
        grenades={grenades} powerups={powerups} linesCount={currentLines} 
        playerPosition={playerPosition} catcherWidthMult={upgrades.catcherWidth}
        isStunned={isStunned} activeExplosions={activeExplosions} theme={theme}
      />

      {status === 'PLAYING' && (
        <div className="absolute inset-x-0 bottom-16 px-6 pointer-events-none z-40 flex justify-between sm:hidden" dir="ltr">
          <button 
            onPointerDown={(e) => { e.stopPropagation(); setPlayerPosition(p => Math.max(0, p - 1)); }}
            className={`pointer-events-auto w-20 h-20 backdrop-blur-md rounded-full flex items-center justify-center border-2 shadow-2xl transition-all active:scale-90 ${isStunned ? 'opacity-50' : ''} ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}`}
          >
            <i className={`fas fa-chevron-left text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}></i>
          </button>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); setPlayerPosition(p => Math.min(currentLines - 1, p + 1)); }}
            className={`pointer-events-auto w-20 h-20 backdrop-blur-md rounded-full flex items-center justify-center border-2 shadow-2xl transition-all active:scale-90 ${isStunned ? 'opacity-50' : ''} ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}`}
          >
            <i className={`fas fa-chevron-right text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}></i>
          </button>
        </div>
      )}

      <ExplosionOverlay explosions={activeExplosions} />

      {status === 'START' && <StartScreen onStart={startGame} highScores={highScores} theme={theme} />}
      
      {status === 'PAUSED' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          {!showShop ? (
            <div className={`p-8 rounded-xl border-2 text-center shadow-2xl min-w-[320px] ${theme === 'dark' ? 'bg-[#1e1e1e] border-yellow-600' : 'bg-white border-yellow-500'}`}>
              <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>המשחק מושהה</h2>
              <div className="flex flex-col gap-4">
                <button onClick={() => { setStatus('PLAYING'); speak('חוזרים לעבודה'); }} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg transition-all">המשך משחק</button>
                <button onClick={() => { setShowShop(true); speak('חנות שדרוגים'); }} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg transition-all"><i className="fas fa-shopping-cart ml-2"></i>שדרוגי מפעל</button>
                <button onClick={toggleTheme} className={`font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-3 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                  {theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
                </button>
                <button onClick={resetGame} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all">אתחל (Reset)</button>
              </div>
            </div>
          ) : (
            <UpgradeShop score={score} upgrades={upgrades} onPurchase={purchaseUpgrade} onClose={() => { setShowShop(false); speak('סגירת חנות'); }} theme={theme} />
          )}
        </div>
      )}
      
      {status === 'GAMEOVER' && <GameOverScreen score={score} highScores={highScores} onRestart={startGame} onSaveScore={saveHighScore} theme={theme} />}

      <footer className={`absolute bottom-0 w-full p-2 text-[10px] sm:text-xs text-center border-t transition-colors z-50 ${theme === 'dark' ? 'bg-black/50 text-gray-500 border-gray-800' : 'bg-white/80 text-gray-400 border-gray-200'}`}>
        <div className="flex justify-center gap-4">
          <span>(C) Noam Gold AI 2026</span>
          <a href="mailto:goldnoamai@gmail.com" onClick={() => speak('שליחת משוב')} className="hover:text-yellow-500 transition-colors">Send Feedback: goldnoamai@gmail.com</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
