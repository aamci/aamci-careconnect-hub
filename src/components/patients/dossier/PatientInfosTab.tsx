import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield,
  Building,
  Calendar,
  FileText,
  Edit,
  CreditCard,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OutletContext {
  patient: Patient;
}

const PatientInfosTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();

  const InfoRow: React.FC<{ label: string; value?: string | null; className?: string }> = ({ 
    label, 
    value,
    className = ''
  }) => (
    <div className={`flex items-start justify-between py-2.5 ${className}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
        {value || <span className="text-muted-foreground/50 italic">Non renseigné</span>}
      </span>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Informations administratives</h2>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identité */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <User className="h-4 w-4" />
              Identité
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              <InfoRow label="Civilité" value={patient.gender === 'male' ? 'Monsieur' : 'Madame'} />
              <InfoRow label="Nom de naissance" value={patient.lastName} />
              <InfoRow label="Nom d'usage" value={patient.usedLastName} />
              <InfoRow label="Prénom" value={patient.firstName} />
              <InfoRow label="Prénom usuel" value={patient.usedFirstName} />
              <InfoRow label="Date de naissance" value={format(patient.dateOfBirth, 'dd MMMM yyyy', { locale: fr })} />
              <InfoRow label="Lieu de naissance" value={patient.birthPlace} />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              <InfoRow label="Téléphone principal" value={patient.phone} />
              <InfoRow label="Téléphone secondaire" value={patient.phoneSecondary} />
              <InfoRow label="Email" value={patient.email} />
            </div>
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              <InfoRow label="Adresse" value={patient.address} />
              <InfoRow label="Code postal" value={patient.postalCode} />
              <InfoRow label="Ville" value={patient.city} />
            </div>
          </CardContent>
        </Card>

        {/* Couverture sociale */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Couverture sociale
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              <InfoRow label="N° Sécurité sociale" value={patient.insuranceNumber} />
              <InfoRow label="Organisme" value={patient.insuranceProvider} />
              <InfoRow label="Mutuelle" value={null} />
            </div>
          </CardContent>
        </Card>

        {/* Médical */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Informations médicales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              <InfoRow label="Médecin traitant" value={patient.referringDoctor} />
              <InfoRow label="Groupe sanguin" value={null} />
              <InfoRow label="Taille" value={null} />
              <InfoRow label="Poids" value={null} />
            </div>
          </CardContent>
        </Card>

        {/* Administratif */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Données administratives
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              <InfoRow label="Identifiant patient" value={patient.id} />
              <InfoRow label="Date de création" value={format(patient.createdAt, 'dd/MM/yyyy HH:mm', { locale: fr })} />
              <InfoRow label="Dernière modification" value={format(patient.updatedAt, 'dd/MM/yyyy HH:mm', { locale: fr })} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {patient.notes && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Remarques générales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-foreground whitespace-pre-wrap">{patient.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientInfosTab;
