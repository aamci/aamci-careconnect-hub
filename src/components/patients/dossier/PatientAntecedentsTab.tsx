import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { 
  Plus, 
  Heart,
  Stethoscope,
  Scissors,
  AlertTriangle,
  Users,
  Cigarette,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OutletContext {
  patient: Patient;
}

interface AntecedentSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: string[];
  addLabel: string;
}

const PatientAntecedentsTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();

  // Mock data for antecedents
  const sections: AntecedentSection[] = [
    {
      id: 'medical',
      title: 'Antécédents médicaux',
      icon: Stethoscope,
      items: [],
      addLabel: 'Ajouter un antécédent médical'
    },
    {
      id: 'cardiovascular',
      title: 'Appareil cardiovasculaire',
      icon: Heart,
      items: [],
      addLabel: 'Ajouter une information'
    },
    {
      id: 'surgical',
      title: 'Antécédents chirurgicaux',
      icon: Scissors,
      items: [],
      addLabel: 'Ajouter un antécédent chirurgical'
    },
    {
      id: 'allergies',
      title: 'Allergies',
      icon: AlertTriangle,
      items: [],
      addLabel: 'Ajouter une allergie'
    },
    {
      id: 'family',
      title: 'Antécédents familiaux',
      icon: Users,
      items: [],
      addLabel: 'Ajouter un antécédent familial'
    },
    {
      id: 'lifestyle',
      title: 'Mode de vie',
      icon: Cigarette,
      items: [],
      addLabel: 'Ajouter une information'
    }
  ];

  const SectionRow: React.FC<{ section: AntecedentSection }> = ({ section }) => {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = section.icon;

    return (
      <div 
        className={cn(
          'flex items-center justify-between p-4 border-b border-border last:border-b-0',
          'hover:bg-muted/30 transition-colors cursor-pointer group'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
            {section.items.length > 0 ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                {section.items.length} élément{section.items.length > 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/70 italic mt-0.5">
                Aucune donnée
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              'h-8 gap-1.5 text-xs font-medium transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ajouter</span>
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Antécédents et mode de vie</h2>
      </div>

      {/* Main Sections List */}
      <Card className="mb-6">
        <CardContent className="p-0">
          {sections.map((section) => (
            <SectionRow key={section.id} section={section} />
          ))}
        </CardContent>
      </Card>

      {/* Memo Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Mémo
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5">
              Ouvrir
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="p-4 rounded-lg bg-muted/30 border border-border min-h-[80px]">
            <p className="text-sm text-muted-foreground italic">
              Aucun mémo pour ce patient. Cliquez sur "Ouvrir" pour ajouter des notes importantes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientAntecedentsTab;
