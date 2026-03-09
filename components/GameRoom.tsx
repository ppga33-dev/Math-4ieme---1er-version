
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gamepad2 } from 'lucide-react';
import { MathTopic } from '../types';
import MentalMathGame from './games/MentalMathGame';

interface GameRoomProps {
  topic: MathTopic;
  onClose: () => void;
  onUpdateStats: (points: number) => void;
}

const GameRoom: React.FC<GameRoomProps> = ({ topic, onClose, onUpdateStats }) => {
  if (!topic.gameConfig) return null;

  const renderGame = () => {
    switch (topic.gameConfig?.type) {
      case 'mental-math':
        return <MentalMathGame onClose={onClose} onFinish={onUpdateStats} />;
      default:
        return (
          <div className="p-12 text-center space-y-4">
            <div className="text-6xl">🎮</div>
            <h3 className="text-xl font-black text-slate-800">Bientôt disponible</h3>
            <p className="text-slate-500">Le mini-jeu "{topic.gameConfig.title}" est en cours de développement.</p>
            <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs">Fermer</button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Gamepad2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{topic.gameConfig.title}</h2>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{topic.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderGame()}
        </div>
      </motion.div>
    </div>
  );
};

export default GameRoom;
