
import { useState, useRef, useCallback, useEffect } from 'react';
import { generateLessonSpeech, decodeBase64, decodeAudioData } from '../services/geminiService';

export const useMathAudio = () => {
  const [isReading, setIsReading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignorer si déjà arrêté
      }
      sourceNodeRef.current = null;
    }
    setIsReading(false);
  }, []);

  const updateSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (sourceNodeRef.current) {
      // Changement de vitesse en temps réel
      sourceNodeRef.current.playbackRate.setValueAtTime(speed, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  const play = useCallback(async (text: string) => {
    if (isReading) {
      stop();
      return;
    }

    setIsGenerating(true);
    try {
      // Détecter le ton approprié basé sur le contenu
      let tone: 'encouraging' | 'enthusiastic' | 'patient' | 'academic' = 'academic';
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('bravo') || lowerText.includes('félicitations') || lowerText.includes('excellent') || lowerText.includes('parfait')) {
        tone = 'enthusiastic';
      } else if (lowerText.includes('attention') || lowerText.includes('erreur') || lowerText.includes('dommage') || lowerText.includes('réessaie')) {
        tone = 'patient';
      } else if (lowerText.includes('définition') || lowerText.includes('formule') || lowerText.includes('théorème') || lowerText.length > 300) {
        tone = 'academic';
      } else {
        tone = 'encouraging';
      }

      const base64Audio = await generateLessonSpeech(text, tone);
      if (!base64Audio) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.playbackRate.value = playbackSpeed;
      
      source.onended = () => {
        setIsReading(false);
        sourceNodeRef.current = null;
      };

      sourceNodeRef.current = source;
      source.start(0);
      setIsReading(true);
    } catch (error) {
      console.error("Audio Playback Error:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [isReading, stop, playbackSpeed]);

  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return { isReading, isGenerating, playbackSpeed, play, stop, updateSpeed };
};
