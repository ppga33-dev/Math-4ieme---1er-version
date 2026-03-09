
import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { UserStats, MathTopic, ExerciseAttempt, LastActivity } from './types';
import { MATH_TOPICS } from './constants';
import TopicCard from './components/TopicCard';
import StatsOverview from './components/StatsOverview';
import GlobalProgressBar from './components/GlobalProgressBar';
import Breadcrumbs from './components/Breadcrumbs';
import { Search, X, Menu, Home, Download, CloudOff, CheckCircle, RotateCcw, PlayCircle, BookOpen } from 'lucide-react';
import { getMathExplanation, getMathExample, generateExercise } from './services/geminiService';
import { saveOfflineContent, isTopicDownloaded, removeOfflineContent } from './services/offlineService';

const MathAssistant = lazy(() => import('./components/MathAssistant'));
const ExerciseRoom = lazy(() => import('./components/ExerciseRoom'));
const TopicDetailModal = lazy(() => import('./components/TopicDetailModal'));
const ExerciseHistory = lazy(() => import('./components/ExerciseHistory'));
const WebResourceSearch = lazy(() => import('./components/WebResourceSearch'));
const QuizRoom = lazy(() => import('./components/QuizRoom'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const Quiz = lazy(() => import('./components/Quiz'));
const Lesson = lazy(() => import('./components/Lesson'));
const CheatSheetModal = lazy(() => import('./components/CheatSheetModal'));
const GameRoom = lazy(() => import('./components/GameRoom'));

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-12 w-full animate-pulse">
    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">Initialisation de MathÉlite...</p>
  </div>
);

const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('mathelite_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, history: parsed.history.map((h: any) => ({ ...h, date: new Date(h.date) })) };
    }
    return {
      completedExercises: 0,
      streak: 1,
      totalPoints: 0,
      topicMastery: {},
      history: []
    };
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'search' | 'profile'>('dashboard');
  const [topics, setTopics] = useState<MathTopic[]>([]);
  const [activeTopic, setActiveTopic] = useState<MathTopic | null>(null);
  const [modalMode, setModalMode] = useState<'intro' | 'example'>('intro');
  const [showDetail, setShowDetail] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showStandaloneQuiz, setShowStandaloneQuiz] = useState(false);
  const [showLesson, setShowLesson] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [downloadingTopicId, setDownloadingTopicId] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(() => {
    const saved = localStorage.getItem('mathelite_last_activity');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (lastActivity) {
      localStorage.setItem('mathelite_last_activity', JSON.stringify(lastActivity));
    }
  }, [lastActivity]);

  useEffect(() => {
    localStorage.setItem('mathelite_stats', JSON.stringify(stats));
    const merged = MATH_TOPICS.map(t => ({
      ...t,
      progress: stats.topicMastery[t.id] || 0,
      isDownloaded: isTopicDownloaded(t.id)
    }));
    setTopics(merged);
  }, [stats]);

  const groupedTopics = useMemo(() => {
    return topics.reduce((acc, topic) => {
      if (!acc[topic.category]) {
        acc[topic.category] = [];
      }
      acc[topic.category].push(topic);
      return acc;
    }, {} as Record<string, MathTopic[]>);
  }, [topics]);

  const handleTopicClick = useCallback((topic: MathTopic, initialView: 'intro' | 'example' | 'exercises' | 'lesson' | 'cheatSheet' | 'game' = 'intro') => {
    setActiveTopic(topic);
    if (initialView === 'exercises') {
      setShowExercises(true);
      setLastActivity({ topicId: topic.id, type: 'exercise', timestamp: Date.now() });
    } else if (initialView === 'lesson') {
      setShowLesson(true);
      setLastActivity({ topicId: topic.id, type: 'lesson', timestamp: Date.now() });
    } else if (initialView === 'cheatSheet') {
      setShowCheatSheet(true);
    } else if (initialView === 'game') {
      setShowGame(true);
    } else {
      setModalMode(initialView as 'intro' | 'example');
      setShowDetail(true);
    }
  }, []);

  const handleStartQuiz = useCallback((topic: MathTopic) => {
    setActiveTopic(topic);
    setShowQuiz(true);
  }, []);

  const handleExerciseComplete = useCallback((points: number) => {
    if (!activeTopic) return;
    const newAttempt: ExerciseAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      topicId: activeTopic.id,
      topicTitle: activeTopic.title,
      points: points,
      date: new Date()
    };
    setStats(prev => ({
      ...prev,
      completedExercises: prev.completedExercises + 1,
      totalPoints: prev.totalPoints + points,
      topicMastery: { ...prev.topicMastery, [activeTopic.id]: Math.min(100, (prev.topicMastery[activeTopic.id] || 0) + 10) },
      history: [...prev.history, newAttempt]
    }));
  }, [activeTopic]);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    if (!activeTopic) return;
    const earnedPoints = score * 20;
    const newAttempt: ExerciseAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      topicId: activeTopic.id,
      topicTitle: `🏆 Quiz: ${activeTopic.title}`,
      points: earnedPoints,
      date: new Date()
    };
    setStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + earnedPoints,
      topicMastery: { ...prev.topicMastery, [activeTopic.id]: Math.min(100, (prev.topicMastery[activeTopic.id] || 0) + (score >= 4 ? 20 : 5)) },
      history: [...prev.history, newAttempt]
    }));
  }, [activeTopic]);

  const handleUpdateStats = useCallback((updates: Partial<UserStats>) => {
    setStats(prev => ({ ...prev, ...updates }));
  }, []);

  const handleDownloadTopic = useCallback(async (topic: MathTopic) => {
    if (isTopicDownloaded(topic.id)) {
      removeOfflineContent(topic.id);
      setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, isDownloaded: false } : t));
      return;
    }

    setDownloadingTopicId(topic.id);
    try {
      const [explanation, example, ex1, ex2, ex3] = await Promise.all([
        getMathExplanation(topic.title, "Cours complet pour accès hors ligne."),
        getMathExample(topic.title),
        generateExercise(topic.title),
        generateExercise(topic.title),
        generateExercise(topic.title)
      ]);

      if (explanation && example && ex1 && ex2 && ex3) {
        saveOfflineContent({
          topicId: topic.id,
          lesson: { content: explanation, example },
          exercises: [ex1, ex2, ex3],
          lastUpdated: new Date().toISOString()
        });
        setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, isDownloaded: true } : t));
      }
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloadingTopicId(null);
    }
  }, []);

  const quickQuizTopics = useMemo(() => topics.filter(t => t.progress < 100).slice(0, 3), [topics]);

  const handleResumeActivity = useCallback(() => {
    if (!lastActivity) return;
    const topic = MATH_TOPICS.find(t => t.id === lastActivity.topicId);
    if (topic) {
      handleTopicClick(topic, lastActivity.type === 'lesson' ? 'lesson' : 'exercises');
    }
  }, [lastActivity, handleTopicClick]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return topics.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [topics, searchQuery]);

  const getBreadcrumbs = useCallback((topic?: MathTopic, action?: string) => {
    const items: any[] = [{ 
      label: 'Accueil', 
      onClick: () => {
        setCurrentView('dashboard');
        setShowDetail(false);
        setShowExercises(false);
        setShowQuiz(false);
        setShowStandaloneQuiz(false);
        setShowLesson(false);
        setShowCheatSheet(false);
      }, 
      icon: <Home size={12} /> 
    }];

    if (currentView === 'history') {
      items.push({ label: 'Mes Progrès' });
    } else if (currentView === 'search') {
      items.push({ label: 'Bibliothèque' });
    } else if (currentView === 'profile') {
      items.push({ label: 'Mon Profil' });
    } else if (topic) {
      items.push({ label: topic.category });
      items.push({ 
        label: topic.title, 
        onClick: action ? () => {
          setShowExercises(false);
          setShowQuiz(false);
          setShowLesson(false);
          setShowCheatSheet(false);
          setShowGame(false);
          setShowDetail(true);
        } : undefined
      });
      if (action) {
        items.push({ label: action });
      }
    } else if (showStandaloneQuiz) {
      items.push({ label: 'Quiz IA' });
    }

    return items;
  }, [currentView, showStandaloneQuiz]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Nombres et Calculs': return '🔢';
      case 'Espace et Géométrie': return '📐';
      case 'Données et Fonctions': return '📈';
      case 'Algorithmique': return '💻';
      default: return '📚';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-slate-200 shadow-xl md:shadow-sm transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">M</div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">MathÉlite</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Plateforme 4ième IA</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'history', label: 'Mes Progrès', icon: '📈' },
            { id: 'search', label: 'Bibliothèque', icon: '🌐' },
            { id: 'quiz-ia', label: 'Quiz IA', icon: '⚡' },
            { id: 'profile', label: 'Mon Profil', icon: '👤' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => {
                if (item.id === 'quiz-ia') {
                  setShowStandaloneQuiz(true);
                } else {
                  setCurrentView(item.id as any);
                }
                setIsSidebarOpen(false);
              }} 
              className={`w-full flex items-center gap-4 px-5 py-4 text-sm font-black rounded-2xl transition-all ${
                currentView === item.id 
                ? 'text-blue-700 bg-blue-50 shadow-sm ring-1 ring-blue-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div 
            onClick={() => setCurrentView('profile')}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border-2 border-white/20">
                  {stats.avatarUrl ? (
                    <img src={stats.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">👤</div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Élève</p>
                  <p className="text-sm font-bold">Premium</p>
                </div>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-2/3"></div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:scale-125 transition-transform">🎓</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 max-w-7xl mx-auto w-full transition-all duration-500 relative">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-4 md:px-8 py-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} className="text-slate-600" />
            </button>
            <div className="hidden sm:block animate-in fade-in slide-in-from-left-4 duration-700">
              <Breadcrumbs items={getBreadcrumbs()} />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {currentView === 'dashboard' ? 'Dashboard' : currentView === 'history' ? 'Progrès' : currentView === 'search' ? 'Bibliothèque' : 'Profil'}
              </h2>
            </div>

            {/* Search Bar in Header */}
            <div className="flex-1 max-w-md relative group ml-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
              <input 
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {searchResults.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => {
                          handleTopicClick(topic);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-all text-left group"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">{topic.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-800 truncate">{topic.title}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{topic.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="hidden lg:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
              <span className="text-lg">🔥</span>
              <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">{stats.streak} Jours</span>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <button 
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                {stats.avatarUrl ? (
                  <img src={stats.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">👤</div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-black text-slate-800 leading-none">{stats.totalPoints} pts</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Niveau 4</p>
              </div>
            </button>
          </div>
        </header>

        <div className="px-4 md:px-8 pb-20">
          {currentView === 'dashboard' && (
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                Bonjour, Champion ! 👋
              </h1>
              <p className="text-slate-500 font-medium text-base md:text-lg">
                Prêt à dominer le programme de 4ième aujourd'hui ?
              </p>
              
              {lastActivity && (
                <div className="mt-6 animate-in fade-in slide-in-from-left-4 duration-500">
                  <button 
                    onClick={handleResumeActivity}
                    className="group relative flex items-center gap-4 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <RotateCcw size={64} />
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                      {lastActivity.type === 'lesson' ? <BookOpen size={24} /> : <PlayCircle size={24} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Continuer l'apprentissage</p>
                      <h4 className="text-sm font-black text-slate-800">
                        {lastActivity.type === 'lesson' ? 'Reprendre la leçon :' : 'Reprendre les exercices :'} {MATH_TOPICS.find(t => t.id === lastActivity.topicId)?.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        Dernière session : {new Date(lastActivity.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="ml-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Menu size={16} className="rotate-90" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
          <Suspense fallback={<LoadingFallback />}>
          {currentView === 'dashboard' ? (
            <div className="space-y-16 animate-in fade-in duration-1000">
              <GlobalProgressBar topicMastery={stats.topicMastery} totalTopics={MATH_TOPICS.length} />
              <StatsOverview stats={stats} />
              
              <div className="space-y-16">
                {(Object.entries(groupedTopics) as [string, MathTopic[]][]).map(([category, categoryTopics]) => (
                  <section key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                       <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl">
                          {getCategoryIcon(category)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-800">{category}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {categoryTopics.length} Sujets au programme
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                          {categoryTopics.filter(t => t.progress === 100).length} / {categoryTopics.length} Maîtrisés
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {categoryTopics.map(topic => (
                        <TopicCard 
                          key={topic.id} 
                          topic={topic} 
                          onClick={handleTopicClick} 
                          onDownload={handleDownloadTopic}
                          isDownloading={downloadingTopicId === topic.id}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <section className="animate-in slide-in-from-bottom-8 duration-700 mt-20">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                    <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                    Quiz Rapides IA
                  </h3>
                  <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Boost Mastery
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {quickQuizTopics.length > 0 ? quickQuizTopics.map((topic) => (
                    <div 
                      key={`quiz-${topic.id}`}
                      className="group bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 hover:border-orange-200 hover:shadow-2xl transition-all duration-500 relative overflow-hidden cursor-pointer"
                      onClick={() => handleStartQuiz(topic)}
                    >
                      <div className="absolute -right-2 -top-2 p-6 opacity-5 text-7xl group-hover:rotate-12 transition-transform">⚡</div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                            {topic.icon}
                          </div>
                          <div>
                            <span className="block text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">DÉFI EXPRESS</span>
                            <h4 className="text-lg font-black text-slate-800 truncate">{topic.title}</h4>
                          </div>
                        </div>
                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-slate-100">
                          Lancer le Quiz
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 font-bold italic">Félicitations ! Tu as complété tous les quiz disponibles pour le moment.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : currentView === 'history' ? (
            <ExerciseHistory history={stats.history} onBack={() => setCurrentView('dashboard')} />
          ) : currentView === 'search' ? (
            <WebResourceSearch onBack={() => setCurrentView('dashboard')} />
          ) : (
            <UserProfile stats={stats} onUpdateStats={handleUpdateStats} onBack={() => setCurrentView('dashboard')} />
          )}
          </Suspense>
        </div>
      </main>

      <Suspense fallback={null}>
        <MathAssistant />
        {showDetail && activeTopic && (
          <TopicDetailModal 
            topic={activeTopic} 
            initialView={modalMode} 
            onClose={() => setShowDetail(false)} 
            onStartExercises={() => { setShowDetail(false); setShowExercises(true); }} 
            onStartLesson={() => { setShowDetail(false); setShowLesson(true); }}
            onStartGame={() => { setShowDetail(false); setShowGame(true); }}
            onDownload={handleDownloadTopic}
            isDownloading={downloadingTopicId === activeTopic.id}
            breadcrumbs={getBreadcrumbs(activeTopic)}
          />
        )}
        {showExercises && activeTopic && (
          <ExerciseRoom 
            topic={activeTopic} 
            onClose={() => setShowExercises(false)} 
            onComplete={handleExerciseComplete} 
            breadcrumbs={getBreadcrumbs(activeTopic, 'Exercices')}
          />
        )}
        {showQuiz && activeTopic && (
          <QuizRoom 
            topic={activeTopic} 
            onClose={() => setShowQuiz(false)} 
            onComplete={handleQuizComplete} 
            breadcrumbs={getBreadcrumbs(activeTopic, 'Quiz')}
          />
        )}
        {showStandaloneQuiz && (
          <Quiz 
            onClose={() => setShowStandaloneQuiz(false)}
            onComplete={(score, total) => {
              const earnedPoints = score * 20;
              setStats(prev => ({
                ...prev,
                totalPoints: prev.totalPoints + earnedPoints,
                history: [...prev.history, {
                  id: Math.random().toString(36).substr(2, 9),
                  topicId: 'standalone-quiz',
                  topicTitle: '🏆 Quiz IA Aléatoire',
                  points: earnedPoints,
                  date: new Date()
                }]
              }));
              setShowStandaloneQuiz(false);
            }}
          />
        )}
        {showLesson && activeTopic && (
          <Lesson 
            topic={activeTopic}
            onClose={() => setShowLesson(false)}
            onComplete={(points) => {
              const newAttempt: ExerciseAttempt = {
                id: Math.random().toString(36).substr(2, 9),
                topicId: activeTopic.id,
                topicTitle: `📖 Leçon: ${activeTopic.title}`,
                points: points,
                date: new Date()
              };
              setStats(prev => ({
                ...prev,
                totalPoints: prev.totalPoints + points,
                topicMastery: { ...prev.topicMastery, [activeTopic.id]: Math.min(100, (prev.topicMastery[activeTopic.id] || 0) + 15) },
                history: [...prev.history, newAttempt]
              }));
            }}
            breadcrumbs={getBreadcrumbs(activeTopic, 'Leçon')}
          />
        )}
        {showCheatSheet && activeTopic && (
          <CheatSheetModal 
            topic={activeTopic} 
            onClose={() => setShowCheatSheet(false)} 
            breadcrumbs={getBreadcrumbs(activeTopic, 'Aide Mémoire')}
          />
        )}
        {showGame && activeTopic && (
          <GameRoom 
            topic={activeTopic} 
            onClose={() => setShowGame(false)} 
            onUpdateStats={(points) => {
              const newAttempt: ExerciseAttempt = {
                id: Math.random().toString(36).substr(2, 9),
                topicId: activeTopic.id,
                topicTitle: `🎮 Jeu: ${activeTopic.gameConfig?.title}`,
                points: points,
                date: new Date()
              };
              setStats(prev => ({
                ...prev,
                totalPoints: prev.totalPoints + points,
                topicMastery: { ...prev.topicMastery, [activeTopic.id]: Math.min(100, (prev.topicMastery[activeTopic.id] || 0) + Math.floor(points / 10)) },
                history: [...prev.history, newAttempt]
              }));
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;
