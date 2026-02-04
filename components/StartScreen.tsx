
import React from 'react';
import { HighScore, Theme } from '../types';

interface StartScreenProps {
  onStart: () => void;
  highScores: HighScore[];
  theme: Theme;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScores, theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-6 overflow-y-auto transition-colors duration-500 ${isDark ? 'bg-[#121212]' : 'bg-[#f0f2f5]'}`}>
      <div className="mb-8 relative">
        <i className={`fas fa-industry text-6xl mb-2 opacity-50 ${isDark ? 'text-yellow-600' : 'text-yellow-500'}`}></i>
        <h1 className={`text-4xl sm:text-6xl font-black tracking-tighter uppercase relative z-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          מפעל הרימונים <span className={isDark ? 'text-yellow-500' : 'text-yellow-600'}>TYCOON</span>
        </h1>
        <div className={`absolute -inset-4 blur-xl rounded-full ${isDark ? 'bg-yellow-600/10' : 'bg-yellow-500/5'}`}></div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start max-w-4xl w-full">
        <div className={`flex-1 p-6 sm:p-8 rounded-2xl border shadow-2xl w-full transition-colors duration-500 ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>הוראות משחק</h3>
          <ul className={`text-right space-y-2 mb-8 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <li className="flex items-center gap-3">
              <i className={`fas fa-keyboard ${isDark ? 'text-yellow-600' : 'text-yellow-500'}`}></i>
              <span>חיצים / A+D במקלדת, או חיצי מגע בנייד.</span>
            </li>
            <li className="flex items-center gap-3">
              <i className={`fas fa-box ${isDark ? 'text-yellow-600' : 'text-yellow-500'}`}></i>
              <span>אסוף 4 רימונים למילוי קופסה ובונוס נקודות.</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="fas fa-star text-pink-500"></i>
              <span>אסוף בונוסים: חיים, זמן, או האטה (Snowflake).</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="fas fa-exclamation-triangle text-red-600"></i>
              <span>אל תפיל רימונים! כל נפילה מורידה חיים.</span>
            </li>
          </ul>
          
          <button 
            onClick={onStart}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-xl sm:text-2xl font-black py-4 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(202,138,4,0.3)]"
          >
            התחל משמרת
          </button>
        </div>

        {highScores.length > 0 && (
          <div className={`w-full md:w-64 p-6 rounded-2xl border shadow-xl transition-colors duration-500 ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center justify-center gap-2 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
              <i className="fas fa-trophy"></i>
              שיאי המפעל
            </h3>
            <div className="space-y-3">
              {highScores.map((hs, i) => (
                <div key={i} className={`flex justify-between items-center text-sm border-b pb-2 last:border-0 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-mono w-4">{i + 1}.</span>
                    <span className={`font-bold truncate max-w-[80px] ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{hs.name}</span>
                  </div>
                  <span className={`font-mono font-bold ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>{hs.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <p className={`mt-8 text-xs sm:text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Esc / Space לעצירה | המפעל פתוח 24/7</p>
    </div>
  );
};

export default StartScreen;
