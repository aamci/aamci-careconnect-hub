import { 
  Patient, 
  Appointment, 
  Practitioner, 
  AppointmentMotif, 
  Note, 
  Task,
  Site,
  Room 
} from '@/types';
import { addDays, addMinutes, setHours, setMinutes, startOfWeek } from 'date-fns';

// Generate consistent IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Sites & Rooms
export const mockSites: Site[] = [
  {
    id: 'site-1',
    name: 'Centre Médical Saint-Michel',
    address: '45 Avenue de la Liberté',
    city: 'Paris',
    postalCode: '75011',
    phone: '01 42 55 67 89',
    rooms: [
      { id: 'room-1', name: 'Salle 1', siteId: 'site-1' },
      { id: 'room-2', name: 'Salle 2', siteId: 'site-1' },
      { id: 'room-3', name: 'Salle Imagerie', siteId: 'site-1', equipment: ['Échographe', 'ECG'] },
    ],
  },
  {
    id: 'site-2',
    name: 'Cabinet République',
    address: '12 Place de la République',
    city: 'Paris',
    postalCode: '75003',
    phone: '01 43 22 11 00',
    rooms: [
      { id: 'room-4', name: 'Cabinet A', siteId: 'site-2' },
      { id: 'room-5', name: 'Cabinet B', siteId: 'site-2' },
    ],
  },
];

// Practitioners
export const mockPractitioners: Practitioner[] = [
  {
    id: 'pract-1',
    firstName: 'Sophie',
    lastName: 'Martin',
    title: 'Dr',
    specialty: 'Médecine Générale',
    email: 'dr.martin@medisync.fr',
    phone: '06 12 34 56 78',
    color: '#0D9488',
    siteIds: ['site-1', 'site-2'],
  },
  {
    id: 'pract-2',
    firstName: 'Pierre',
    lastName: 'Dubois',
    title: 'Dr',
    specialty: 'Cardiologie',
    email: 'dr.dubois@medisync.fr',
    phone: '06 98 76 54 32',
    color: '#3B82F6',
    siteIds: ['site-1'],
  },
  {
    id: 'pract-3',
    firstName: 'Marie',
    lastName: 'Laurent',
    title: 'Dr',
    specialty: 'Dermatologie',
    email: 'dr.laurent@medisync.fr',
    color: '#8B5CF6',
    siteIds: ['site-2'],
  },
];

// Appointment Motifs
export const mockMotifs: AppointmentMotif[] = [
  {
    id: 'motif-1',
    name: 'Consultation générale',
    shortName: 'Consultation',
    duration: 20,
    color: '#F59E0B',
    type: 'consultation',
    isOnlineBookable: true,
  },
  {
    id: 'motif-2',
    name: 'Première consultation',
    shortName: '1ère consult.',
    duration: 30,
    color: '#EC4899',
    type: 'consultation',
    isOnlineBookable: true,
  },
  {
    id: 'motif-3',
    name: 'Suivi de traitement',
    shortName: 'Suivi',
    duration: 15,
    color: '#3B82F6',
    type: 'followup',
    isOnlineBookable: true,
  },
  {
    id: 'motif-4',
    name: 'Urgence',
    shortName: 'Urgence',
    duration: 30,
    color: '#EF4444',
    type: 'emergency',
    isOnlineBookable: false,
  },
  {
    id: 'motif-5',
    name: 'Bilan annuel',
    shortName: 'Bilan',
    duration: 45,
    color: '#10B981',
    type: 'checkup',
    isOnlineBookable: true,
  },
  {
    id: 'motif-6',
    name: 'Acte technique',
    shortName: 'Acte',
    duration: 30,
    color: '#8B5CF6',
    type: 'procedure',
    requiresRoom: true,
    isOnlineBookable: false,
  },
];

