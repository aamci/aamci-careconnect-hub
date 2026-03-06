/**
 * VideoControls - Teleconsultation media controls bar
 * Explicit dark-theme styling for VideoRoom bg-gray-800/900 context.
 * variant="secondary" is NOT used because bg-secondary blends with the VideoRoom background.
 */

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

// Shared base style for all control buttons
const CONTROL_BASE =
  'h-12 w-12 rounded-full p-0 flex items-center justify-center transition-all duration-150 border-0 outline-none focus-visible:ring-2 focus-visible:ring-white/30';

// Media active (mic on / camera on) - clearly visible on dark bg
const MEDIA_ACTIVE =
  `${CONTROL_BASE} bg-gray-600 hover:bg-gray-500 text-white cursor-pointer`;

// Media muted/off - red to signal disabled state
const MEDIA_OFF =
  `${CONTROL_BASE} bg-red-500 hover:bg-red-600 text-white cursor-pointer`;

// Screen share active - blue highlight
const SHARE_ACTIVE =
  `${CONTROL_BASE} bg-blue-500 hover:bg-blue-600 text-white cursor-pointer`;

// Utility button (notes, docs, settings)
const UTILITY_BTN =
  `${CONTROL_BASE} bg-gray-600/70 hover:bg-gray-500 text-gray-300 hover:text-white cursor-pointer`;

// Hang up button
const HANGUP_BTN =
  `${CONTROL_BASE} bg-red-600 hover:bg-red-700 text-white cursor-pointer`;

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
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggleMicrophone}
            className={isMuted ? MEDIA_OFF : MEDIA_ACTIVE}
            type="button"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700 text-xs">
          {isMuted ? 'Activer le microphone' : 'Couper le microphone'}
        </TooltipContent>
      </Tooltip>

      {/* Camera */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggleCamera}
            className={!isVideoEnabled ? MEDIA_OFF : MEDIA_ACTIVE}
            type="button"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700 text-xs">
          {isVideoEnabled ? 'Desactiver la camera' : 'Activer la camera'}
        </TooltipContent>
      </Tooltip>

      {/* Screen share (practitioner only) */}
      {isPractitioner && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleScreenShare}
              className={isScreenSharing ? SHARE_ACTIVE : UTILITY_BTN}
              type="button"
            >
              {isScreenSharing ? (
                <MonitorX className="h-5 w-5" />
              ) : (
                <MonitorUp className="h-5 w-5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700 text-xs">
            {isScreenSharing ? 'Arreter le partage' : 'Partager l\'ecran'}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Notes (practitioner only) */}
      {isPractitioner && onOpenNotes && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenNotes}
              className={UTILITY_BTN}
              type="button"
            >
              <FileText className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700 text-xs">
            Notes de consultation
          </TooltipContent>
        </Tooltip>
      )}

      {/* Document sharing (practitioner only) */}
      {isPractitioner && onOpenDocuments && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenDocuments}
              className={UTILITY_BTN}
              type="button"
            >
              <FolderOpen className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700 text-xs">
            Partager des documents
          </TooltipContent>
        </Tooltip>
      )}

      {/* Device settings */}
      {devices && (onSwitchCamera || onSwitchMicrophone) && (
        <DropdownMenu open={showDeviceMenu} onOpenChange={setShowDeviceMenu}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  className={UTILITY_BTN}
                  type="button"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            {!showDeviceMenu && (
              <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700 text-xs">
                Parametres audio/video
              </TooltipContent>
            )}
          </Tooltip>
          <DropdownMenuContent align="end" className="w-64 bg-gray-800 border-gray-700 text-white">
            {/* Cameras */}
            {onSwitchCamera && devices.cameras.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2 text-gray-400">
                  <Camera className="h-4 w-4" />
                  Camera
                </DropdownMenuLabel>
                {devices.cameras.map((camera) => (
                  <DropdownMenuItem
                    key={camera.deviceId}
                    onClick={() => onSwitchCamera(camera.deviceId)}
                    className="text-gray-200 focus:bg-gray-700 focus:text-white"
                  >
                    {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-gray-700" />
              </>
            )}

            {/* Microphones */}
            {onSwitchMicrophone && devices.microphones.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2 text-gray-400">
                  <Mic className="h-4 w-4" />
                  Microphone
                </DropdownMenuLabel>
                {devices.microphones.map((mic) => (
                  <DropdownMenuItem
                    key={mic.deviceId}
                    onClick={() => onSwitchMicrophone(mic.deviceId)}
                    className="text-gray-200 focus:bg-gray-700 focus:text-white"
                  >
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-gray-700" />
              </>
            )}

            {/* Speakers */}
            {devices.speakers.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2 text-gray-400">
                  <Volume2 className="h-4 w-4" />
                  Haut-parleurs
                </DropdownMenuLabel>
                {devices.speakers.map((speaker) => (
                  <DropdownMenuItem
                    key={speaker.deviceId}
                    className="text-gray-200 focus:bg-gray-700 focus:text-white"
                  >
                    {speaker.label || `Haut-parleur ${speaker.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-full">
          <Circle className="h-3 w-3 fill-current animate-pulse" />
          <span className="text-sm font-medium">REC</span>
        </div>
      )}

      {/* Separator */}
      <div className="h-8 w-px bg-gray-600" />

      {/* Hang up */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onHangUp}
            className={HANGUP_BTN}
            type="button"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700 text-xs">
          Raccrocher
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
