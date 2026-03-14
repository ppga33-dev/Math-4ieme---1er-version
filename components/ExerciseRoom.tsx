
import React, { useState, useEffect, memo, useCallback } from 'react';
import { MathTopic, Exercise } from '../types';
import { 
  generateExercise, 
  checkAnswerWithAI, 
  searchMathResources
} from '../services/geminiService';
import { useMathAudio } from '../hooks/useMathAudio';
import Breadcrumbs from './Breadcrumbs';
import { getOfflineContent, savePendingAttempt } from '../services/offlineService';
import { WifiOff } from 'lucide-react';

interface ExerciseRoomProps {
  topic: MathTopic;
  onClose: () => void;
  onComplete: (score: number) => void;
  breadcrumbs?: any[];
}

const ExerciseRoom: React.FC<ExerciseRoomProps> = memo(({ topic, onClose, onComplete, breadcrumbs }) => {
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiCoachAdvice, setAiCoachAdvice] = useState('');
  const [checking, setChecking] = useState(false);
  const [additionalResources, setAdditionalResources] = useState<{ text: string, links: { title: string, uri: string }[] } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  const { isReading, isGenerating, playbackSpeed, play, stop, updateSpeed } = useMathAudio();

  const fetchExercise = useCallback(async () => {
    stop();
    setLoading(true);

    // Check for offline content
    const offline = getOfflineContent(topic.id);
    if (offline && offline.exercises.length > 0) {
      // Pick a random exercise from the offline list
      const randomIdx = Math.floor(Math.random() * offline.exercises.length);
      setExercise(offline.exercises[randomIdx]);
      setIsOffline(true);
      setLoading(false);
      setSelectedOption(null);
      setShowFeedback(false);
      setAiAnalysis('');
      setAiCoachAdvice('');
      setAdditionalResources(null);
      return;
    }

    try {
      const ex = await generateExercise(topic.title);
      setExercise(ex);
    } catch (err) {
      console.error("Failed to fetch exercise", err);
    } finally {
      setLoading(false);
      setSelectedOption(null);
      setShowFeedback(false);
      setAiAnalysis('');
      setAiCoachAdvice('');
      setAdditionalResources(null);
    }
  }, [topic.title, stop]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  const handleAnswer = async (option: string) => {
    if (showFeedback || checking || !exercise) return;
    setSelectedOption(option);
    setChecking(true);
    
    const isCorrect = option === exercise.correctAnswer;
    
    if (isOffline) {
      setAiAnalysis(isCorrect ? "C'est une excellente réponse ! Tu as bien appliqué les concepts vus en cours." : `Ce n'est pas tout à fait ça. La bonne réponse était "${exercise.correctAnswer}".`);
      setAiCoachAdvice(isCorrect ? "Continue comme ça, tu maîtrises bien ce sujet." : "Relis bien la leçon pour comprendre tes erreurs.");
      setChecking(false);
      setShowFeedback(true);
      return;
    }

    try {
      const result = await checkAnswerWithAI(exercise.question, option, exercise.correctAnswer);
      setAiAnalysis(result.analysis || '');
      setAiCoachAdvice(result.coachAdvice || '');

      const searchQuery = isCorrect 
        ? `approfondissement mathématiques 4ième ${topic.title}`
        : `rappels cours méthode 4ième mathématiques ${topic.title}`;
      
      const resources = await searchMathResources(searchQuery, isCorrect ? ['exercices', 'corriges'] : ['videos', 'pdf']);
      setAdditionalResources(resources);
      
      setChecking(false);
      setShowFeedback(true);

      if (result.analysis || result.coachAdvice) {
        play(`${result.analysis}. Mon conseil : ${result.coachAdvice}`);
      }
    } catch (error) {
      console.error("Feedback process error:", error);
      setChecking(false);
      setShowFeedback(true);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === exercise?.correctAnswer) {
      if (!navigator.onLine) {
        savePendingAttempt({
          type: 'exercise',
          topicId: topic.id,
          points: 10,
          timestamp: Date.now()
        });
      }
      onComplete(10);
    }
    fetchExercise();
  };

  const getResourceIcon = (uri: string) => {
    if (uri.includes('youtube.com') || uri.includes('youtu.be')) return '📺';
    if (uri.includes('.pdf')) return '📄';
    return '🔗';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6" role="status">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Préparation de l'exercice...</p>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === exercise?.correctAnswer;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20 animate-in zoom-in-95 duration-300">
        
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-blue-100/50" aria-hidden="true">{topic.icon}</div>
            <div>
              {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
              <h2 className="text-xl font-black text-slate-800 leading-none tracking-tight">{topic.title}</h2>
              {isOffline ? (
                <div className="flex items-center gap-1.5 mt-1 text-green-600">
                  <WifiOff size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Mode Hors Ligne</span>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sujet de 4ième • IA Coach</p>
              )}
            </div>
          </div>
          <button onClick={() => { stop(); onClose(); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all" aria-label="Fermer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className={`mb-12 transition-all duration-500 ${showFeedback ? 'opacity-40 scale-95 blur-[1px]' : 'opacity-100'}`}>
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Question d'entraînement</span>
            <h3 className="text-3xl font-bold text-slate-900 leading-tight mb-10">{exercise?.question}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup">
              {exercise?.options?.map((option, idx) => (
                <button
                  key={idx}
                  disabled={showFeedback || checking}
                  onClick={() => handleAnswer(option)}
                  className={`group text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden flex justify-between items-center
                    ${selectedOption === option 
                      ? (option === exercise.correctAnswer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                      : 'border-slate-100 hover:border-blue-400 hover:bg-blue-50/50'
                    }
                  `}
                >
                  <span className={`font-bold text-lg transition-colors ${selectedOption === option ? 'text-slate-900' : 'text-slate-600 group-hover:text-blue-700'}`}>{option}</span>
                  {selectedOption === option && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300 ${option === exercise.correctAnswer ? 'bg-green-500' : 'bg-red-500'}`}>
                      {option === exercise.correctAnswer ? '✓' : '✕'}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {checking && (
            <div className="py-20 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300" aria-live="polite">
              <div className="relative">
                <div className="w-24 h-24 border-8 border-blue-50 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl" aria-hidden="true">🧠</div>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-black text-slate-800 mb-1 uppercase tracking-tighter">Analyse par l'IA...</h4>
                <p className="text-slate-500 font-medium">Je prépare tes conseils personnalisés.</p>
              </div>
            </div>
          )}

          {showFeedback && (
            <div className="space-y-10 animate-in slide-in-from-bottom-12 duration-700 pb-10">
              <div className={`p-10 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden transition-all ${isCorrect ? 'bg-green-50/40 border-green-200' : 'bg-red-50/40 border-red-200'}`}>
                
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-3xl shadow-xl flex items-center justify-center text-5xl animate-bounce-slow ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`} aria-hidden="true">
                      {isCorrect ? '✨' : '💡'}
                    </div>
                    <div>
                      <h4 className={`text-4xl font-black tracking-tighter ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>{isCorrect ? 'Excellent !' : 'Analyse de l\'IA'}</h4>
                      <p className={`text-xs font-black uppercase tracking-widest opacity-60 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{isCorrect ? 'Réponse parfaite' : 'Explication pédagogique'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {(isReading || isGenerating) && (
                      <div className="flex bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50 shadow-sm animate-in fade-in zoom-in">
                        {[0.75, 1, 1.25].map(speed => (
                          <button
                            key={speed}
                            onClick={() => updateSpeed(speed)}
                            className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${playbackSpeed === speed ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}
                            aria-pressed={playbackSpeed === speed}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                    <button 
                      onClick={() => play(`${aiAnalysis}. Mon conseil : ${aiCoachAdvice}`)}
                      disabled={isGenerating}
                      className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-90 border-b-4 ${isReading ? 'bg-red-600 text-white border-red-800' : 'bg-blue-600 text-white border-blue-800'}`}
                      aria-label={isReading ? "Arrêter la lecture" : "Écouter l'explication"}
                    >
                      {isGenerating ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : isReading ? '⏹' : '🔊'}
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm p-8 rounded-[2rem] border border-white shadow-sm mb-8">
                  <p className="text-slate-800 font-bold text-xl leading-relaxed italic">"{aiAnalysis}"</p>
                </div>

                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-8 rounded-[2rem] mb-10 shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl" aria-hidden="true">🧠</span>
                      <h5 className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Le mémo du Coach IA</h5>
                    </div>
                    <p className="font-black text-2xl leading-tight">{aiCoachAdvice}</p>
                  </div>
                </div>

                {additionalResources && additionalResources.links.length > 0 && (
                  <div className="mt-12 animate-in slide-in-from-bottom-4 duration-1000">
                    <h5 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-widest mb-6">
                      <span className="w-2 h-6 bg-orange-500 rounded-full" aria-hidden="true"></span>
                      {isCorrect ? 'Pour aller plus loin' : 'Ressources de soutien'}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {additionalResources.links.slice(0, 4).map((link, i) => (
                        <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white/60 p-5 rounded-2xl border-2 border-white hover:border-blue-500 hover:bg-white hover:shadow-xl transition-all group">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {getResourceIcon(link.uri)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate leading-none mb-1">{link.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate opacity-70">{new URL(link.uri).hostname}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-10 border-t border-slate-200/50 flex flex-col sm:flex-row gap-4">
                  <button onClick={handleNextQuestion} className="flex-1 bg-slate-900 text-white font-black py-6 rounded-3xl hover:bg-blue-600 transition-all text-sm uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3">Question Suivante →</button>
                  <button onClick={() => { stop(); onClose(); }} className="px-10 py-6 rounded-3xl bg-white border-2 border-slate-200 text-slate-500 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">Terminer</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ExerciseRoom;
