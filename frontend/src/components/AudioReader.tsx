import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, FastForward, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioReaderProps {
  content: string;
  title?: string;
}

const AudioReader: React.FC<AudioReaderProps> = ({ content, title }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices.filter(v => v.lang.startsWith('en')));
      // Try to find a nice neural-sounding voice or default
      const preferred = availableVoices.find(v => v.name.includes('Google') || v.name.includes('Neural')) || availableVoices[0];
      if (preferred) setSelectedVoice(preferred.name);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const speak = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
      startProgressTimer();
      return;
    }

    window.speechSynthesis.cancel();
    
    const cleanContent = content.replace(/<[^>]*>?/gm, '');
    const textToRead = title ? `${title}. ${cleanContent}` : cleanContent;

    const newUtterance = new SpeechSynthesisUtterance(textToRead);
    newUtterance.rate = playbackSpeed;
    
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) newUtterance.voice = voice;
    }

    newUtterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(100);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    utteranceRef.current = newUtterance;
    window.speechSynthesis.speak(newUtterance);
    setIsSpeaking(true);
    setIsPaused(false);
    setProgress(0);
    startProgressTimer();
  };

  const startProgressTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Rough estimation of progress based on average speaking rate (approx 150 wpm)
    const words = (title ? `${title} ${content}` : content).split(/\s+/).length;
    const durationSec = (words / 150) * 60 / playbackSpeed;
    const totalMs = durationSec * 1000;
    const intervalMs = 1000;
    
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + (intervalMs / totalMs) * 100;
        return next >= 100 ? 100 : next;
      });
    }, intervalMs);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsSpeaking(false);
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
    
    if (isSpeaking) {
      // Re-start with new speed
      speak();
    }
  };

  return (
    <div className="w-full max-w-2xl mb-12">
      <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xl shadow-amber-900/5 relative overflow-hidden group">
        {/* Animated Background Pulse */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-amber-600"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isSpeaking ? 'bg-amber-600 scale-110 rotate-3 shadow-lg shadow-amber-600/20' : 'bg-amber-100'}`}>
                {isSpeaking ? (
                  <Activity className="h-6 w-6 text-white animate-pulse" />
                ) : (
                  <Volume2 className={`h-6 w-6 ${isSpeaking ? 'text-white' : 'text-amber-600'}`} />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Spiritual Audio</p>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{title || 'Community Word'}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
              >
                <User className="h-5 w-5" />
              </button>
              <button 
                onClick={toggleSpeed}
                className="px-3 py-1.5 bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-700 rounded-xl text-xs font-bold transition-all border border-gray-100 flex items-center gap-1.5"
              >
                <FastForward className="h-3 w-3" />
                {playbackSpeed}x
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
            />
          </div>

          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={reset}
              disabled={!isSpeaking && !isPaused && progress === 0}
              className="p-3 text-gray-400 hover:text-amber-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button 
              onClick={(!isSpeaking || isPaused) ? speak : pause}
              className="w-16 h-16 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-xl shadow-amber-600/30 flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {(!isSpeaking || isPaused) ? (
                <Play className="h-8 w-8 fill-current ml-1" />
              ) : (
                <Pause className="h-8 w-8 fill-current" />
              )}
            </button>

            <div className="w-11" /> {/* Spacer for symmetry */}
          </div>

          {/* Voice Settings Dropdown */}
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 pt-6 border-t border-gray-100"
              >
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3">Narrator Voice</label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {voices.map(voice => (
                    <button
                      key={voice.name}
                      onClick={() => {
                        setSelectedVoice(voice.name);
                        if (isSpeaking) speak(); // Restart with new voice
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${selectedVoice === voice.name ? 'bg-amber-50 text-amber-900 font-bold border border-amber-100' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span>{voice.name.replace('Microsoft ', '').replace('Google ', '')}</span>
                      {selectedVoice === voice.name && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Podcast Subtitle */}
      <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
        <div className="w-1 h-1 bg-amber-300 rounded-full animate-ping" />
        <span className="text-[10px] font-bold tracking-widest uppercase italic">The Bible Lover Podcast Engine</span>
      </div>
    </div>
  );
};

export default AudioReader;