// Patients
export const mockPatients: Patient[] = [
  {
    id: 'pat-1',
    firstName: 'Maud',
    lastName: 'PENNANEACH',
    usedFirstName: 'Maud',
    gender: 'female',
    dateOfBirth: new Date(1990, 11, 23),
    phone: '06 12 34 56 78',
    email: 'maud.p@email.fr',
    address: '15 Rue de la Paix',
    city: 'Paris',
    postalCode: '75002',
    birthPlace: 'France',
    createdAt: new Date(2022, 3, 15),
    updatedAt: new Date(2024, 10, 5),
  },
  {
    id: 'pat-2',
    firstName: 'David',
    lastName: 'CHICHEPORTICHE',
    gender: 'male',
    dateOfBirth: new Date(1965, 5, 4),
    phone: '06 60 08 45 00',
    phoneSecondary: '01 55 93 14 00',
    email: 'dchichepo@gmail.com',
    address: '83 Avenue André Morizet',
    city: 'Boulogne',
    postalCode: '92100',
    insuranceProvider: 'Mutuelle',
    alerts: [
      { id: 'alert-1', type: 'vip', message: 'VIP - lui doubler les RDV si complet', severity: 'info' }
    ],
    createdAt: new Date(2020, 1, 10),
    updatedAt: new Date(2024, 2, 13),
  },
  {
    id: 'pat-3',
    firstName: 'Pablo',
    lastName: 'DEMO',
    usedFirstName: 'Pablo',
    usedLastName: 'DEMO',
    gender: 'male',
    dateOfBirth: new Date(2001, 6, 2),
    phone: '+33 6 34 89 67 26',
    email: 'pablo.demo@email.fr',
    address: '',
    city: 'Arcachon',
    postalCode: '33',
    birthPlace: 'France',
    insuranceProvider: 'Assurance',
    createdAt: new Date(2023, 0, 5),
    updatedAt: new Date(2023, 11, 14),
  },
  {
    id: 'pat-4',
    firstName: 'Marc',
    lastName: 'DEMO',
    gender: 'male',
    dateOfBirth: new Date(1990, 0, 1),
    phone: '06 55 44 33 22',
    email: 'marc.demo@email.fr',
    createdAt: new Date(2021, 5, 20),
    updatedAt: new Date(2023, 10, 8),
  },
  {
    id: 'pat-5',
    firstName: 'Camille',
    lastName: 'DEMO',
    gender: 'female',
    dateOfBirth: new Date(1985, 3, 15),
    phone: '06 77 88 99 00',
    email: 'camille.demo@email.fr',
    createdAt: new Date(2022, 8, 1),
    updatedAt: new Date(2024, 1, 20),
  },
  {
    id: 'pat-6',
    firstName: 'Luca',
    lastName: 'GAVIRAGHI',
    gender: 'male',
    dateOfBirth: new Date(1992, 7, 11),
    phone: '06 11 22 33 44',
    createdAt: new Date(2023, 4, 10),
    updatedAt: new Date(2024, 10, 10),
  },
];

// Generate appointments for current week
const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });

const createAppointment = (
  patientIndex: number,
  practitionerIndex: number,
  motifIndex: number,
  dayOffset: number,
  hour: number,
  minute: number,
  status: Appointment['status'] = 'scheduled'
): Appointment => {
  const patient = mockPatients[patientIndex];
  const practitioner = mockPractitioners[practitionerIndex];
  const motif = mockMotifs[motifIndex];
  const startTime = setMinutes(setHours(addDays(weekStart, dayOffset), hour), minute);
  
  return {
    id: generateId(),
    patientId: patient.id,
    patient,
    practitionerId: practitioner.id,
    practitioner,
    motifId: motif.id,
    motif,
    startTime,
    endTime: addMinutes(startTime, motif.duration),
    duration: motif.duration,
    status,
    type: motif.type,
    isFirstVisit: motifIndex === 1,
    isOnWaitingList: false,
    createdAt: addDays(startTime, -7),
    updatedAt: new Date(),
    history: [
      {
        id: generateId(),
        action: 'created',
        userId: 'user-1',
        userName: 'Secrétariat',
        timestamp: addDays(startTime, -7),
      },
    ],
  };
};

