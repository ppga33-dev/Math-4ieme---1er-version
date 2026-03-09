
import React from 'react';
import { MathTopic } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Hash, Info } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';

interface CheatSheetModalProps {
  topic: MathTopic;
  onClose: () => void;
  breadcrumbs?: any[];
}

const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ topic, onClose, breadcrumbs }) => {
  if (!topic.cheatSheet) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] p-8 max-w-md w-full text-center space-y-4"
        >
          <div className="text-4xl">🚧</div>
          <h3 className="text-xl font-black text-slate-800">Bientôt disponible</h3>
          <p className="text-slate-500">L'aide mémoire pour ce sujet est en cours de rédaction par nos experts.</p>
          <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs">Fermer</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-orange-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <BookOpen size={20} />
            </div>
            <div>
              {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Aide Mémoire</h2>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{topic.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Formulas */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
              <Hash size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest">Formules Clés</h3>
            </div>
            <div className="grid gap-3">
              {topic.cheatSheet.formulas.map((formula, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono text-sm text-slate-700 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">{idx + 1}</span>
                  {formula}
                </div>
              ))}
            </div>
          </section>

          {/* Definitions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Info size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest">Définitions Essentielles</h3>
            </div>
            <div className="space-y-3">
              {topic.cheatSheet.definitions.map((def, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{def}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
          >
            J'ai compris !
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CheatSheetModal;
