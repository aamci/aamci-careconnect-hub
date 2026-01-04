import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Phone, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { currentPractitioner, mockSites } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface PractitionerInfoPanelProps {
  className?: string;
}

const PractitionerInfoPanel: React.FC<PractitionerInfoPanelProps> = ({ className }) => {
  const site = mockSites[0];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Practitioner Card */}
      <div className="panel-card p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-accent">
            <AvatarFallback className="bg-accent/10 text-accent font-semibold">
              {currentPractitioner.firstName[0]}{currentPractitioner.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">
                {currentPractitioner.title} {currentPractitioner.lastName}
              </h3>
              <ExternalLink className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">{currentPractitioner.specialty}</p>
          </div>
        </div>

        {/* Search placeholder */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Rechercher un mot-clé. 'Entrée' pour suivant"
            className="w-full text-xs px-3 py-2 bg-muted/50 border border-border rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Cabinet Info */}
      <div className="panel-card p-4">
        <button className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <span>Informations sur le cabinet</span>
          <span className="text-accent">▼</span>
        </button>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Nombre d'appels ce mois-ci :</span>
            <span className="font-medium">0</span>
          </div>
          <button className="text-xs text-accent hover:underline">
            Liste des soignants avec télésecrétariat
          </button>
        </div>
      </div>
    </div>
  );
};

export default PractitionerInfoPanel;
