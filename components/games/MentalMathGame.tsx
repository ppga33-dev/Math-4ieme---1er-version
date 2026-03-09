
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Zap, Trophy, XCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface MentalMathGameProps {
  onClose: () => void;
  onFinish: (score: number) => void;
}

const MentalMathGame: React.FC<MentalMathGameProps> = ({ onClose, onFinish }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentProblem, setCurrentProblem] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateProblem = useCallback(() => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    if (op === '*') {
      a = Math.floor(Math.random() * 12) * (Math.random() > 0.5 ? 1 : -1);
      b = Math.floor(Math.random() * 10) * (Math.random() > 0.5 ? 1 : -1);
    } else {
      a = Math.floor(Math.random() * 50) * (Math.random() > 0.5 ? 1 : -1);
      b = Math.floor(Math.random() * 50) * (Math.random() > 0.5 ? 1 : -1);
    }

    if (op === '+') answer = a + b;
    else if (op === '-') answer = a - b;
    else answer = a * b;

    setCurrentProblem({ a, b, op, answer });
    setUserAnswer('');
    setFeedback(null);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    generateProblem();
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      onFinish(score);
    }
  }, [gameState, timeLeft, score, onFinish]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer) === currentProblem.answer) {
      setScore(prev => prev + 10);
      setFeedback('correct');
      setTimeout(generateProblem, 300);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 500);
    }
  };

  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center p-8">
        <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 mb-4">
          <Zap size={40} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-black text-slate-800">Signe Rapide</h2>
        <p className="text-slate-500 max-w-xs">
          Calcule le plus de résultats possible en 30 secondes. Attention aux signes !
        </p>
        <button 
          onClick={startGame}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-200"
        >
          Commencer
        </button>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center p-8">
        <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center text-yellow-600 mb-4">
          <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">Temps écoulé !</h2>
        <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Score Final</p>
          <p className="text-5xl font-black text-slate-800">{score}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button 
            onClick={startGame}
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
          >
            Rejouer
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
          >
            Quitter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
          <Timer size={18} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'} />
          <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-slate-700'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
          <Zap size={18} className="text-orange-500" />
          <span className="font-bold text-orange-700">{score} pts</span>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="text-6xl font-black text-slate-800 tracking-tighter flex items-center justify-center gap-4">
          <span className={currentProblem.a < 0 ? 'text-red-500' : 'text-blue-500'}>
            ({currentProblem.a})
          </span>
          <span className="text-slate-300">{currentProblem.op}</span>
          <span className={currentProblem.b < 0 ? 'text-red-500' : 'text-blue-500'}>
            ({currentProblem.b})
          </span>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">égal à ?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            autoFocus
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className={`w-full bg-slate-50 border-2 ${
              feedback === 'correct' ? 'border-green-500 bg-green-50' : 
              feedback === 'wrong' ? 'border-red-500 bg-red-50' : 
              'border-slate-100 focus:border-orange-500'
            } rounded-3xl py-6 px-8 text-3xl font-black text-center text-slate-800 outline-none transition-all`}
            placeholder="?"
          />
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -10 }}
                className="absolute -right-2 -top-2"
              >
                {feedback === 'correct' ? (
                  <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <CheckCircle2 size={24} />
                  </div>
                ) : (
                  <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                    <XCircle size={24} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button 
          type="submit"
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
        >
          Valider
        </button>
      </form>
    </div>
  );
};

export default MentalMathGame;
