
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathTopic, Exercise } from '../types';
import { getMathExplanation, getMathExample, generateExercise, checkAnswerWithAI } from '../services/geminiService';
import { useMathAudio } from '../hooks/useMathAudio';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumbs from './Breadcrumbs';
import { BookOpen, Lightbulb, Pencil, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, XCircle, MessageSquare, Play, WifiOff } from 'lucide-react';
import { getOfflineContent } from '../services/offlineService';

interface LessonProps {
  topic: MathTopic;
  onClose: () => void;
  onComplete: (points: number) => void;
  breadcrumbs?: any[];
}

const Lesson: React.FC<LessonProps> = ({ topic, onClose, onComplete, breadcrumbs }) => {
  const [step, setStep] = useState<'learn' | 'example' | 'practice'>('learn');
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string>('');
  const [example, setExample] = useState<string>('');
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ analysis: string; coachAdvice: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const { isReading, isGenerating, playbackSpeed, play, stop, updateSpeed } = useMathAudio();
  const isMounted = useRef(true);

  const fetchLessonData = useCallback(async () => {
    setLoading(true);
    
    // Check for offline content first
    const offline = getOfflineContent(topic.id);
    if (offline) {
      if (isMounted.current) {
        setContent(offline.lesson.content);
        setExample(offline.lesson.example);
        setExercise(offline.exercises[0]); // Use first exercise for lesson practice
        setIsOffline(true);
        setLoading(false);
      }
      return;
    }

    try {
      const [explanationText, exampleText, exerciseData] = await Promise.all([
        getMathExplanation(topic.title, "Explique ce concept de 4ième de manière vivante et interactive. Utilise des analogies."),
        getMathExample(topic.title),
        generateExercise(topic.title)
      ]);

      if (isMounted.current) {
        setContent(explanationText);
        setExample(exampleText);
        setExercise(exerciseData);
      }
    } catch (err) {
      console.error("Error fetching lesson data:", err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [topic.title]);

  useEffect(() => {
    isMounted.current = true;
    fetchLessonData();
    return () => { isMounted.current = false; };
  }, [fetchLessonData]);

  const handleCheckAnswer = async (option: string) => {
    if (!exercise || checking) return;
    stop();
    setSelectedOption(option);
    setChecking(true);
    try {
      const aiFeedback = await checkAnswerWithAI(exercise.question, option, exercise.correctAnswer);
      if (isMounted.current) setFeedback(aiFeedback);
    } catch (err) {
      console.error("Error checking answer:", err);
    } finally {
      if (isMounted.current) setChecking(false);
    }
  };

  const handleFinish = () => {
    const points = selectedOption === exercise?.correctAnswer ? 50 : 20;
    onComplete(points);
    onClose();
  };

  const handleToggleSpeech = () => {
    if (isReading) {
      stop();
    } else {
      const textToRead = step === 'learn' ? content : step === 'example' ? example : exercise?.question || '';
      play(textToRead.substring(0, 1500));
    }
  };

  const steps = [
    { id: 'learn', label: 'Apprendre', icon: <BookOpen size={18} /> },
    { id: 'example', label: 'Comprendre', icon: <Lightbulb size={18} /> },
    { id: 'practice', label: 'Appliquer', icon: <Pencil size={18} /> }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full border border-white/20">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">📖</div>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Préparation du cours...</h3>
          <p className="text-slate-500 font-medium text-sm">L'IA rédige ta leçon personnalisée sur {topic.title}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl my-8 border border-white/20 flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-100">
              {topic.icon}
            </div>
            <div>
              {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Leçon Interactive</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{topic.category}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{topic.title}</h2>
              {isOffline && (
                <div className="flex items-center gap-1.5 mt-1 text-green-600">
                  <WifiOff size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Mode Hors Ligne</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  stop();
                  setStep(s.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  step === s.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s.icon} <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm" role="group" aria-label="Vitesse de lecture">
              {[0.75, 1, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => updateSpeed(speed)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                    playbackSpeed === speed ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
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
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : isReading ? '⏹' : '🔊'}
            </button>
          </div>

          <button onClick={() => { stop(); onClose(); }} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <XCircle size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
          {isReading && (
            <div className="sticky top-0 right-0 left-0 flex justify-center py-4 bg-blue-50/90 backdrop-blur-md z-10 mb-6 rounded-2xl border border-blue-100 shadow-sm animate-in slide-in-from-top-4">
              <div className="flex items-end gap-1.5 h-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 bg-blue-600 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDuration: `${0.6 / playbackSpeed}s`, animationDelay: `${i * 0.05}s` }}></div>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === 'learn' && (
              <motion.div
                key="learn"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="prose prose-slate max-w-none"
              >
                <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border-2 border-blue-100/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">✨</div>
                  <div className="relative z-10 whitespace-pre-wrap text-lg font-medium text-slate-800 leading-relaxed">
                    {content}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'example' && (
              <motion.div
                key="example"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <Lightbulb size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Exemple d'application</h3>
                </div>
                <div className="bg-green-50/50 p-8 rounded-[2.5rem] border-2 border-green-100/50 whitespace-pre-wrap text-lg font-medium text-slate-800 leading-relaxed italic">
                  {example}
                </div>
                <div className="p-6 bg-slate-900 rounded-3xl text-white flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">💡</div>
                  <p className="text-sm font-medium opacity-90">
                    Observe bien comment les étapes sont décomposées. C'est la clé pour réussir tes propres exercices !
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'practice' && exercise && (
              <motion.div
                key="practice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                      <Pencil size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">À ton tour !</h3>
                  </div>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    +50 XP
                  </span>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
                  <p className="text-xl font-bold text-slate-800 mb-8 leading-tight">
                    {exercise.question}
                  </p>
                  <div className="grid gap-4">
                    {exercise.options?.map((option, idx) => (
                      <button
                        key={idx}
                        disabled={!!selectedOption || checking}
                        onClick={() => handleCheckAnswer(option)}
                        className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group
                          ${selectedOption === option 
                            ? (option === exercise.correctAnswer ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' : 'border-red-500 bg-red-50 shadow-lg shadow-red-100')
                            : selectedOption && option === exercise.correctAnswer ? 'border-green-300 bg-green-50/50' : 'border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
                          }
                          ${selectedOption && selectedOption !== option && option !== exercise.correctAnswer ? 'opacity-40' : ''}
                        `}
                      >
                        <span className="font-bold text-slate-700 text-lg">{option}</span>
                        {selectedOption && option === exercise.correctAnswer && (
                          <CheckCircle2 className="text-green-500" size={24} />
                        )}
                        {selectedOption === option && option !== exercise.correctAnswer && (
                          <XCircle className="text-red-500" size={24} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {checking && (
                  <div className="flex items-center justify-center py-4 gap-3 text-slate-400 font-bold text-sm">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-slate-200 border-t-slate-400 rounded-full" />
                    L'IA analyse ta réponse...
                  </div>
                )}

                {feedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 rounded-[2.5rem] border-2 shadow-xl ${selectedOption === exercise.correctAnswer ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-white'}`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
                        {selectedOption === exercise.correctAnswer ? '🎉' : '💡'}
                      </div>
                      <div>
                        <h4 className="text-xl font-black">
                          {selectedOption === exercise.correctAnswer ? 'Excellent !' : 'Presque...'}
                        </h4>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Analyse du Coach IA</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <p className="text-lg font-medium leading-relaxed italic">
                          {feedback.analysis}
                        </p>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-blue-500/20 rounded-2xl border border-white/5">
                        <Sparkles className="text-blue-300 shrink-0" size={20} />
                        <p className="text-sm font-bold leading-tight">
                          {feedback.coachAdvice}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button
            disabled={step === 'learn'}
            onClick={() => setStep(step === 'example' ? 'learn' : 'example')}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              step === 'learn' ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft size={18} /> Précédent
          </button>

          {step !== 'practice' ? (
            <button
              onClick={() => setStep(step === 'learn' ? 'example' : 'practice')}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2 active:scale-95"
            >
              Suivant <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!selectedOption}
              className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center gap-2 active:scale-95 ${
                selectedOption ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Terminer la leçon <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Lesson;
