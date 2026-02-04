
import React from 'react';
import { GrenadeInstance, PowerupInstance, Particle, GrenadeType, PowerupType, GRENADE_COLORS, POWERUP_COLORS, Theme } from '../types';

interface GameBoardProps {
  grenades: GrenadeInstance[];
  powerups: PowerupInstance[];
  linesCount: number;
  playerPosition: number;
  catcherWidthMult: number;
  isStunned: boolean;
  activeExplosions: Particle[];
  theme: Theme;
}

const GameBoard: React.FC<GameBoardProps> = ({ grenades, powerups, linesCount, playerPosition, catcherWidthMult, isStunned, activeExplosions, theme }) => {
  const hasSmoke = activeExplosions.some(e => e.type === GrenadeType.SMOKE);
  const isDark = theme === 'dark';

  return (
    <div className={`flex-1 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gradient-to-b from-[#151515] to-[#252525]' : 'bg-gradient-to-b from-[#e5e7eb] to-[#f9fafb]'}`}>
      {/* Production Lines */}
      <div className="absolute inset-0 flex justify-around">
        {[...Array(linesCount)].map((_, i) => (
          <div 
            key={i} 
            className={`h-full w-16 relative border-x transition-colors duration-500 ${isDark ? 'bg-[#1c1c1c] border-gray-800' : 'bg-[#d1d5db] border-gray-300'}`}
          >
            <div className={`absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]`}></div>
            <div className={`absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 border-x transition-colors duration-500 ${isDark ? 'bg-black/40 border-gray-800' : 'bg-white/40 border-gray-200'}`}></div>
          </div>
        ))}
      </div>

      {/* Grenades */}
      {grenades.map(g => (
        <div 
          key={g.id}
          className={`absolute w-12 h-16 rounded-full transition-transform z-20 flex flex-col items-center justify-center ${GRENADE_COLORS[g.type]} border-2 border-black shadow-lg`}
          style={{
            left: `${(g.lineIndex / linesCount) * 100 + (100 / (linesCount * 2))}%`,
            top: `${g.y}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="w-4 h-3 bg-gray-400 absolute -top-2 rounded-t-sm border border-black/30"></div>
          <div className="w-6 h-1 bg-gray-500 absolute -top-2 -right-1 rotate-12"></div>
          <i className={`fas ${
            g.type === GrenadeType.FRAG ? 'fa-bomb' : 
            g.type === GrenadeType.STUN ? 'fa-bolt' : 
            g.type === GrenadeType.SMOKE ? 'fa-smog' :
            g.type === GrenadeType.STICKY ? 'fa-spider' : 'fa-fire'
          } text-white/50 text-xl`}></i>
        </div>
      ))}

      {/* Powerups */}
      {powerups.map(p => (
        <div 
          key={p.id}
          className={`absolute w-14 h-14 rounded-xl z-25 flex items-center justify-center ${POWERUP_COLORS[p.type]} border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)] powerup-float`}
          style={{
            left: `${(p.lineIndex / linesCount) * 100 + (100 / (linesCount * 2))}%`,
            top: `${p.y}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="absolute inset-0 border-2 border-white/30 rounded-xl powerup-ring"></div>
          <i className={`fas ${
            p.type === PowerupType.LIFE ? 'fa-heart' : 
            p.type === PowerupType.TIME ? 'fa-hourglass-half' : 'fa-snowflake'
          } text-white text-2xl drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]`}></i>
        </div>
      ))}

      {/* Player (Worker/Catcher) */}
      <div 
        className={`absolute bottom-[5%] h-16 z-30 transition-all duration-75 ${isStunned ? 'opacity-80 scale-95' : ''}`}
        style={{
          left: `${(playerPosition / linesCount) * 100 + (100 / (linesCount * 2))}%`,
          width: `${24 * catcherWidthMult}rem`, 
          maxWidth: '40%',
          transform: 'translateX(-50%)',
        }}
      >
        <div className={`w-full h-full border-b-4 transition-colors duration-500 rounded-lg shadow-xl relative overflow-hidden flex flex-col items-center pt-2 ${isStunned ? 'border-blue-500 animate-pulse bg-blue-100/20' : (isDark ? 'border-yellow-600 bg-[#3a3a3a]' : 'border-yellow-500 bg-white')}`}>
            {isStunned && (
              <div className="absolute inset-0 flex items-center justify-center z-40">
                <i className="fas fa-bolt text-blue-400 text-3xl animate-bounce"></i>
              </div>
            )}
            <div className={`absolute top-0 w-full h-1 ${isDark ? 'bg-yellow-500/30' : 'bg-yellow-400/20'}`}></div>
            <div className={`w-20 h-8 rounded-t-md border-x border-t mt-auto flex items-center justify-center transition-colors duration-500 ${isDark ? 'bg-orange-900/50 border-orange-700' : 'bg-orange-100 border-orange-300'}`}>
                <i className={`fas fa-box-open ${isDark ? 'text-orange-400' : 'text-orange-500'}`}></i>
            </div>
            <div className={`absolute -left-4 top-2 w-6 h-10 border-r rounded-l-md transform -rotate-12 transition-colors duration-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-300 border-gray-400'}`}></div>
            <div className={`absolute -right-4 top-2 w-6 h-10 border-l rounded-r-md transform rotate-12 transition-colors duration-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-300 border-gray-400'}`}></div>
        </div>
      </div>
      
      {/* Smoke Obscurity Overlay */}
      {hasSmoke && (
        <div className="absolute bottom-0 w-full h-[30%] bg-gray-500/20 backdrop-blur-md z-[35] pointer-events-none flex items-center justify-center">
          <span className={`text-lg font-bold opacity-30 tracking-widest ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>עשן כבד</span>
        </div>
      )}

      <div className={`absolute bottom-0 w-full h-[5%] border-t-4 transition-colors duration-500 ${isDark ? 'bg-black border-gray-800' : 'bg-gray-300 border-gray-400'}`}></div>
    </div>
  );
};

export default GameBoard;
