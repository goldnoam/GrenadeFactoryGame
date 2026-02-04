
import React from 'react';
import { UpgradesState, Theme } from '../types';
import { speak } from '../App';

interface UpgradeShopProps {
  score: number;
  upgrades: UpgradesState;
  onPurchase: (type: keyof UpgradesState, cost: number) => void;
  onClose: () => void;
  theme: Theme;
}

const UpgradeShop: React.FC<UpgradeShopProps> = ({ score, upgrades, onPurchase, onClose, theme }) => {
  const isDark = theme === 'dark';

  const shopItems = [
    {
      id: 'catcherWidth' as keyof UpgradesState,
      name: 'מלקטת רחבה',
      description: 'הגדלת שטח האיסוף של הקופסה ב-10%',
      cost: 150,
      icon: 'fa-arrows-alt-h',
      color: 'text-blue-400'
    },
    {
      id: 'scoreMultiplier' as keyof UpgradesState,
      name: 'לוגיסטיקה מתקדמת',
      description: 'תוספת של 50% לניקוד מכל איסוף',
      cost: 300,
      icon: 'fa-chart-line',
      color: 'text-green-400'
    },
    {
      id: 'spawnRate' as keyof UpgradesState,
      name: 'האצת ייצור',
      description: 'הגברת קצב ייצור הרימונים',
      cost: 200,
      icon: 'fa-bolt',
      color: 'text-yellow-400'
    },
    {
      id: 'unlockAdvanced' as keyof UpgradesState,
      name: 'מחלקת פיתוח',
      description: 'פתיחת רימונים מתקדמים',
      cost: 500,
      icon: 'fa-flask',
      color: 'text-purple-400',
      oneTime: true
    }
  ];

  return (
    <div className={`p-6 rounded-2xl border-2 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transition-colors duration-500 ${isDark ? 'bg-[#1e1e1e] border-purple-600' : 'bg-white border-purple-500'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>שדרוגי מפעל</h2>
        <div className={`px-4 py-1 rounded-full border ${isDark ? 'bg-black/40 border-yellow-600/50' : 'bg-yellow-50 border-yellow-400'}`}>
          <span className={`font-mono text-xl ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>{score}</span>
          <i className={`fas fa-coins mr-2 text-sm ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}></i>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {shopItems.map((item) => {
          const isPurchased = item.oneTime && upgrades[item.id] === true;
          const canAfford = score >= item.cost;
          return (
            <div 
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between ${canAfford && !isPurchased ? (isDark ? 'bg-black/30 border-gray-700 hover:border-purple-500' : 'bg-gray-50 border-gray-200 hover:border-purple-400') : (isDark ? 'bg-black/10 border-gray-800 opacity-60' : 'bg-gray-100 border-gray-200 opacity-50')}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'} ${item.color}`}>
                  <i className={`fas ${item.icon} text-2xl`}></i>
                </div>
                <div className="text-right">
                  <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.name}</h4>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.description}</p>
                </div>
              </div>
              <button
                disabled={!canAfford || isPurchased}
                onClick={() => { onPurchase(item.id, item.cost); speak(item.name + ' נרכש'); }}
                className={`py-2 px-4 rounded-lg font-bold text-sm transition-all ${isPurchased ? (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500') : canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95' : (isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400')}`}
              >
                {isPurchased ? 'נרכש' : `${item.cost} נק'`}
              </button>
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => { onClose(); speak('סגור'); }}
        className={`w-full py-3 rounded-xl font-bold transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
      >
        סגור חנות
      </button>
    </div>
  );
};

export default UpgradeShop;
