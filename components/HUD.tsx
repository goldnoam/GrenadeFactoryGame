
import React from 'react';
import { BOX_CAPACITY, Theme } from '../types';

interface HUDProps {
  lives: number;
  score: number;
  boxCount: number;
  level: number;
  timeLeft: number;
  isSlowed?: boolean;
  isStunned?: boolean;
  theme: Theme;
  onPause: () => void;
}

const HUD: React.FC<HUDProps> = ({ lives, score, boxCount, level, timeLeft, isSlowed, isStunned, theme, onPause }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex justify-between items-center p-2 sm:p-4 border-b shadow-lg z-30 relative transition-colors duration-500 ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex gap-4 sm:gap-6 items-center">
        <div className="flex flex-col items-center">
          <span className={`text-[10px] sm:text-xs uppercase tracking-widest mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ניקוד</span>
          <span className={`text-xl sm:text-2xl font-mono font-bold drop-shadow-sm ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>{score.toString().padStart(6, '0')}</span>
        </div>
        <div className={`flex flex-col items-center border-l pl-4 sm:pl-6 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <span className={`text-[10px] sm:text-xs uppercase tracking-widest mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>זמן</span>
          <div className="flex items-center gap-2">
            <span className={`text-xl sm:text-2xl font-mono font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : (isDark ? 'text-white' : 'text-gray-900')}`}>
              {formatTime(timeLeft)}
            </span>
            {isSlowed && <i className="fas fa-snowflake text-cyan-400 animate-pulse text-sm"></i>}
          </div>
        </div>
      </div>

      <div className={`hidden sm:flex flex-col items-center px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
        <span className={`text-xs uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>קופסה בתהליך</span>
        <div className="flex gap-1">
          {[...Array(BOX_CAPACITY)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-sm border transition-all ${i < boxCount ? 'bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-transparent border-gray-400'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4 sm:gap-6 items-center">
        {isStunned && (
          <div className="flex items-center gap-2 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-400/50 animate-pulse">
            <i className="fas fa-bolt text-blue-300 text-xs"></i>
            <span className="text-blue-200 text-xs font-bold">הלום!</span>
          </div>
        )}
        <div className="flex gap-1">
          {[...Array(10)].map((_, i) => {
            if (i >= 5 && i >= lives) return null;
            return (
              <i 
                key={i} 
                className={`fas fa-heart text-lg sm:text-xl transition-colors duration-300 ${i < lives ? 'text-red-600 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]' : (isDark ? 'text-gray-800' : 'text-gray-200')}`}
              />
            );
          })}
        </div>
        <button 
          onClick={onPause}
          className={`p-2 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-colors border ${isDark ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'}`}
        >
          <i className={`fas fa-bars text-xs sm:text-base ${isDark ? 'text-white' : 'text-gray-700'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default HUD;
