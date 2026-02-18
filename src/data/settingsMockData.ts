import {
  UserAccount,
  Replacement,
  AgendaConfig,
  OnlineVisibility,
  ConsultationLocation,
  ConsultationMotifConfig,
  MotifCategory,
  InternalInstruction,
  PatientConsigne,
  PatientQuestion,
  RdvDocument,
  RdvField,
  MessagingConfig,
  SecurityLogEntry,
  PractitionerProfile,
  PrivacySettings,
} from '@/types/settings';

export const mockUserAccounts: UserAccount[] = [
  {
    id: 'user-1',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'dr.martin@medisync.fr',
    role: 'admin',
    agendaCount: 1,
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    firstName: 'Pierre',
    lastName: 'Dubois',
    email: 'dr.dubois@medisync.fr',
    role: 'practitioner',
    agendaCount: 1,
    isActive: true,
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'user-3',
    firstName: 'Claire',
    lastName: 'Renard',
    email: 'c.renard@medisync.fr',
    role: 'secretary',
    agendaCount: 0,
    isActive: true,
    createdAt: new Date('2024-06-01'),
  },
];

export const mockReplacements: Replacement[] = [
  {
    id: 'repl-1',
    firstName: 'Antoine',
    lastName: 'Lefevre',
    email: 'a.lefevre@medisync.fr',
    specialty: 'Medecine Generale',
    phone: '06 11 22 33 44',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-15'),
    isActive: false,
  },
];

export const mockAgendaConfigs: AgendaConfig[] = [
  {
    id: 'agenda-1',
    name: 'Dr Sophie Martin',
    type: 'practitioner',
    practitionerId: 'pract-1',
    practitionerName: 'Dr Sophie Martin',
    specialty: 'Medecine Generale',
    siteId: 'site-1',
    siteName: 'Centre Medical Saint-Michel',
    isOnlineBookable: true,
    slotDuration: 20,
    color: '#0D9488',
    isActive: true,
  },
  {
    id: 'agenda-2',
    name: 'Dr Pierre Dubois',
    type: 'practitioner',
    practitionerId: 'pract-2',
    practitionerName: 'Dr Pierre Dubois',
    specialty: 'Cardiologie',
    siteId: 'site-1',
    siteName: 'Centre Medical Saint-Michel',
    isOnlineBookable: true,
    slotDuration: 30,
    color: '#3B82F6',
    isActive: true,
  },
  {
    id: 'agenda-3',
    name: 'Salle Imagerie',
    type: 'room',
    siteId: 'site-1',
    siteName: 'Centre Medical Saint-Michel',
    isOnlineBookable: false,
    slotDuration: 30,
    color: '#8B5CF6',
    isActive: true,
  },
];

export const mockOnlineVisibility: OnlineVisibility = {
  isProfileVisible: true,
  isOnlineBookingEnabled: true,
  keywords: ['medecin generaliste', 'consultation', 'suivi'],
  blockedPatients: [],
  bookingDelay: 0,
  cancellationDelay: 4,
};

export const mockLocations: ConsultationLocation[] = [
  {
    id: 'loc-1',
    address: '45 Avenue de la Liberte, 75011 Paris',
    establishmentName: 'Centre Medical Saint-Michel',
    shortName: 'Saint-Michel',
    phone: '01 42 55 67 89',
    hasElevator: true,
    hasAccessibleEntrance: true,
    floor: 'RDC',
    parking: 'street',
    intercom: 'Cabinet Medical',
    accessInfo: 'Porte a gauche apres le hall',
  },
  {
    id: 'loc-2',
    address: '12 Place de la Republique, 75003 Paris',
    establishmentName: 'Cabinet Republique',
    shortName: 'Republique',
    phone: '01 43 22 11 00',
    hasElevator: false,
    hasAccessibleEntrance: false,
    floor: '2eme etage',
    parking: 'paid',
  },
];

export const mockMotifConfigs: ConsultationMotifConfig[] = [
  {
    id: 'motif-1',
    name: 'Consultation de suivi de medecine generale',
    color: '#EF4444',
    duration: 20,
    isOnlineBookable: true,
    category: 'Consultations',
  },
  {
    id: 'motif-2',
    name: 'Premiere consultation de medecine generale',
    color: '#F59E0B',
    duration: 30,
    isOnlineBookable: true,
    category: 'Consultations',
  },
  {
    id: 'motif-3',
    name: 'Consultation de pediatrie',
    color: '#10B981',
    duration: 25,
    isOnlineBookable: true,
    category: 'Consultations',
  },
  {
    id: 'motif-4',
    name: 'Urgence',
    color: '#3B82F6',
    duration: 30,
    isOnlineBookable: false,
  },
  {
    id: 'motif-5',
    name: 'Visite a domicile',
    color: '#22C55E',
    duration: 45,
    isOnlineBookable: false,
  },
];

