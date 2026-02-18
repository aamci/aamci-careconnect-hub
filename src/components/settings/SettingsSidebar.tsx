import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  UserCheck,
  CalendarDays,
  Eye,
  MapPin,
  CalendarCog,
  LayoutList,
  FolderOpen,
  ClipboardList,
  FileText,
  MessageCircleQuestion,
  FileCheck,
  FormInput,
  Mail,
  BarChart3,
  Shield,
  Database,
  ChevronDown,
  User,
  Lock,
  ScrollText,
  PenTool,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
  path?: string;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
}

const settingsNav: NavGroup[] = [
  {
    id: 'accueil',
    label: 'Accueil',
    icon: Home,
    path: '/settings',
  },
  {
    id: 'cabinet',
    label: 'Mon cabinet',
    icon: Building2,
    children: [
      { id: 'comptes', label: 'Comptes utilisateurs et autorisations', path: '/settings/comptes' },
      { id: 'remplacants', label: 'Remplacants', path: '/settings/remplacants' },
      { id: 'agendas', label: 'Agendas', path: '/settings/agendas' },
      { id: 'visibilite', label: 'Visibilite et reservation en ligne', path: '/settings/visibilite' },
      { id: 'lieux', label: 'Lieux de consultation', path: '/settings/lieux' },
    ],
  },
  {
    id: 'rdv',
    label: 'Gestion des rendez-vous',
    icon: CalendarCog,
    children: [
      { id: 'motifs', label: 'Motifs de consultation', path: '/settings/motifs' },
      { id: 'categories', label: 'Categories de motifs de consultation', path: '/settings/categories' },
      { id: 'instructions', label: 'Instructions internes pour la reservation hors ligne', path: '/settings/instructions' },
      { id: 'synthese-consignes', label: 'Synthese des consignes et questions', path: '/settings/synthese-consignes' },
      { id: 'consignes', label: 'Consignes', path: '/settings/consignes' },
      { id: 'questions', label: 'Questions', path: '/settings/questions' },
      { id: 'documents-rdv', label: 'Documents', path: '/settings/documents-rdv' },
      { id: 'champs-rdv', label: 'Champs de prise de rendez-vous', path: '/settings/champs-rdv' },
    ],
  },
  {
    id: 'messagerie',
    label: 'Messagerie patients et communication',
    icon: Mail,
    path: '/settings/messagerie',
  },
  {
    id: 'avances',
    label: 'Parametres avances',
    icon: Database,
    children: [
      { id: 'statistiques', label: 'Statistiques', path: '/settings/statistiques' },
      { id: 'identitovigilance', label: 'Identitovigilance', path: '/settings/identitovigilance' },
      { id: 'donnees', label: 'Donnees', path: '/settings/donnees' },
    ],
  },
];

const profileNav: NavGroup[] = [
  { id: 'mon-compte', label: 'Mon compte', icon: User, path: '/settings/mon-compte' },
  { id: 'confidentialite', label: 'Centre de confidentialite', icon: Lock, path: '/settings/confidentialite' },
  { id: 'journal-securite', label: 'Journal de securite', icon: ScrollText, path: '/settings/journal-securite' },
  { id: 'signature', label: 'Ma signature', icon: PenTool, path: '/settings/signature' },
];

interface SettingsSidebarProps {
  onNavigate?: () => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    // Auto-expand the group that contains the current path
    const current = location.pathname;
    const found = settingsNav.find(
      (g) => g.children?.some((c) => current === c.path)
    );
    return found ? [found.id] : [];
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const isActive = (path: string) => {
    if (path === '/settings') {
      return location.pathname === '/settings';
    }
    return location.pathname === path;
  };

  const isGroupActive = (group: NavGroup) => {
    if (group.path) return isActive(group.path);
    return group.children?.some((c) => isActive(c.path)) ?? false;
  };

  const renderNavItem = (item: NavItem) => (
    <button
      key={item.id}
      onClick={() => handleNavClick(item.path)}
      className={cn(
        'w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors truncate',
        isActive(item.path)
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {item.label}
    </button>
  );

  const renderNavGroup = (group: NavGroup) => {
    const hasChildren = group.children && group.children.length > 0;
    const isExpanded = expandedGroups.includes(group.id);
    const Icon = group.icon;
    const active = isGroupActive(group);

    return (
      <div key={group.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleGroup(group.id);
            } else if (group.path) {
              handleNavClick(group.path);
            }
          }}
          className={cn(
            'w-full flex items-center gap-2 py-2 px-2 rounded-md text-sm transition-colors',
            active
              ? 'text-primary font-medium'
              : 'text-foreground hover:bg-muted'
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left truncate">{group.label}</span>
          {hasChildren && (
            <ChevronDown
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="ml-4 pl-2 border-l border-border/50 space-y-0.5 mt-1 mb-2">
            {group.children!.map(renderNavItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Settings Header */}
      <div className="p-4 pb-2">
        <h2 className="text-base font-semibold text-foreground">Parametres</h2>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {settingsNav.map(renderNavGroup)}

        {/* Separator */}
        <div className="my-3 border-t border-border" />

        {/* Profile Nav */}
        {profileNav.map(renderNavGroup)}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
