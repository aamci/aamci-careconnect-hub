/**
 * VideoControls - Contrôles vidéo pour la téléconsultation
 * Boutons: mute, caméra, partage d'écran, paramètres, raccrocher
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorX,
  PhoneOff,
  Settings,
  Camera,
  Volume2,
  FileText,
  FolderOpen,
  Circle,
} from 'lucide-react';
import type { MediaDeviceState } from '@/types/webrtc';

interface VideoControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isRecording?: boolean;
  devices?: MediaDeviceState;
  onToggleMicrophone: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onSwitchCamera?: (deviceId: string) => void;
  onSwitchMicrophone?: (deviceId: string) => void;
  onHangUp: () => void;
  onOpenNotes?: () => void;
  onOpenDocuments?: () => void;
  isPractitioner?: boolean;
  className?: string;
}

export function VideoControls({
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  isRecording = false,
  devices,
  onToggleMicrophone,
  onToggleCamera,
  onToggleScreenShare,
  onSwitchCamera,
  onSwitchMicrophone,
  onHangUp,
  onOpenNotes,
  onOpenDocuments,
  isPractitioner = false,
  className,
}: VideoControlsProps) {
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      {/* Microphone */}
      <Button
        onClick={onToggleMicrophone}
        size="lg"
        variant={isMuted ? 'destructive' : 'secondary'}
        className={cn(
          'h-12 w-12 rounded-full p-0',
          isMuted && 'bg-red-500 hover:bg-red-600'
        )}
        title={isMuted ? 'Activer le microphone' : 'Couper le microphone'}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      {/* Caméra */}
      <Button
        onClick={onToggleCamera}
        size="lg"
        variant={!isVideoEnabled ? 'destructive' : 'secondary'}
        className={cn(
          'h-12 w-12 rounded-full p-0',
          !isVideoEnabled && 'bg-red-500 hover:bg-red-600'
        )}
        title={isVideoEnabled ? 'Désactiver la caméra' : 'Activer la caméra'}
      >
        {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>

      {/* Partage d'écran (seulement pour le praticien) */}
      {isPractitioner && (
        <Button
          onClick={onToggleScreenShare}
          size="lg"
          variant={isScreenSharing ? 'default' : 'secondary'}
          className={cn(
            'h-12 w-12 rounded-full p-0',
            isScreenSharing && 'bg-blue-500 hover:bg-blue-600'
          )}
          title={isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran'}
        >
          {isScreenSharing ? (
            <MonitorX className="h-5 w-5" />
          ) : (
            <MonitorUp className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Notes (seulement pour le praticien) */}
      {isPractitioner && onOpenNotes && (
        <Button
          onClick={onOpenNotes}
          size="lg"
          variant="secondary"
          className="h-12 w-12 rounded-full p-0"
          title="Ouvrir les notes"
        >
          <FileText className="h-5 w-5" />
        </Button>
      )}

      {/* Documents (seulement pour le praticien) */}
      {isPractitioner && onOpenDocuments && (
        <Button
          onClick={onOpenDocuments}
          size="lg"
          variant="secondary"
          className="h-12 w-12 rounded-full p-0"
          title="Partager des documents"
        >
          <FolderOpen className="h-5 w-5" />
        </Button>
      )}

      {/* Paramètres devices */}
      {devices && (onSwitchCamera || onSwitchMicrophone) && (
        <DropdownMenu open={showDeviceMenu} onOpenChange={setShowDeviceMenu}>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 w-12 rounded-full p-0"
              title="Paramètres"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {/* Caméras */}
            {onSwitchCamera && devices.cameras.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Caméra
                </DropdownMenuLabel>
                {devices.cameras.map((camera) => (
                  <DropdownMenuItem
                    key={camera.deviceId}
                    onClick={() => onSwitchCamera(camera.deviceId)}
                  >
                    {camera.label || `Caméra ${camera.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Microphones */}
            {onSwitchMicrophone && devices.microphones.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Microphone
                </DropdownMenuLabel>
                {devices.microphones.map((mic) => (
                  <DropdownMenuItem
                    key={mic.deviceId}
                    onClick={() => onSwitchMicrophone(mic.deviceId)}
                  >
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Haut-parleurs */}
            {devices.speakers.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Haut-parleurs
                </DropdownMenuLabel>
                {devices.speakers.map((speaker) => (
                  <DropdownMenuItem key={speaker.deviceId}>
                    {speaker.label || `Haut-parleur ${speaker.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Indicateur d'enregistrement */}
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-full">
          <Circle className="h-3 w-3 fill-current animate-pulse" />
          <span className="text-sm font-medium">REC</span>
        </div>
      )}

      {/* Separator */}
      <div className="h-8 w-px bg-gray-300" />

      {/* Raccrocher */}
      <Button
        onClick={onHangUp}
        size="lg"
        variant="destructive"
        className="h-12 w-12 rounded-full p-0 bg-red-600 hover:bg-red-700"
        title="Raccrocher"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}