export const mockMotifCategories: MotifCategory[] = [
  { id: 'cat-1', name: 'Consultations', order: 1 },
  { id: 'cat-2', name: 'Actes techniques', order: 2 },
];

export const mockInternalInstructions: InternalInstruction[] = [
  {
    id: 'instr-1',
    title: 'Preparation salle ECG',
    content: 'Verifier que l\'appareil ECG est branche et calibre avant le rendez-vous.',
    motifIds: ['motif-1'],
    isActive: true,
  },
];

export const mockConsignes: PatientConsigne[] = [
  {
    id: 'cons-1',
    title: 'Rappel documents',
    content: 'Merci de vous munir de votre carte vitale et d\'une piece d\'identite.',
    motifIds: [],
    type: 'before',
    isActive: true,
  },
  {
    id: 'cons-2',
    title: 'Jeune avant prise de sang',
    content: 'Veuillez etre a jeun depuis 12 heures avant votre rendez-vous.',
    motifIds: ['motif-1'],
    type: 'before',
    isActive: true,
  },
];

export const mockQuestions: PatientQuestion[] = [
  {
    id: 'q-1',
    question: 'Est-ce votre premiere visite dans notre cabinet ?',
    type: 'yesno',
    isRequired: true,
    motifIds: [],
    isActive: true,
  },
  {
    id: 'q-2',
    question: 'Avez-vous des allergies connues ?',
    type: 'text',
    isRequired: false,
    motifIds: [],
    isActive: true,
  },
  {
    id: 'q-3',
    question: 'Motif principal de votre consultation',
    type: 'text',
    isRequired: true,
    motifIds: ['motif-2'],
    isActive: true,
  },
];

export const mockRdvDocuments: RdvDocument[] = [
  {
    id: 'doc-1',
    name: 'Carte vitale',
    description: 'A presenter obligatoirement',
    motifIds: [],
    isRequired: true,
  },
  {
    id: 'doc-2',
    name: 'Resultats d\'analyses',
    description: 'Si disponibles',
    motifIds: ['motif-1', 'motif-3'],
    isRequired: false,
  },
];

export const mockRdvFields: RdvField[] = [
  { id: 'field-1', label: 'Nom', type: 'text', isRequired: true, isActive: true, order: 1 },
  { id: 'field-2', label: 'Prenom', type: 'text', isRequired: true, isActive: true, order: 2 },
  { id: 'field-3', label: 'Date de naissance', type: 'date', isRequired: true, isActive: true, order: 3 },
  { id: 'field-4', label: 'Telephone', type: 'phone', isRequired: true, isActive: true, order: 4 },
  { id: 'field-5', label: 'Email', type: 'email', isRequired: false, isActive: true, order: 5 },
];

export const mockMessagingConfig: MessagingConfig = {
  confirmationEmail: true,
  reminderEmailJ7: true,
  smsNotification: true,
  reminderEmailJ1: true,
  customMessage: '',
};

export const mockSecurityLog: SecurityLogEntry[] = [
  {
    id: 'log-1',
    action: 'Connexion',
    details: 'Connexion reussie',
    ipAddress: '192.168.1.42',
    timestamp: new Date('2026-02-18T08:30:00'),
    userId: 'user-1',
    userName: 'Dr Sophie Martin',
  },
  {
    id: 'log-2',
    action: 'Modification profil',
    details: 'Mise a jour du numero de telephone',
    ipAddress: '192.168.1.42',
    timestamp: new Date('2026-02-17T14:15:00'),
    userId: 'user-1',
    userName: 'Dr Sophie Martin',
  },
  {
    id: 'log-3',
    action: 'Connexion',
    details: 'Connexion reussie',
    ipAddress: '10.0.0.5',
    timestamp: new Date('2026-02-16T09:00:00'),
    userId: 'user-2',
    userName: 'Dr Pierre Dubois',
  },
];

export const mockPractitionerProfile: PractitionerProfile = {
  firstName: 'Sophie',
  lastName: 'Martin',
  title: 'Dr',
  email: 'dr.martin@medisync.fr',
  phone: '06 12 34 56 78',
  specialty: 'Medecine Generale',
  rppsNumber: '10003456789',
  adeliNumber: '751234567',
};

export const mockPrivacySettings: PrivacySettings = {
  googleBusinessActive: true,
  thirdPartyAdsActive: false,
  dataRetentionYears: 10,
  patientDataManagement: true,
  cookieConsent: true,
};
