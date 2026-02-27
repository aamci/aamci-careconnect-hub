/**
 * VoiceRecorder - MediaRecorder-based voice message recorder
 * Records audio, computes waveform visualization, and returns blob + metadata
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, durationMs: number, waveform: number[]) => void;
  onCancel: () => void;
  maxDurationMs?: number;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDurationMs = 120000,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording(false);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // MediaRecorder setup
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        audioBlobRef.current = blob;

        const url = URL.createObjectURL(blob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(url);
        setHasRecording(true);

        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
      };

      recorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      setHasRecording(false);
      setDurationMs(0);
      setWaveform([]);

      // Duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDurationMs(elapsed);

        if (elapsed >= maxDurationMs) {
          stopRecording(true);
        }
      }, 100);

      // Waveform visualization
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);

        // Compute RMS amplitude (0-1)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        setWaveform((prev) => {
          const next = [...prev, Math.min(1, rms * 3)];
          return next.length > 50 ? next.slice(-50) : next;
        });

        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      animFrameRef.current = requestAnimationFrame(updateWaveform);
    } catch {
      // Permission denied or no microphone
    }
  }, [maxDurationMs, audioUrl]);

  const stopRecording = useCallback((keepData: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    analyserRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setIsPaused(false);

    if (!keepData) {
      chunksRef.current = [];
      setDurationMs(0);
      setWaveform([]);
      setHasRecording(false);
    }
  }, []);

  const handleSend = useCallback(() => {
    if (audioBlobRef.current && durationMs > 0) {
      onRecordingComplete(audioBlobRef.current, durationMs, waveform);
    }
  }, [durationMs, waveform, onRecordingComplete]);

  const handleCancel = useCallback(() => {
    stopRecording(false);
    audioBlobRef.current = null;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onCancel();
  }, [stopRecording, audioUrl, onCancel]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Not recording yet - show record button
  if (!isRecording && !hasRecording) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={startRecording}
        disabled={disabled}
      >
        <Mic className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full bg-muted/40 rounded-lg px-3 py-2">
      {/* Cancel button */}
      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleCancel}>
        <X className="h-4 w-4 text-destructive" />
      </Button>

      {/* Waveform visualization */}
      <div className="flex-1 flex items-center gap-0.5 h-8 overflow-hidden">
        {waveform.map((amplitude, i) => (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-100',
              isRecording ? 'bg-destructive' : 'bg-primary'
            )}
            style={{ height: `${Math.max(4, amplitude * 32)}px` }}
          />
        ))}
        {isRecording && (
          <div className="w-1 h-4 rounded-full bg-destructive animate-pulse" />
        )}
      </div>

      {/* Duration */}
      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
        {formatDuration(durationMs)}
      </span>

      {/* Stop / Send */}
      {isRecording ? (
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={() => stopRecording(true)}
        >
          <Square className="h-3.5 w-3.5" />
        </Button>
      ) : hasRecording ? (
        <Button
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={handleSend}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
};

export default VoiceRecorder;
