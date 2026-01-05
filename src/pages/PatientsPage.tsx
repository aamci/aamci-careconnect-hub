import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import PatientSearchBar from '@/components/patients/PatientSearchBar';
import PatientCard from '@/components/patients/PatientCard';
import FullPatientDossier from '@/components/patients/FullPatientDossier';
import NewPatientModal from '@/components/patients/NewPatientModal';
import NewNoteModal from '@/components/notes/NewNoteModal';
import { Patient } from '@/types';
import { mockPatients, mockAppointments } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const PatientsPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return mockPatients;
    
    const query = searchQuery.toLowerCase();
    return mockPatients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const reverseName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
      const phone = patient.phone?.replace(/\s/g, '') || '';
      const dob = patient.dateOfBirth.toLocaleDateString('fr-FR');
      
      return (
        fullName.includes(query) ||
        reverseName.includes(query) ||
        phone.includes(query.replace(/\s/g, '')) ||
        dob.includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.city?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Count appointments per patient
  const appointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockAppointments.forEach(apt => {
      counts[apt.patientId] = (counts[apt.patientId] || 0) + 1;
    });
    return counts;
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleEditPatient = () => {
    toast.info('Édition patient - fonctionnalité à venir');
  };

  // If a patient is selected, show full dossier view
  if (selectedPatient) {
    return (
      <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
        <FullPatientDossier
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onEdit={handleEditPatient}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="h-full flex flex-col">
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
                  {mockPatients.length} patients enregistrés
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
                        isSelected={false}
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
          </div>
        </ScrollArea>
      </div>

      {/* Modals */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSave={(data) => {
          toast.success('Patient créé avec succès');
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