export const mockAppointments: Appointment[] = [
  // Monday
  createAppointment(0, 0, 0, 0, 9, 0, 'completed'),
  createAppointment(1, 0, 2, 0, 9, 30, 'completed'),
  createAppointment(2, 0, 0, 0, 10, 0, 'completed'),
  createAppointment(3, 0, 1, 0, 10, 30, 'in-progress'),
  createAppointment(4, 0, 0, 0, 11, 0),
  createAppointment(5, 0, 3, 0, 14, 0),
  createAppointment(0, 0, 2, 0, 14, 30),
  createAppointment(1, 0, 0, 0, 15, 0),
  createAppointment(2, 1, 4, 0, 9, 0, 'completed'),
  createAppointment(3, 1, 0, 0, 10, 0),
  
  // Tuesday
  createAppointment(4, 0, 0, 1, 9, 0),
  createAppointment(5, 0, 1, 1, 9, 30),
  createAppointment(0, 0, 5, 1, 10, 30),
  createAppointment(1, 0, 0, 1, 11, 30),
  createAppointment(2, 0, 2, 1, 14, 0),
  createAppointment(3, 0, 0, 1, 14, 30),
  createAppointment(4, 1, 0, 1, 9, 0),
  createAppointment(5, 1, 4, 1, 10, 0),
  
  // Wednesday
  createAppointment(0, 0, 0, 2, 9, 0),
  createAppointment(1, 0, 3, 2, 9, 30),
  createAppointment(2, 0, 0, 2, 10, 30),
  createAppointment(3, 0, 2, 2, 11, 0),
  createAppointment(4, 0, 1, 2, 14, 0),
  createAppointment(5, 0, 0, 2, 15, 0),
  createAppointment(0, 2, 0, 2, 9, 30),
  createAppointment(1, 2, 5, 2, 10, 0),
  
  // Thursday
  createAppointment(2, 0, 0, 3, 9, 0),
  createAppointment(3, 0, 4, 3, 9, 45),
  createAppointment(4, 0, 0, 3, 11, 0),
  createAppointment(5, 0, 2, 3, 11, 30),
  createAppointment(0, 0, 0, 3, 14, 0),
  createAppointment(1, 0, 1, 3, 14, 30),
  createAppointment(2, 0, 0, 3, 15, 30),
  createAppointment(3, 1, 0, 3, 9, 0),
  createAppointment(4, 1, 5, 3, 10, 0),
  
  // Friday
  createAppointment(5, 0, 0, 4, 9, 0),
  createAppointment(0, 0, 2, 4, 9, 30),
  createAppointment(1, 0, 0, 4, 10, 0),
  createAppointment(2, 0, 3, 4, 10, 30),
  createAppointment(3, 0, 0, 4, 11, 30),
  createAppointment(4, 0, 0, 4, 14, 0),
  createAppointment(5, 0, 4, 4, 14, 30),
];

// Notes
export const mockNotes: Note[] = [
  {
    id: 'note-1',
    content: "N'a pas récupéré son ordonnance pour le kiné, passe mercredi pour la récupérer.",
    patientId: 'pat-1',
    authorId: 'user-1',
    authorName: 'Dr Martin',
    isUrgent: false,
    sendToSecretariat: true,
    createdAt: new Date(2024, 5, 7),
    updatedAt: new Date(2024, 5, 7),
  },
  {
    id: 'note-2',
    content: 'Résultats de labo à vérifier avant prochaine consultation.',
    patientId: 'pat-2',
    authorId: 'user-1',
    authorName: 'Dr Dubois',
    isUrgent: true,
    sendToSecretariat: false,
    createdAt: new Date(2024, 10, 1),
    updatedAt: new Date(2024, 10, 1),
  },
];

// Tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Appeler patient DEMO Marc',
    description: 'Rappeler pour confirmer le RDV de suivi',
    type: 'call',
    priority: 'high',
    status: 'todo',
    assigneeId: 'user-1',
    assigneeName: 'Secrétariat',
    patientId: 'pat-4',
    dueDate: addDays(new Date(), 1),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    title: 'Préparer dossier CHICHEPORTICHE',
    description: 'Imprimer les derniers résultats pour la consultation',
    type: 'preparation',
    priority: 'medium',
    status: 'in-progress',
    assigneeId: 'user-1',
    assigneeName: 'Secrétariat',
    patientId: 'pat-2',
    dueDate: new Date(),
    createdAt: addDays(new Date(), -1),
    updatedAt: new Date(),
  },
  {
    id: 'task-3',
    title: 'Demander résultats examens',
    description: 'Récupérer les résultats du bilan sanguin',
    type: 'document',
    priority: 'low',
    status: 'done',
    assigneeId: 'user-2',
    assigneeName: 'Dr Martin',
    patientId: 'pat-1',
    completedAt: addDays(new Date(), -2),
    createdAt: addDays(new Date(), -5),
    updatedAt: addDays(new Date(), -2),
  },
];

// Current user
export const currentUser = {
  id: 'user-1',
  email: 'secretariat@medisync.fr',
  firstName: 'Marie',
  lastName: 'Dupont',
  role: 'secretary' as const,
  siteIds: ['site-1', 'site-2'],
};

// Current practitioner context
export const currentPractitioner = mockPractitioners[0];
