
import React, { useState } from 'react';
import { HighScore, Theme } from '../types';

interface GameOverScreenProps {
  score: number;
  highScores: HighScore[];
  onRestart: () => void;
  onSaveScore: (name: string, score: number) => void;
  theme: Theme;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScores, onRestart, onSaveScore, theme }) => {
  const [name, setName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const isDark = theme === 'dark';
  
  const isEligible = score > 0 && (highScores.length < 5 || score > highScores[highScores.length - 1].score);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSaved) {
      onSaveScore(name.trim(), score);
      setIsSaved(true);
    }
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
      <div className={`max-w-sm w-full p-8 sm:p-10 rounded-3xl border-2 shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center transition-colors duration-500 ${isDark ? 'bg-[#1e1e1e] border-red-600/50' : 'bg-white border-red-500/50'}`}>
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <i className="fas fa-skull text-3xl text-white"></i>
        </div>
        
        <h2 className={`text-3xl sm:text-4xl font-black mb-2 uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>המשמרת הסתיימה</h2>
        <p className={`mb-6 font-medium text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>המפעל הושבת עקב תאונות עבודה רבות</p>
        
        <div className={`rounded-xl p-4 sm:p-6 mb-6 border ${isDark ? 'bg-black/40 border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
          <span className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1">ניקוד סופי</span>
          <span className={`text-4xl sm:text-5xl font-mono font-black ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>{score}</span>
        </div>

        {isEligible && !isSaved ? (
          <div className={`mb-8 p-4 border rounded-xl ${isDark ? 'bg-yellow-600/10 border-yellow-600/30' : 'bg-yellow-100 border-yellow-300'}`}>
            <h3 className={`font-bold mb-3 text-sm flex items-center justify-center gap-2 ${isDark ? 'text-yellow-500' : 'text-yellow-700'}`}>
              <i className="fas fa-medal"></i>
              שברת שיא מפעל! הזן שם:
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input 
                type="text" 
                maxLength={10}
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`px-4 py-2 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-black/50 border border-gray-700 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                placeholder="השם שלך"
              />
              <button 
                type="submit"
                disabled={!name.trim()}
                className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-all"
              >
                שמור שיא
              </button>
            </form>
          </div>
        ) : isSaved ? (
          <div className="mb-8 text-green-500 font-bold flex items-center justify-center gap-2 animate-bounce">
            <i className="fas fa-check-circle"></i>
            השיא נשמר בהצלחה!
          </div>
        ) : null}
        
        <button 
          onClick={onRestart}
          className={`w-full text-lg sm:text-xl font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 ${isDark ? 'bg-white hover:bg-gray-200 text-black' : 'bg-gray-900 hover:bg-black text-white'}`}
        >
          נסה שוב
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
