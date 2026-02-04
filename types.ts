
export enum GrenadeType {
  FRAG = 'FRAG',       // רסס
  STUN = 'STUN',       // הלם
  SMOKE = 'SMOKE',     // עשן
  STICKY = 'STICKY',   // דביק
  INCENDIARY = 'INCENDIARY' // תבערה
}

export enum PowerupType {
  LIFE = 'LIFE',       // חיים נוספים
  TIME = 'TIME',       // תוספת זמן
  SLOW = 'SLOW'        // האטה
}

export type GameStatus = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
export type Theme = 'dark' | 'light';

export interface GrenadeInstance {
  id: string;
  type: GrenadeType;
  lineIndex: number;
  y: number; // 0 to 100 percentage
}

export interface PowerupInstance {
  id: string;
  type: PowerupType;
  lineIndex: number;
  y: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  type: GrenadeType;
}

export const GRENADE_COLORS = {
  [GrenadeType.FRAG]: 'bg-green-800',
  [GrenadeType.STUN]: 'bg-blue-400',
  [GrenadeType.SMOKE]: 'bg-gray-400',
  [GrenadeType.STICKY]: 'bg-purple-600',
  [GrenadeType.INCENDIARY]: 'bg-orange-500'
};

export const POWERUP_COLORS = {
  [PowerupType.LIFE]: 'bg-pink-600',
  [PowerupType.TIME]: 'bg-sky-500',
  [PowerupType.SLOW]: 'bg-teal-400'
};

export const BOX_CAPACITY = 4;

export interface UpgradesState {
  catcherWidth: number;
  spawnRate: number;
  unlockAdvanced: boolean;
  scoreMultiplier: number;
}

export interface HighScore {
  name: string;
  score: number;
}
