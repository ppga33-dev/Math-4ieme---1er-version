
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { MathTopic } from '../types';
import { getMathExplanation, getMathExample, getEducationalVideos } from '../services/geminiService';
import { useMathAudio } from '../hooks/useMathAudio';
import Breadcrumbs from './Breadcrumbs';
import { Download, CheckCircle, Loader2, PlayCircle, ExternalLink, Youtube } from 'lucide-react';

interface TopicDetailModalProps {
  topic: MathTopic;
  onClose: () => void;
  onStartExercises: () => void;
  onStartLesson: () => void;
  onStartGame: () => void;
  onStartQuiz: () => void;
  onDownload?: (topic: MathTopic) => void;
  isDownloading?: boolean;
  initialView?: 'intro' | 'example' | 'applications' | 'videos';
  breadcrumbs?: any[];
}

const TopicDetailModal: React.FC<TopicDetailModalProps> = memo(({ 
  topic, 
  onClose, 
  onStartExercises, 
  onStartLesson, 
  onStartGame,
  onStartQuiz,
  onDownload,
  isDownloading,
  initialView = 'intro', 
  breadcrumbs 
}) => {
  const [view, setView] = useState<'intro' | 'example' | 'applications' | 'videos'>(initialView);
  const [content, setContent] = useState('');
  const [videos, setVideos] = useState<{title: string, url: string, thumbnail: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const { isReading, isGenerating, playbackSpeed, play, stop, updateSpeed } = useMathAudio();
  const isMounted = useRef(true);

  const fetchData = useCallback(async (targetView: 'intro' | 'example' | 'applications' | 'videos') => {
    if (targetView === 'applications') return;
    stop();
    setLoading(true);
    try {
      if (targetView === 'intro') {
        const text = await getMathExplanation(topic.title, "Produis un résumé de cours ultra-concis avec les points clés et les définitions essentielles de 4ième.");
        if (isMounted.current) setContent(text || '');
      } else if (targetView === 'example') {
        const text = await getMathExample(topic.title);
        if (isMounted.current) setContent(text || '');
      } else if (targetView === 'videos') {
        const videoList = await getEducationalVideos(topic.title);
        if (isMounted.current) setVideos(videoList);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [topic.title, stop]);

  useEffect(() => {
    isMounted.current = true;
    fetchData(view);
    return () => { isMounted.current = false; };
  }, [view, fetchData]);

  const handleToggleSpeech = () => {
    if (isReading) {
      stop();
    } else {
      play(content.substring(0, 1500));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        
        <div className="p-8 border-b flex justify-between items-start bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center gap-6">
            <div className="text-6xl bg-gradient-to-tr from-blue-50 to-white w-24 h-24 rounded-[2.5rem] shadow-xl shadow-blue-100 flex items-center justify-center border border-blue-50 relative overflow-hidden group" aria-hidden="true">
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              {topic.icon}
            </div>
            <div>
              {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                {topic.category}
              </span>
              <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">{topic.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(topic)}
                disabled={isDownloading}
                className={`p-3 rounded-2xl transition-all active:scale-95 shadow-sm border
                  ${topic.isDownloaded 
                    ? 'bg-green-50 text-green-600 border-green-100' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-600'}
                  ${isDownloading ? 'opacity-50' : ''}
                `}
                title={topic.isDownloaded ? "Supprimer l'accès hors ligne" : "Télécharger pour accès hors ligne"}
              >
                {isDownloading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : topic.isDownloaded ? (
                  <CheckCircle size={20} />
                ) : (
                  <Download size={20} />
                )}
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all" aria-label="Fermer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="px-8 pt-6 pb-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Résumé du sujet</h4>
            <p className="text-xs text-slate-700 font-bold italic leading-tight">{topic.description}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm" role="group" aria-label="Vitesse de lecture">
              {[0.75, 1, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => updateSpeed(speed)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                    playbackSpeed === speed ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                  aria-pressed={playbackSpeed === speed}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={handleToggleSpeech}
              disabled={loading || isGenerating}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black transition-all transform active:scale-95 shadow-lg uppercase tracking-wider
                ${isReading ? 'bg-red-600 text-white shadow-red-100' : 'bg-blue-600 text-white shadow-blue-100'}
                ${isGenerating ? 'opacity-50' : ''}
              `}
              aria-label={isReading ? "Arrêter la lecture" : "Lire le résumé"}
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : isReading ? '⏹' : '🔊'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {isReading && view !== 'applications' && (
            <div className="sticky top-0 right-0 left-0 flex justify-center py-4 bg-blue-50/90 backdrop-blur-md z-10 mb-6 rounded-2xl border border-blue-100 shadow-sm animate-in slide-in-from-top-4">
              <div className="flex items-end gap-1.5 h-6" aria-hidden="true">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 bg-blue-600 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDuration: `${0.6 / playbackSpeed}s`, animationDelay: `${i * 0.05}s` }}></div>
                ))}
              </div>
            </div>
          )}

          {loading && view !== 'applications' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center" aria-live="polite">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-600 font-black text-xs uppercase tracking-widest animate-pulse">Chargement...</p>
            </div>
          ) : view === 'videos' ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="bg-red-100 p-2 rounded-xl">🎬</span>
                Vidéos Éducatives
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((video, i) => (
                  <a 
                    key={i} 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-red-100 transition-all flex flex-col"
                  >
                    <div className="aspect-video relative overflow-hidden bg-slate-900">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                          <PlayCircle size={24} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h5 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">{video.title}</h5>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1"><Youtube size={12} /> YouTube</span>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  </a>
                ))}
                {videos.length === 0 && !loading && (
                  <div className="col-span-full text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic">Aucune vidéo trouvée pour le moment. Réessaie plus tard !</p>
                  </div>
                )}
              </div>
            </div>
          ) : view === 'applications' ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="bg-orange-100 p-2 rounded-xl">🌍</span>
                Applications réelles
              </h3>
              <div className="grid gap-4">
                {topic.realWorldApplications?.map((app, i) => (
                  <div key={i} className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 flex items-start gap-5 group hover:bg-orange-50 transition-colors">
                    <div className="text-4xl bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {app.icon}
                    </div>
                    <div>
                      <h5 className="font-black text-slate-800 text-lg mb-1">{app.title}</h5>
                      <p className="text-slate-600 text-sm font-medium leading-relaxed">{app.description}</p>
                    </div>
                  </div>
                ))}
                {(!topic.realWorldApplications || topic.realWorldApplications.length === 0) && (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic">Bientôt disponible pour ce sujet !</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-800 leading-relaxed text-lg prose prose-blue max-w-none animate-in fade-in duration-500">
              <div className={`whitespace-pre-wrap font-medium text-slate-900 leading-relaxed ${view === 'example' ? 'bg-green-50/40 p-8 rounded-[2rem] border-2 border-green-100/50' : ''}`}>
                {content}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t flex flex-col sm:flex-row gap-4">
          <div className="flex flex-1 gap-2">
            <button 
              type="button"
              onClick={() => setView('intro')}
              className={`flex-1 font-black py-4 px-2 rounded-xl transition-all border-2 text-[9px] uppercase tracking-widest ${view === 'intro' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              📝 Résumé
            </button>
            <button 
              type="button"
              onClick={() => setView('example')}
              className={`flex-1 font-black py-4 px-2 rounded-xl transition-all border-2 text-[9px] uppercase tracking-widest ${view === 'example' ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              💡 Exemple
            </button>
            <button 
              type="button"
              onClick={() => setView('applications')}
              className={`flex-1 font-black py-4 px-2 rounded-xl transition-all border-2 text-[9px] uppercase tracking-widest ${view === 'applications' ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              🌍 Appli.
            </button>
            <button 
              type="button"
              onClick={() => setView('videos')}
              className={`flex-1 font-black py-4 px-2 rounded-xl transition-all border-2 text-[9px] uppercase tracking-widest ${view === 'videos' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              🎬 Vidéos
            </button>
          </div>
          <div className="flex flex-1 gap-2">
            <button 
              type="button"
              onClick={() => { stop(); onStartExercises(); }}
              className="flex-1 bg-slate-900 text-white font-black py-4 px-4 rounded-xl hover:bg-slate-800 transition-all text-[9px] uppercase tracking-widest shadow-lg shadow-slate-100"
            >
              ✏️ Exercices
            </button>
            <button 
              type="button"
              onClick={() => { stop(); onStartLesson(); }}
              className="flex-1 bg-blue-600 text-white font-black py-4 px-4 rounded-xl hover:shadow-xl transition-all text-[9px] uppercase tracking-widest shadow-lg shadow-blue-100"
            >
              📖 Leçon
            </button>
            <button 
              type="button"
              onClick={() => { stop(); onStartQuiz(); }}
              className="flex-1 bg-orange-500 text-white font-black py-4 px-4 rounded-xl hover:bg-orange-600 transition-all text-[9px] uppercase tracking-widest shadow-lg shadow-orange-100"
            >
              ⚡ Quiz
            </button>
          </div>
          {topic.gameConfig && (
            <button 
              type="button"
              onClick={() => { stop(); onStartGame(); }}
              className="bg-indigo-600 text-white font-black py-4 px-6 rounded-xl hover:bg-indigo-700 transition-all text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              🎮 Jouer
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default TopicDetailModal;
