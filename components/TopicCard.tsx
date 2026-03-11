
import React, { memo, useCallback } from 'react';
import { MathTopic } from '../types';
import { getMathExplanation } from '../services/geminiService';
import { useMathAudio } from '../hooks/useMathAudio';
import { Download, CloudOff, CheckCircle, Loader2, Gamepad2 } from 'lucide-react';

interface TopicCardProps {
  topic: MathTopic;
  onClick: (topic: MathTopic, initialView?: 'intro' | 'example' | 'exercises' | 'lesson' | 'cheatSheet' | 'game' | 'quiz') => void;
  onDownload?: (topic: MathTopic) => void;
  isDownloading?: boolean;
}

const TopicCard: React.FC<TopicCardProps> = memo(({ topic, onClick, onDownload, isDownloading }) => {
  const { isReading, isGenerating, playbackSpeed, play, stop, updateSpeed } = useMathAudio();
  const titleId = `topic-title-${topic.id}`;

  const handleListen = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReading) {
      stop();
      return;
    }
    const summary = await getMathExplanation(topic.title, "Donne un résumé d'une phrase très percutante sur l'essentiel à retenir.");
    play(summary);
  }, [topic.title, isReading, stop, play]);

  return (
    <article 
      className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 
                 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 
                 transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col h-full"
      onClick={() => onClick(topic, 'intro')}
      aria-labelledby={titleId}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-8">
          <div className="text-5xl w-20 h-20 rounded-[2rem] flex items-center justify-center 
                        bg-slate-50 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-700 
                        group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-xl group-hover:shadow-blue-200/50
                        group-hover:-rotate-3">
            {topic.icon}
          </div>
          
          <div className="flex items-center gap-2">
            {(isReading || isGenerating) && (
              <div className="flex bg-slate-900/5 backdrop-blur-sm p-1 rounded-xl border border-slate-200 animate-in slide-in-from-right-2 duration-300" onClick={(e) => e.stopPropagation()}>
                {[0.75, 1, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSpeed(speed)}
                    className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all ${
                      playbackSpeed === speed 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleListen}
              disabled={isGenerating}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm border
                ${isReading ? 'bg-red-500 text-white border-red-400' : 'bg-white text-blue-600 border-slate-100 hover:border-blue-200'}
                ${isGenerating ? 'opacity-50' : ''}
              `}
              title={isReading ? "Arrêter" : "Écouter le résumé"}
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : isReading ? (
                <span className="text-xs font-bold">⏹</span>
              ) : (
                <span className="text-xl">🔊</span>
              )}
            </button>

            {topic.gameConfig && (
              <button
                onClick={(e) => { e.stopPropagation(); onClick(topic, 'game'); }}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-90 border border-indigo-500"
                title={`Lancer le jeu : ${topic.gameConfig.title}`}
              >
                <Gamepad2 size={18} />
              </button>
            )}

            {onDownload && (
              <button
                onClick={(e) => { e.stopPropagation(); onDownload(topic); }}
                disabled={isDownloading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm border
                  ${topic.isDownloaded 
                    ? 'bg-green-50 text-green-600 border-green-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-600'}
                  ${isDownloading ? 'opacity-50' : ''}
                `}
                title={topic.isDownloaded ? "Supprimer l'accès hors ligne" : "Télécharger pour accès hors ligne"}
              >
                {isDownloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : topic.isDownloaded ? (
                  <CheckCircle size={18} />
                ) : (
                  <Download size={18} />
                )}
              </button>
            )}
          </div>
        </div>

        {isReading && (
          <div className="flex gap-1 h-3 mb-4 animate-in fade-in">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce" style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s`, animationDuration: `${0.6 / playbackSpeed}s` }}></div>
            ))}
          </div>
        )}

        <h3 id={titleId} className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-700 transition-colors tracking-tight">
          {topic.title}
        </h3>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-8 font-medium leading-relaxed flex-grow">
          {topic.description}
        </p>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 group-hover:bg-white transition-colors">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            <span>Maîtrise</span>
            <span className="text-blue-600">{topic.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-1000"
              style={{ width: `${topic.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(topic, 'lesson'); }}
            className="py-3 px-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all active:scale-95 border border-blue-100"
          >
            📖 Leçon
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(topic, 'cheatSheet'); }}
            className="py-3 px-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all active:scale-95 border border-orange-100"
          >
            📑 Aide Mémoire
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(topic, 'example'); }}
            className="py-3 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            💡 Exemples
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(topic, 'exercises'); }}
            className="py-3 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            ✏️ Exercices
          </button>
          <button 
            type="button"
            onClick={(e) => { 
              e.stopPropagation(); 
              // We need to handle quiz start in App.tsx, but TopicCard onClick only takes initialView.
              // I'll add 'quiz' to the allowed views in TopicCardProps and App.tsx handleTopicClick.
              onClick(topic, 'quiz'); 
            }}
            className="col-span-2 py-3 px-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95"
          >
            ⚡ Quiz IA Interactif
          </button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
    </article>
  );
});

export default TopicCard;
