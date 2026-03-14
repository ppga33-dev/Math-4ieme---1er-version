
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathTopic, Exercise } from '../types';
import { generateQuiz } from '../services/geminiService';
import { getOfflineContent, savePendingAttempt } from '../services/offlineService';
import { useMathAudio } from '../hooks/useMathAudio';
import Breadcrumbs from './Breadcrumbs';

interface QuizRoomProps {
  topic: MathTopic;
  onClose: () => void;
  onComplete: (score: number, totalQuestions: number) => void;
  breadcrumbs?: any[];
}

const QuizRoom: React.FC<QuizRoomProps> = ({ topic, onClose, onComplete, breadcrumbs }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scorePop, setScorePop] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const { isReading, isGenerating, playbackSpeed, play, stop, updateSpeed } = useMathAudio();
  const isMounted = useRef(true);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check offline content first if offline or as a fallback
    const offlineContent = getOfflineContent(topic.id);
    if (!navigator.onLine && offlineContent?.quiz) {
      setQuestions(offlineContent.quiz);
      setLoading(false);
      return;
    }

    try {
      const data = await generateQuiz(topic.title);
      if (isMounted.current) {
        if (data && Array.isArray(data) && data.length > 0) {
          const formattedQuestions: Exercise[] = data.map((q: any, index: number) => ({
            ...q,
            id: `quiz-${topic.id}-${index}-${Date.now()}`,
            topicId: topic.id
          }));
          setQuestions(formattedQuestions);
        } else if (offlineContent?.quiz) {
          // Fallback to offline quiz if online generation fails
          setQuestions(offlineContent.quiz);
        } else {
          setError("Impossible de générer le quiz. Réessaie !");
        }
      }
    } catch (err) {
      console.error("Quiz fetch failed", err);
      if (offlineContent?.quiz) {
        setQuestions(offlineContent.quiz);
      } else if (isMounted.current) {
        setError("Une erreur est survenue lors de la connexion.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [topic.id, topic.title]);

  useEffect(() => {
    isMounted.current = true;
    fetchQuiz();
    return () => { isMounted.current = false; };
  }, [fetchQuiz]);

  const handleAnswer = (option: string) => {
    if (showFeedback || isTransitioning) return;
    stop();
    setSelectedOption(option);
    setShowFeedback(true);
    
    setUserAnswers(prev => ({ ...prev, [currentIndex]: option }));
    
    if (option === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
      setScorePop(true);
      setTimeout(() => { if (isMounted.current) setScorePop(false); }, 600);
    }
  };

  const handleNext = () => {
    stop();
    setIsTransitioning(true);
    setTimeout(() => {
      if (!isMounted.current) return;
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
        setShowFeedback(false);
        setIsTransitioning(false);
      } else {
        setFinished(true);
      }
    }, 400);
  };

  const handleFinish = () => {
    stop();
    if (!navigator.onLine) {
      savePendingAttempt({
        type: 'quiz',
        topicId: topic.id,
        score,
        total: questions.length,
        timestamp: Date.now()
      });
    }
    onComplete(score, questions.length);
    onClose();
  };

  const getEncouragement = (s: number, total: number) => {
    const ratio = s / total;
    if (ratio === 1) return { text: "Incroyable ! Tu es une véritable légende des maths. 👑", color: "text-orange-600", bg: "bg-orange-50" };
    if (ratio >= 0.8) return { text: "Excellent travail ! Tu maîtrises presque parfaitement ce sujet. ✨", color: "text-green-600", bg: "bg-green-50" };
    if (ratio >= 0.6) return { text: "Bien joué ! Tu as une solide compréhension des bases. 👍", color: "text-blue-600", bg: "bg-blue-50" };
    if (ratio >= 0.4) return { text: "Pas mal ! Encore un peu d'effort et tu seras au top. 💪", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "Ne te décourage pas ! Relis le cours et réessaie, tu vas progresser. 🌱", color: "text-slate-600", bg: "bg-slate-50" };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full border border-white/20">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl">⚡</div>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Défi IA en cours...</h3>
          <p className="text-slate-500 font-medium text-sm">Je prépare tes 5 questions sur mesure.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full border border-white/20">
          <div className="text-4xl mb-6">⚠️</div>
          <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Oups !</h3>
          <p className="text-slate-500 font-medium text-sm mb-8">{error}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px]">Fermer</button>
            <button onClick={fetchQuiz} className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-100">Réessayer</button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const encouragement = getEncouragement(score, questions.length);
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl my-8 animate-in zoom-in duration-500 border border-white/20 flex flex-col overflow-hidden">
          
          <div className={`p-10 text-center ${encouragement.bg} border-b border-slate-100`}>
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-6xl mx-auto mb-6 shadow-xl ring-8 ring-white/50">
              {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🌟' : '📚'}
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Quiz Terminé !</h2>
            <div className="flex justify-center items-center gap-2 mb-4">
              <span className={`text-4xl font-black ${encouragement.color}`}>{score}</span>
              <span className="text-slate-400 font-bold text-xl">/ {questions.length}</span>
            </div>
            <p className={`text-sm font-bold leading-relaxed max-w-xs mx-auto ${encouragement.color} opacity-80 italic`}>
              "{encouragement.text}"
            </p>
          </div>

          <div className="flex-1 p-8 lg:p-10 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1 h-3 bg-slate-300 rounded-full"></span>
              Résumé de tes réponses
            </h3>
            
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCorrect = userAnswers[idx] === q.correctAnswer;
                return (
                  <div key={idx} className={`p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${isCorrect ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm shadow-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {isCorrect ? '✓' : '✕'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight mb-2">{q.question}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${isCorrect ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          Ta réponse : {userAnswers[idx]}
                        </span>
                        {!isCorrect && (
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            Correct : {q.correctAnswer}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={handleFinish}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-orange-600 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            >
              Enregistrer mes progrès <span className="text-lg">💾</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 animate-in zoom-in-95 duration-300">
        
        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-6 flex-1">
             <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">
               {topic.icon}
             </div>
             <div className="flex flex-col gap-1.5 flex-1 max-w-[200px]">
                {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Question</span>
                  <span>{currentIndex + 1} / {questions.length}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full transition-all duration-700 ease-out"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
             </div>
          </div>

          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all duration-300 ${scorePop ? 'scale-110 border-orange-500 bg-orange-50 shadow-lg' : 'border-slate-100 bg-white'}`}>
             <span className="text-xl">🏆</span>
             <span className="font-black text-slate-800">{score} pts</span>
          </div>

          <button onClick={() => { stop(); onClose(); }} className="ml-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-8 lg:p-12 transition-all duration-400 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'} relative`}>
          {isReading && (
            <div className="sticky top-0 right-0 left-0 flex justify-center py-4 bg-blue-50/90 backdrop-blur-md z-10 mb-6 rounded-2xl border border-blue-100 shadow-sm animate-in slide-in-from-top-4">
              <div className="flex items-end gap-1.5 h-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 bg-blue-600 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDuration: `${0.6 / playbackSpeed}s`, animationDelay: `${i * 0.05}s` }}></div>
                ))}
              </div>
            </div>
          )}
          <div className="mb-10">
            <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
              Challenge {topic.title}
            </span>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">
              {currentQ.question}
            </h3>
          </div>

          <div className="grid gap-4 mb-10">
            {currentQ.options?.map((option, idx) => (
              <button
                key={idx}
                disabled={showFeedback || isTransitioning}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex justify-between items-center relative overflow-hidden group
                  ${selectedOption === option 
                    ? (option === currentQ.correctAnswer 
                        ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                        : 'border-red-500 bg-red-50 shadow-lg shadow-red-100')
                    : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50/30'
                  }
                  ${showFeedback && option === currentQ.correctAnswer && selectedOption !== option ? 'border-green-300 bg-green-50/50' : ''}
                  ${showFeedback && selectedOption !== option ? 'opacity-40 grayscale-[0.5]' : ''}
                `}
              >
                <span className="font-bold text-slate-700 text-lg relative z-10">{option}</span>
                {showFeedback && option === currentQ.correctAnswer && (
                  <div className="bg-green-500 text-white p-1 rounded-full animate-in zoom-in duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className="animate-in slide-in-from-bottom-6 duration-500 pb-8">
              <div className={`rounded-[2rem] border-2 shadow-2xl overflow-hidden ${selectedOption === currentQ.correctAnswer ? 'bg-green-600 border-green-500' : 'bg-slate-800 border-slate-700'}`}>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl backdrop-blur-sm">
                        {selectedOption === currentQ.correctAnswer ? '✨' : '💡'}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white">
                          {selectedOption === currentQ.correctAnswer ? 'Parfait !' : 'On apprend...'}
                        </h4>
                        <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Explication de l'IA</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => play(currentQ.explanation.substring(0, 1500))}
                        disabled={isGenerating}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${isReading ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                      >
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : isReading ? '⏹' : '🔊'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10">
                    <p className="text-white text-lg font-medium leading-relaxed italic">
                      {currentQ.explanation}
                    </p>
                  </div>

                  <button 
                    onClick={handleNext}
                    className={`w-full py-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs
                      ${selectedOption === currentQ.correctAnswer 
                        ? 'bg-white text-green-700 hover:bg-green-50' 
                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-900/20'}
                    `}
                  >
                    Question Suivante <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizRoom;
