
import React from 'react';
import { ExerciseAttempt } from '../types';

interface ExerciseHistoryProps {
  history: ExerciseAttempt[];
  onBack: () => void;
}

const ExerciseHistory: React.FC<ExerciseHistoryProps> = ({ history, onBack }) => {
  const sortedHistory = [...history].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Historique des exercices</h3>
          <p className="text-sm text-slate-500">Retrouve tes performances passées</p>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
        >
          <span>←</span> Retour au tableau
        </button>
      </div>
      
      <div className="overflow-x-auto">
        {sortedHistory.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Sujet</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedHistory.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700">{attempt.topicTitle}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-blue-600">
                      +{attempt.points} <span className="text-[10px] text-slate-400">pts</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">
                      {attempt.date.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Complété
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📓</div>
            <p className="text-slate-500 font-medium">Tu n'as pas encore complété d'exercices.</p>
            <button 
              onClick={onBack}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Commence ton premier cours !
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseHistory;
