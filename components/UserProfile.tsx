
import React, { useState, useRef, useCallback } from 'react';
import { UserStats } from '../types';
import { Camera, RefreshCw, Check, X, Trophy, Flame, Star, User } from 'lucide-react';

interface UserProfileProps {
  stats: UserStats;
  onUpdateStats: (updates: Partial<UserStats>) => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ stats, onUpdateStats, onBack }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const calculateLevel = (points: number) => {
    if (points < 500) return { name: 'Apprenti', level: 1, next: 500 };
    if (points < 1500) return { name: 'Initié', level: 2, next: 1500 };
    if (points < 3000) return { name: 'Expert', level: 3, next: 3000 };
    if (points < 6000) return { name: 'Maître', level: 4, next: 6000 };
    return { name: 'Légende', level: 5, next: 10000 };
  };

  const userLevel = calculateLevel(stats.totalPoints);
  const progressToNext = Math.min(100, (stats.totalPoints / userLevel.next) * 100);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const saveAvatar = () => {
    if (capturedImage) {
      onUpdateStats({ avatarUrl: capturedImage });
      setCapturedImage(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
        >
          <X size={18} /> Retour au Dashboard
        </button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mon Profil</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-xl mb-6 flex items-center justify-center">
                {stats.avatarUrl ? (
                  <img src={stats.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-300" />
                )}
              </div>
              <button 
                onClick={startCamera}
                className="absolute bottom-6 right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                <Camera size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-black text-slate-800">Élève Premium</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{userLevel.name}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-yellow-300" fill="currentColor" />
              <h4 className="font-black text-lg">Niveau {userLevel.level}</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-80">
                <span>Progression</span>
                <span>{stats.totalPoints} / {userLevel.next} XP</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-1000" 
                  style={{ width: `${progressToNext}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Série Actuelle</p>
              <p className="text-3xl font-black text-slate-800">{stats.streak} Jours</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Total Points</p>
              <p className="text-3xl font-black text-slate-800">{stats.totalPoints} XP</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6">
              <Check size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Exercices Réussis</p>
              <p className="text-3xl font-black text-slate-800">{stats.completedExercises}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
              <RefreshCw size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Taux de Maîtrise</p>
              <p className="text-3xl font-black text-slate-800">
                {Math.round((Object.values(stats.topicMastery) as number[]).reduce((a, b) => a + b, 0) / (Object.keys(stats.topicMastery).length || 1))}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Prendre une photo</h3>
              <button onClick={stopCamera} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-900 mb-8 border-4 border-slate-100">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={stopCamera}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={capturePhoto}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Capturer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {capturedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-6">Nouvel Avatar</h3>
            
            <div className="aspect-square rounded-full overflow-hidden bg-slate-100 mb-8 border-8 border-slate-50 shadow-inner mx-auto w-64 h-64">
              <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setCapturedImage(null)}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
              >
                Recommencer
              </button>
              <button 
                onClick={saveAvatar}
                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default UserProfile;
