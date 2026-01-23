/**
 * TechnicalCheck - Test technique avant la téléconsultation
 * Vérification caméra, microphone, haut-parleurs, qualité réseau
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useDeviceTest, useMediaDevices } from '@/hooks/useLiveKit';
import { checkBrowserCompatibility, testNetworkQuality } from '@/services/livekit/livekitService';
import type { TechnicalCheckResult, ConnectionQuality } from '@/types/teleconsultation';

interface TechnicalCheckProps {
  onCheckComplete?: (result: TechnicalCheckResult) => void;
}

export function TechnicalCheck({ onCheckComplete }: TechnicalCheckProps) {
  const devices = useMediaDevices();
  const { testCamera, testMicrophone, stopTest, testStream, isTestingCamera, isTestingMicrophone } = useDeviceTest();

  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');

  const [cameraStatus, setCameraStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [microphoneStatus, setMicrophoneStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [speakerStatus, setSpeakerStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [networkStatus, setNetworkStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const [cameraError, setCameraError] = useState<string>('');
  const [microphoneError, setMicrophoneError] = useState<string>('');
  const [networkQuality, setNetworkQuality] = useState<ConnectionQuality>('good');
  const [networkLatency, setNetworkLatency] = useState<number>(0);

  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  // Sélectionner automatiquement le premier device disponible
  useEffect(() => {
    if (devices.cameras.length > 0 && !selectedCamera) {
      setSelectedCamera(devices.cameras[0].deviceId);
    }
    if (devices.microphones.length > 0 && !selectedMicrophone) {
      setSelectedMicrophone(devices.microphones[0].deviceId);
    }
  }, [devices, selectedCamera, selectedMicrophone]);

  // Mettre à jour la vidéo quand testStream change
  useEffect(() => {
    if (videoRef.current && testStream) {
      videoRef.current.srcObject = testStream;
    }
  }, [testStream]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopTest();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stopTest]);

  /**
   * Tester la caméra
   */
  const handleTestCamera = async () => {
    setCameraStatus('testing');
    setCameraError('');

    const result = await testCamera(selectedCamera || undefined);

    if (result.success) {
      setCameraStatus('success');
    } else {
      setCameraStatus('error');
      setCameraError(result.error || 'Erreur inconnue');
    }
  };

  /**
   * Tester le microphone
   */
  const handleTestMicrophone = async () => {
    setMicrophoneStatus('testing');
    setMicrophoneError('');

    const result = await testMicrophone(selectedMicrophone || undefined);

    if (result.success && result.stream) {
      setMicrophoneStatus('success');

      // Analyser le niveau audio
      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(result.stream);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        // Commencer l'analyse du niveau audio
        analyzeAudioLevel();
      } catch (error) {
        console.error('Error setting up audio analysis:', error);
      }
    } else {
      setMicrophoneStatus('error');
      setMicrophoneError(result.error || 'Erreur inconnue');
    }
  };

  /**
   * Analyser le niveau audio en continu
   */
  const analyzeAudioLevel = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculer le niveau moyen
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const normalizedLevel = (average / 255) * 100;

      setAudioLevel(normalizedLevel);

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  /**
   * Tester les haut-parleurs
   */
  const handleTestSpeaker = async () => {
    setSpeakerStatus('testing');
    setIsPlayingTestSound(true);

    try {
      // Jouer un son de test (bip simple)
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440; // La note A4
      gainNode.gain.value = 0.3;

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
        setIsPlayingTestSound(false);
        setSpeakerStatus('success');
      }, 1000);
    } catch (error) {
      setSpeakerStatus('error');
      setIsPlayingTestSound(false);
    }
  };

  /**
   * Tester la qualité réseau
   */
  const handleTestNetwork = async () => {
    setNetworkStatus('testing');

    try {
      const result = await testNetworkQuality();
      setNetworkQuality(result.quality);
      setNetworkLatency(result.latency);
      setNetworkStatus('success');
    } catch (error) {
      setNetworkStatus('error');
      setNetworkQuality('critical');
    }
  };

  /**
   * Tout tester automatiquement
   */
  const handleTestAll = async () => {
    await handleTestCamera();
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleTestMicrophone();
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleTestSpeaker();
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleTestNetwork();

    // Notifier le parent que le test est terminé
    if (onCheckComplete) {
      const browserInfo = checkBrowserCompatibility();
      const result: TechnicalCheckResult = {
        camera: {
          available: cameraStatus === 'success',
          error: cameraError || undefined,
        },
        microphone: {
          available: microphoneStatus === 'success',
          error: microphoneError || undefined,
        },
        speaker: {
          available: speakerStatus === 'success',
        },
        network: {
          quality: networkQuality,
          latency_ms: networkLatency,
          bandwidth_kbps: 0, // TODO: Implémenter test bandwidth
        },
        browser: browserInfo,
      };
      onCheckComplete(result);
    }
  };

  /**
   * Obtenir l'icône de statut
   */
  const getStatusIcon = (status: 'idle' | 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  /**
   * Obtenir le badge de qualité réseau
   */
  const getNetworkQualityBadge = () => {
    const colors = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      fair: 'bg-yellow-500',
      poor: 'bg-orange-500',
      critical: 'bg-red-500',
    };

    const labels = {
      excellent: 'Excellent',
      good: 'Bon',
      fair: 'Moyen',
      poor: 'Faible',
      critical: 'Critique',
    };

    return (
      <Badge className={colors[networkQuality]}>
        {labels[networkQuality]}
      </Badge>
    );
  };

  const allTestsPassed =
    cameraStatus === 'success' &&
    microphoneStatus === 'success' &&
    speakerStatus === 'success' &&
    networkStatus === 'success' &&
    networkQuality !== 'critical';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Test technique</h2>
        <p className="text-muted-foreground">
          Vérifions que votre matériel fonctionne correctement
        </p>
      </div>

      {/* Bouton test automatique */}
      <div className="flex justify-center">
        <Button onClick={handleTestAll} size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tout tester automatiquement
        </Button>
      </div>

      {/* Test caméra */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {cameraStatus === 'success' ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              <CardTitle>Caméra</CardTitle>
            </div>
            {getStatusIcon(cameraStatus)}
          </div>
          <CardDescription>Vérifiez que votre image est visible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélection caméra */}
          {devices.cameras.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Caméra sélectionnée</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {devices.cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Caméra ${camera.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Aperçu vidéo */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {testStream && cameraStatus === 'success' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoOff className="h-12 w-12 text-gray-600" />
              </div>
            )}
          </div>

          {/* Erreur */}
          {cameraError && (
            <Alert variant="destructive">
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          {/* Bouton test */}
          <Button
            onClick={handleTestCamera}
            disabled={isTestingCamera || devices.cameras.length === 0}
            className="w-full"
          >
            {isTestingCamera ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Tester la caméra
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test microphone */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {microphoneStatus === 'success' ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              <CardTitle>Microphone</CardTitle>
            </div>
            {getStatusIcon(microphoneStatus)}
          </div>
          <CardDescription>Parlez pour tester votre microphone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélection microphone */}
          {devices.microphones.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Microphone sélectionné</label>
              <select
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {devices.microphones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Niveau audio */}
          {microphoneStatus === 'success' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Niveau sonore</span>
                <span className="font-medium">{Math.round(audioLevel)}%</span>
              </div>
              <Progress value={audioLevel} className="h-2" />
            </div>
          )}

          {/* Erreur */}
          {microphoneError && (
            <Alert variant="destructive">
              <AlertDescription>{microphoneError}</AlertDescription>
            </Alert>
          )}

          {/* Bouton test */}
          <Button
            onClick={handleTestMicrophone}
            disabled={isTestingMicrophone || devices.microphones.length === 0}
            className="w-full"
          >
            {isTestingMicrophone ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Tester le microphone
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test haut-parleurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {speakerStatus === 'success' ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              <CardTitle>Haut-parleurs</CardTitle>
            </div>
            {getStatusIcon(speakerStatus)}
          </div>
          <CardDescription>Écoutez le son de test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleTestSpeaker}
            disabled={isPlayingTestSound}
            className="w-full"
          >
            {isPlayingTestSound ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lecture...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Jouer un son de test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test réseau */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {networkQuality === 'critical' ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
              <CardTitle>Qualité réseau</CardTitle>
            </div>
            {getStatusIcon(networkStatus)}
          </div>
          <CardDescription>Vérification de votre connexion internet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {networkStatus === 'success' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Qualité</span>
              {getNetworkQualityBadge()}
            </div>
          )}

          {networkLatency > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Latence</span>
              <span className="font-medium">{networkLatency} ms</span>
            </div>
          )}

          <Button
            onClick={handleTestNetwork}
            disabled={networkStatus === 'testing'}
            className="w-full"
          >
            {networkStatus === 'testing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Tester la connexion
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Résultat global */}
      {allTestsPassed && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Tous les tests sont réussis ! Vous êtes prêt pour la téléconsultation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
