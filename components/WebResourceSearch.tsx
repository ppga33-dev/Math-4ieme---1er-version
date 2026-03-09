
import React, { useState, useCallback } from 'react';
import { searchMathResources } from '../services/geminiService';

interface WebResourceSearchProps {
  onBack: () => void;
  initialQuery?: string;
}

const RESOURCE_FILTERS = [
  { id: 'exercices', label: 'Exercices Interactifs', icon: '🖱️' },
  { id: 'pdf', label: 'Fiches PDF', icon: '📄' },
  { id: 'videos', label: 'Vidéos de cours', icon: '📺' },
  { id: 'corriges', label: 'Avec Corrigés', icon: '✅' },
];

const WebResourceSearch: React.FC<WebResourceSearchProps> = ({ onBack, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [results, setResults] = useState<{ text: string, links: { title: string, uri: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  }, []);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    const filtersToPass = activeFilters.map(id => 
      RESOURCE_FILTERS.find(f => f.id === id)?.label || id
    );
    
    const data = await searchMathResources(query, filtersToPass);
    setResults(data);
    setLoading(false);
  }, [query, activeFilters]);

  const getLinkIcon = (uri: string) => {
    if (uri.includes('.pdf')) return '📄';
    if (uri.includes('youtube.com') || uri.includes('youtu.be') || uri.includes('video')) return '📺';
    if (uri.includes('interactif') || uri.includes('quiz') || uri.includes('genially')) return '🖱️';
    return '🔗';
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col min-h-[600px] animate-in fade-in zoom-in duration-500">
      <div className="p-8 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-200 text-white">
            🌐
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">Explorateur de Ressources</h3>
            <p className="text-slate-500 font-medium">Recherche intelligente sur tout le Web éducatif</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
        >
          Retour au Dashboard
        </button>
      </div>

      <div className="p-8">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative group mb-6">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Théorème de Thalès, Calcul littéral équations..."
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-[2rem] px-8 py-5 outline-none transition-all text-xl font-semibold pr-40 shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white px-8 rounded-[1.5rem] font-black hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>🔍 Rechercher</>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Filtres :</span>
            {RESOURCE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => toggleFilter(filter.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                  activeFilters.includes(filter.id)
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                <span>{filter.icon}</span>
                {filter.label}
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button 
                type="button"
                onClick={() => setActiveFilters([])}
                className="text-xs font-bold text-red-500 hover:underline ml-2"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </form>

        {loading && (
          <div className="py-24 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-8 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Analyse du Web en cours...</h4>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">Je sélectionne les meilleurs cours et exercices de 4ième adaptés à ta demande.</p>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-500/20 p-2 rounded-lg text-xl">💡</span>
                  <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm">Conseil de l'Assistant</h4>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-medium">
                  {results.text}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <span className="bg-green-100 text-green-600 w-10 h-10 rounded-xl flex items-center justify-center">🎯</span>
                  Ressources recommandées ({results.links.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.links.map((link, i) => (
                  <a 
                    key={i}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white p-6 border-2 border-slate-50 rounded-3xl hover:border-blue-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex items-start gap-5 relative overflow-hidden"
                  >
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300 shrink-0">
                      {getLinkIcon(link.uri)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-tight">
                        {link.title}
                      </h5>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter truncate max-w-[200px]">
                          {new URL(link.uri).hostname}
                        </span>
                      </div>
                      <div className="flex items-center text-blue-600 font-black text-xs uppercase tracking-widest gap-2">
                        Accéder au contenu
                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </div>
                  </a>
                ))}
                {results.links.length === 0 && (
                  <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                    <div className="text-5xl mb-4">🏜️</div>
                    <h5 className="text-xl font-bold text-slate-400">Aucun lien direct trouvé</h5>
                    <p className="text-slate-300">Essaie d'élargir tes mots-clés ou de changer les filtres.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!results && !loading && (
          <div className="py-20 text-center animate-in zoom-in duration-1000">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto opacity-70">
              {['Pythagore PDF', 'Scratch Corrigés', 'Fractions Vidéo', 'Calcul Littéral'].map((suggest, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(suggest); handleSearch(); }}
                  className="bg-slate-50 p-6 rounded-3xl border-2 border-transparent hover:border-blue-200 hover:bg-white transition-all text-slate-600 font-bold text-sm shadow-sm"
                >
                  💡 {suggest}
                </button>
              ))}
            </div>
            <div className="mt-16 max-w-md mx-auto">
              <div className="text-6xl mb-6">🔭</div>
              <h4 className="text-2xl font-black text-slate-800 mb-3">Besoin de plus d'entraînement ?</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Taper un sujet, coche les types de ressources souhaités (ex: PDF + Corrigés) et laisse l'IA explorer le web pour toi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebResourceSearch;
