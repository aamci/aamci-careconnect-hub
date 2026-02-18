import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Settings2,
  Users,
  KeyRound,
  Link2,
  UserPlus,
  Eye,
  CalendarPlus,
  Ban,
  Bell,
  MapPin,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currentPractitioner } from '@/data/mockData';

interface QuickLink {
  label: string;
  path: string;
}

interface QuickCard {
  icon: React.ElementType;
  title: string;
  links: QuickLink[];
}

const SettingsAccueil: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const etablissementCards: QuickCard[] = [
    {
      icon: Settings2,
      title: 'Gerez votre etablissement',
      links: [
        { label: 'Ajouter un nouveau lieu d\'exercice', path: '/settings/lieux' },
        { label: 'Modifier les details de vos agendas', path: '/settings/agendas' },
      ],
    },
    {
      icon: Users,
      title: 'Gerez les acces dans votre etablissement',
      links: [
        { label: 'Creer un compte pour un nouveau collegue', path: '/settings/comptes' },
        { label: 'Ajouter ou retirer des droits d\'acces', path: '/settings/comptes' },
      ],
    },
    {
      icon: Link2,
      title: 'Ameliorez la collaboration dans l\'etablissement',
      links: [
        { label: 'Permettre a vos collegues d\'acceder a votre agenda', path: '/settings/agendas' },
        { label: 'Ajouter un remplacant', path: '/settings/remplacants' },
      ],
    },
  ];

  const rdvCards: QuickCard[] = [
    {
      icon: Eye,
      title: 'Rendez votre profil visible en ligne',
      links: [
        { label: 'Activer la reservation en ligne pour les agendas', path: '/settings/visibilite' },
        { label: 'Modifier les mots-cles pour aider les patients', path: '/settings/visibilite' },
      ],
    },
    {
      icon: CalendarPlus,
      title: 'Configurez la prise de rendez-vous',
      links: [
        { label: 'Creer des motifs de consultation', path: '/settings/motifs' },
        { label: 'Empecher certains patients de prendre RDV', path: '/settings/visibilite' },
      ],
    },
    {
      icon: Bell,
      title: 'Reduisez les RDV non honores',
      links: [
        { label: 'Rappeler les RDV aux patients', path: '/settings/messagerie' },
        { label: 'Mettre a jour votre adresse et vos horaires', path: '/settings/lieux' },
      ],
    },
  ];

  const patientCards: QuickCard[] = [
    {
      icon: KeyRound,
      title: 'Securisez les donnees patients',
      links: [
        { label: 'Configurer l\'identitovigilance', path: '/settings/identitovigilance' },
        { label: 'Gerer la politique de conservation', path: '/settings/donnees' },
      ],
    },
  ];

  const renderCard = (card: QuickCard) => (
    <Card key={card.title} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <card.icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-t border-border pt-3 space-y-2">
          {card.links.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className="block text-sm text-primary hover:underline text-left"
            >
              {link.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          Bonjour {currentPractitioner.title} {currentPractitioner.firstName} {currentPractitioner.lastName},
        </h1>
        <p className="text-lg font-bold text-foreground">
          adaptez la plateforme a vos besoins
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Que voulez-vous faire ?</p>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Creer des motifs de consultation, modifier les droits d'acces, gerer la messagerie patient"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Etablissement Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Etablissement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {etablissementCards.map(renderCard)}
        </div>
      </section>

      {/* Rendez-vous Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Rendez-vous</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rdvCards.map(renderCard)}
        </div>
      </section>

      {/* Patients Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Patients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patientCards.map(renderCard)}
        </div>
      </section>
    </div>
  );
};

export default SettingsAccueil;
