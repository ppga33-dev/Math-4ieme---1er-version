
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserStats } from '../types';
import { MATH_TOPICS } from '../constants';

const chartData = [
  { name: 'Lun', score: 40 },
  { name: 'Mar', score: 65 },
  { name: 'Mer', score: 55 },
  { name: 'Jeu', score: 90 },
  { name: 'Ven', score: 75 },
  { name: 'Sam', score: 95 },
  { name: 'Dim', score: 100 },
];

interface StatsOverviewProps {
  stats: UserStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const topTopics = useMemo(() => {
    return (Object.entries(stats.topicMastery) as [string, number][])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id, mastery]) => {
        const topicInfo = MATH_TOPICS.find(t => t.id === id);
        return {
          id,
          mastery,
          title: topicInfo?.title || 'Sujet inconnu',
          icon: topicInfo?.icon || '❓'
        };
      });
  }, [stats.topicMastery]);

  const medals = [
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', medal: '🥇' },
    { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', medal: '🥈' },
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', medal: '🥉' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Graphique de progression avec conteneur robuste */}
      <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full min-h-[400px]">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-800">Progression hebdomadaire</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Activité des 7 derniers jours</p>
          </div>
          <span className="text-xs font-black text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
            +12% vs semaine dernière
          </span>
        </div>
        
        {/* Wrapper avec hauteur explicite et min-width pour Recharts */}
        <div className="flex-1 w-full min-h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                dy={10}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Points Forts (Top 3) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl" aria-hidden="true">🏆</span>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-none">Tes Points Forts</h3>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Top 3 des maîtrises</p>
            </div>
          </div>

          <div className="space-y-4 mb-8 flex-1 overflow-y-auto pr-1">
            {topTopics.length > 0 ? (
              topTopics.map((topic, idx) => (
                <div key={topic.id} className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-inner ${medals[idx].bg} ${medals[idx].border}`}>
                      {medals[idx].medal}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black truncate">{topic.title}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Maîtrisé à {topic.mastery}%</p>
                    </div>
                    <span className="text-xl group-hover:scale-125 transition-transform" aria-hidden="true">{topic.icon}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                <p className="text-sm font-bold text-slate-400">Continue à t'entraîner pour voir tes statistiques ici !</p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10 shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Total Points</span>
              <span className="text-2xl font-black">{stats.totalPoints}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: `${Math.min(100, stats.totalPoints / 10)}%` }}></div>
              </div>
              <span className="text-[10px] font-bold opacity-60">SCORE</span>
            </div>
          </div>
        </div>

        {/* Décoration d'arrière-plan */}
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default StatsOverview;
