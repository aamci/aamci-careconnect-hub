import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import PatientSearchBar from '@/components/patients/PatientSearchBar';
import PatientCard from '@/components/patients/PatientCard';
import PatientDetailView from '@/components/patients/PatientDetailView';
import NewPatientModal from '@/components/patients/NewPatientModal';
import NewNoteModal from '@/components/notes/NewNoteModal';
import { Patient } from '@/types';
import { usePatients, useCreatePatient } from '@/hooks/data/usePatients';
import { useAppointments } from '@/hooks/data/useAppointments';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const PatientsPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);

  // Fetch from Supabase with automatic fallback to mockData
  const { data: patients = [], isLoading: isLoadingPatients } = usePatients();
  const { data: appointments = [] } = useAppointments();
  const createPatient = useCreatePatient();

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    
    const query = searchQuery.toLowerCase();
    return patients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const reverseName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
      const phone = patient.phone?.replace(/\s/g, '') || '';
      const dob = patient.dateOfBirth instanceof Date 
        ? patient.dateOfBirth.toLocaleDateString('fr-FR')
        : new Date(patient.dateOfBirth).toLocaleDateString('fr-FR');
      
      return (
        fullName.includes(query) ||
        reverseName.includes(query) ||
        phone.includes(query.replace(/\s/g, '')) ||
        dob.includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.city?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, patients]);

  // Count appointments per patient
  const appointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(apt => {
      counts[apt.patientId] = (counts[apt.patientId] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleEditPatient = () => {
    toast.info('Édition patient - fonctionnalité à venir');
  };

  const handleNewAppointment = () => {
    toast.info('Nouveau RDV - redirection vers l\'agenda');
  };

  return (
    <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="h-full flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-background to-muted/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dossiers Patients</h1>
                <p className="text-sm text-muted-foreground">
                    {patients.length} patients enregistrés
                  </p>
                </div>
              </div>
              
              <Button onClick={() => setIsNewPatientModalOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Nouveau Patient
              </Button>
            </div>

            {/* Search */}
            <PatientSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              resultCount={searchQuery ? filteredPatients.length : undefined}
            />
          </div>

          {/* Patient List */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {isLoadingPatients ? (
                <div className="grid gap-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
              <AnimatePresence mode="popLayout">
                {filteredPatients.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid gap-3"
                  >
                    {filteredPatients.map((patient, index) => (
                      <motion.div
                        key={patient.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <PatientCard
                          patient={patient}
                          isSelected={selectedPatient?.id === patient.id}
                          onClick={() => handlePatientSelect(patient)}
                          appointmentCount={appointmentCounts[patient.id] || 0}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Aucun patient trouvé
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Aucun résultat pour "{searchQuery}"
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Effacer la recherche
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Patient Detail Panel - Fixed Overlay */}
        <AnimatePresence>
          {selectedPatient && (
            <PatientDetailView
              patient={selectedPatient}
              onClose={() => setSelectedPatient(null)}
              onEdit={handleEditPatient}
              onNewAppointment={handleNewAppointment}
              onNewNote={() => setIsNewNoteModalOpen(true)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSave={(data) => {
          createPatient.mutate({
            firstName: data.firstName || data.usedFirstName,
            lastName: data.lastName || data.usedLastName,
            usedFirstName: data.usedFirstName || undefined,
            usedLastName: data.usedLastName || undefined,
            gender: data.gender,
            dateOfBirth: new Date(data.dateOfBirth),
            phone: data.phone,
            email: data.email || undefined,
            city: data.city || undefined,
            birthPlace: data.birthPlace || undefined,
          });
          setIsNewPatientModalOpen(false);
        }}
      />

      <NewNoteModal
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        patient={selectedPatient || undefined}
        onSave={(data) => {
          toast.success('Note ajoutée');
          setIsNewNoteModalOpen(false);
        }}
      />
    </MainLayout>
  );
};

export default PatientsPage;
