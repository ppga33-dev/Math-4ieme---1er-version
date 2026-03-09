
import React, { useState, useEffect, useCallback } from 'react';
import { MathTopic, Exercise } from '../types';
import { generateQuiz } from '../services/geminiService';
import { MATH_TOPICS } from '../constants';
import { Brain, CheckCircle2, XCircle, ArrowRight, Trophy, Timer, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizProps {
  onComplete: (score: number, total: number) => void;
  onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<'setup' | 'loading' | 'quiz' | 'result'>('setup');
  const [selectedTopic, setSelectedTopic] = useState<MathTopic | 'random'>('random');
  const [questions, setQuestions] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  const startQuiz = async () => {
    setStep('loading');
    const topicTitle = selectedTopic === 'random' 
      ? MATH_TOPICS[Math.floor(Math.random() * MATH_TOPICS.length)].title 
      : selectedTopic.title;
    
    const quizData = await generateQuiz(topicTitle);
    if (quizData && quizData.length > 0) {
      setQuestions(quizData);
      setStep('quiz');
    } else {
      alert("Erreur lors de la génération du quiz. Réessaie !");
      setStep('setup');
    }
  };

  const handleAnswer = (option: string) => {
    if (showFeedback) return;
    setSelectedOption(option);
    setShowFeedback(true);
    setUserAnswers(prev => ({ ...prev, [currentIndex]: option }));
    
    if (option === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setStep('result');
    }
  };

  const finishQuiz = () => {
    onComplete(score, questions.length);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Quiz IA MathÉlite</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Programme de 4ième</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
            <XCircle size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {step === 'setup' && (
              <motion.div 
                key="setup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">Prêt pour le défi ?</h3>
                  <p className="text-slate-500 font-medium">Choisis un sujet ou laisse l'IA décider pour toi.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSelectedTopic('random')}
                    className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center gap-4 ${selectedTopic === 'random' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">🎲</div>
                    <div>
                      <p className="font-black text-slate-800">Aléatoire</p>
                      <p className="text-xs text-slate-400 font-bold">Mélange de tous les sujets</p>
                    </div>
                  </button>
                  {MATH_TOPICS.slice(0, 3).map(topic => (
                    <button 
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center gap-4 ${selectedTopic !== 'random' && selectedTopic.id === topic.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">{topic.icon}</div>
                      <div>
                        <p className="font-black text-slate-800 truncate max-w-[120px]">{topic.title}</p>
                        <p className="text-xs text-slate-400 font-bold">Sujet spécifique</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={startQuiz}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                >
                  Générer mon Quiz <Sparkles size={16} />
                </button>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6"
              >
                <div className="relative w-24 h-24">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">🧠</div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">L'IA réfléchit...</h3>
                  <p className="text-slate-500 font-medium">Je prépare des questions stimulantes pour toi.</p>
                </div>
              </motion.div>
            )}

            {step === 'quiz' && questions.length > 0 && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Timer size={14} /> Question {currentIndex + 1} sur {questions.length}
                  </div>
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {score} Points
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                    {questions[currentIndex].question}
                  </h3>
                  <div className="grid gap-3">
                    {questions[currentIndex].options?.map((option, idx) => (
                      <button
                        key={idx}
                        disabled={showFeedback}
                        onClick={() => handleAnswer(option)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group
                          ${selectedOption === option 
                            ? (option === questions[currentIndex].correctAnswer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                            : showFeedback && option === questions[currentIndex].correctAnswer ? 'border-green-300 bg-green-50/50' : 'border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
                          }
                          ${showFeedback && selectedOption !== option && option !== questions[currentIndex].correctAnswer ? 'opacity-40' : ''}
                        `}
                      >
                        <span className="font-bold text-slate-700">{option}</span>
                        {showFeedback && option === questions[currentIndex].correctAnswer && (
                          <CheckCircle2 className="text-green-500" size={20} />
                        )}
                        {showFeedback && selectedOption === option && option !== questions[currentIndex].correctAnswer && (
                          <XCircle className="text-red-500" size={20} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {showFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-slate-900 text-white space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg">💡</div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-400">Explication</p>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                      {questions[currentIndex].explanation}
                    </p>
                    <button 
                      onClick={nextQuestion}
                      className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      {currentIndex === questions.length - 1 ? 'Voir les résultats' : 'Question suivante'} <ArrowRight size={14} />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-6"
              >
                <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center text-6xl mx-auto shadow-xl ring-8 ring-yellow-50/50">
                  <Trophy className="text-yellow-500" size={48} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-800">Bien joué !</h3>
                  <p className="text-slate-500 font-medium">Tu as terminé ton défi IA avec succès.</p>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex justify-around">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score Final</p>
                    <p className="text-4xl font-black text-slate-800">{score} / {questions.length}</p>
                  </div>
                  <div className="w-px bg-slate-200"></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Précision</p>
                    <p className="text-4xl font-black text-slate-800">{Math.round((score / questions.length) * 100)}%</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep('setup')}
                    className="flex-1 py-5 rounded-2xl border-2 border-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={16} /> Recommencer
                  </button>
                  <button 
                    onClick={finishQuiz}
                    className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                  >
                    Enregistrer Progrès
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Quiz;
