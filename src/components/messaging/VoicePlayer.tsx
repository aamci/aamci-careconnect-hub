/**
 * VoicePlayer - Audio player for voice messages
 * Displays waveform, play/pause, duration, and playback progress
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VoiceMessageData } from '@/types/messaging';

interface VoicePlayerProps {
  voiceData: VoiceMessageData;
  isMine?: boolean;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ voiceData, isMine = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const durationSeconds = voiceData.durationMs / 1000;
  const waveform = voiceData.waveform || generateDefaultWaveform(20);

  useEffect(() => {
    const audio = new Audio(voiceData.storageUrl);
    audioRef.current = audio;

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [voiceData.storageUrl]);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    setProgress(p);
    setCurrentTime(audio.currentTime);

    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    } else if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, updateProgress]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;

    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
    setCurrentTime(audio.currentTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 rounded-full flex-shrink-0',
          isMine ? 'hover:bg-primary-foreground/20' : 'hover:bg-foreground/10'
        )}
        onClick={togglePlay}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      {/* Waveform bars */}
      <div
        className="flex-1 flex items-center gap-0.5 h-6 cursor-pointer"
        onClick={handleWaveformClick}
      >
        {waveform.map((amplitude, i) => {
          const barProgress = i / waveform.length;
          const isPlayed = barProgress <= progress;
          return (
            <div
              key={i}
              className={cn(
                'w-1 rounded-full transition-colors duration-150',
                isPlayed
                  ? isMine
                    ? 'bg-primary-foreground'
                    : 'bg-primary'
                  : isMine
                    ? 'bg-primary-foreground/40'
                    : 'bg-foreground/20'
              )}
              style={{ height: `${Math.max(3, amplitude * 24)}px` }}
            />
          );
        })}
      </div>

      {/* Time display */}
      <span className="text-xs font-mono opacity-70 flex-shrink-0">
        {isPlaying || currentTime > 0
          ? formatTime(currentTime)
          : formatTime(durationSeconds)}
      </span>
    </div>
  );
};

// Generate default waveform if none provided
function generateDefaultWaveform(count: number): number[] {
  return Array.from({ length: count }, () => 0.2 + Math.random() * 0.6);
}

export default VoicePlayer;
