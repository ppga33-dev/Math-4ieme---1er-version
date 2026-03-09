
import React, { useMemo } from 'react';

interface GlobalProgressBarProps {
  topicMastery: Record<string, number>;
  totalTopics: number;
}

const GlobalProgressBar: React.FC<GlobalProgressBarProps> = ({ topicMastery, totalTopics }) => {
  const progress = useMemo(() => {
    const values = Object.values(topicMastery) as number[];
    if (values.length === 0) return 0;
    const totalMastery = values.reduce((acc, val) => acc + val, 0);
    // On divise par le nombre total de chapitres pour avoir un % global
    return Math.round(totalMastery / totalTopics);
  }, [topicMastery, totalTopics]);

  const level = useMemo(() => {
    if (progress < 20) return { name: 'Apprenti Pythagore', icon: '🐣' };
    if (progress < 40) return { name: 'Géomètre en Herbe', icon: '📏' };
    if (progress < 60) return { name: 'Calculateur Agile', icon: '⚡' };
    if (progress < 80) return { name: 'Maître des Équations', icon: '🧙‍♂️' };
    return { name: 'Légende des Maths', icon: '👑' };
  }, [progress]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-700" role="region" aria-label="Progression globale du programme">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl bg-orange-100 p-2 rounded-2xl" aria-hidden="true">{level.icon}</span>
          <div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Progression du Programme</h3>
            <p className="text-xl font-black text-slate-800">{level.name}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-blue-700">{progress}%</span>
          <p className="text-xs font-bold text-slate-500">Total Maîtrisé</p>
        </div>
      </div>
      
      <div 
        className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression globale de l'apprentissage"
      >
        {/* Subtle background grid for the bar */}
        <div className="absolute inset-0 flex justify-between px-1 opacity-20 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-px h-full bg-slate-400"></div>
          ))}
        </div>
        
        {/* Animated fill */}
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 transition-all duration-1000 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] animate-[shimmer_2s_infinite] pointer-events-none"></div>
          
          {/* Tip glow */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 blur-sm"></div>
        </div>
      </div>
      
      <div className="flex justify-between mt-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Début de 4ième</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase">Examen Final</span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
};

export default GlobalProgressBar;
