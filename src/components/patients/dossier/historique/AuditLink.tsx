import React from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditLinkProps {
  onViewAudit: () => void;
}

const AuditLink: React.FC<AuditLinkProps> = ({ onViewAudit }) => {
  return (
    <div className="mt-6 space-y-4">
      {/* Conservation notice */}
      <p className="text-xs text-muted-foreground">
        Conformément à la période de conservation des données que vous avez choisie, 
        les rendez-vous antérieurs à 10 ans sont progressivement supprimés de votre historique.{' '}
        <button className="text-primary hover:underline">En savoir plus</button>
      </p>
      
      {/* Audit link */}
      <Button
        variant="ghost"
        size="sm"
        className="text-primary hover:text-primary hover:bg-primary/10 gap-2 -ml-2"
        onClick={onViewAudit}
      >
        <History className="h-4 w-4" />
        Voir les modifications de rendez-vous
      </Button>
    </div>
  );
};

export default AuditLink;
