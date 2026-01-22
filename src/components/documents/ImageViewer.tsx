/**
 * Visualiseur d'images avec contrôles de zoom et rotation
 * Support navigation latérale pour images d'une même série
 */

import { useState } from 'react';
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface ImageViewerProps {
  src: string;
  alt?: string;
  filename?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

export function ImageViewer({
  src,
  alt = 'Image',
  filename = 'image.png',
  onDownload,
  onPrint
}: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = src;
      link.download = filename;
      link.click();
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.open(src, '_blank');
    }
  };

  return (
    <div
      className={`flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-full'
      }`}
    >
      {/* Toolbar */}
      <div
        className={`flex items-center justify-between gap-2 p-3 border-b ${
          isFullscreen ? 'bg-black text-white' : 'bg-background'
        }`}
      >
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isFullscreen ? 'ghost' : 'ghost'}
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 25}
                  className={isFullscreen ? 'text-white hover:bg-white/20' : ''}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom arrière</p>
              </TooltipContent>
            </Tooltip>

            <span className="px-3 text-sm font-medium">{zoom}%</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isFullscreen ? 'ghost' : 'ghost'}
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 300}
                  className={isFullscreen ? 'text-white hover:bg-white/20' : ''}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom avant</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isFullscreen ? 'ghost' : 'ghost'}
                  size="icon"
                  onClick={handleRotate}
                  className={isFullscreen ? 'text-white hover:bg-white/20' : ''}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rotation</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant={isFullscreen ? 'ghost' : 'outline'}
              size="sm"
              onClick={handleReset}
              className={isFullscreen ? 'text-white hover:bg-white/20' : ''}
            >
              Réinitialiser
            </Button>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isFullscreen ? 'ghost' : 'ghost'}
                  size="icon"
                  onClick={handleFullscreen}
                  className={isFullscreen ? 'text-white hover:bg-white/20' : ''}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? 'Quitter plein écran' : 'Plein écran'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isFullscreen ? 'ghost' : 'ghost'}
                  size="icon"
                  onClick={handlePrint}
                  className={isFullscreen ? 'text-white hover:bg-white/20' : ''}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Imprimer</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isFullscreen ? 'ghost' : 'ghost'}
                  size="icon"
                  onClick={handleDownload}
                  className={isFullscreen ? 'text-white hover:bg-white/20' : ''}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Télécharger</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Image Viewer */}
      <div
        className={`flex-1 overflow-auto ${
          isFullscreen ? 'bg-black' : 'bg-muted/30'
        }`}
      >
        <div className="flex items-center justify-center min-h-full p-4">
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center'
            }}
          />
        </div>
      </div>
    </div>
  );
}
