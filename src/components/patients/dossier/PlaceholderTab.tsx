import React from 'react';
import { FileText } from 'lucide-react';

interface PlaceholderTabProps {
  title: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title }) => {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground text-sm">
          Cette section sera disponible prochainement.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderTab;
