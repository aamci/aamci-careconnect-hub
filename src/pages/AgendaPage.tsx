import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import WeekGrid from '@/components/calendar/WeekGrid';
import FiltersPanel from '@/components/calendar/FiltersPanel';
import AppointmentDetailsPanel from '@/components/appointments/AppointmentDetailsPanel';
import NewPatientModal from '@/components/patients/NewPatientModal';
import NewNoteModal from '@/components/notes/NewNoteModal';
import { useCalendar } from '@/hooks/useCalendar';
import { mockAppointments, mockMotifs, mockPatients } from '@/data/mockData';
import { Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';

const AgendaPage: React.FC = () => {
  const { toast } = useToast();
  const calendar = useCalendar();
  
  const [activeNav, setActiveNav] = React.useState('agenda');
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = React.useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = React.useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = React.useState(false);
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = React.useState(true);
  
  // Filters
  const [selectedMotifs, setSelectedMotifs] = React.useState<string[]>(mockMotifs.map(m => m.id));
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([
    'scheduled', 'waiting', 'in-progress', 'completed'
  ]);
  const [selectedPractitioners, setSelectedPractitioners] = React.useState<string[]>([]);

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsPanelOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsPanelOpen(false);
    setTimeout(() => setSelectedAppointment(null), 300);
  };

  const handleStatusChange = (status: Appointment['status']) => {
    if (selectedAppointment) {
      toast({
        title: 'Statut mis à jour',
        description: `Le rendez-vous a été marqué comme "${status}".`,
      });
    }
  };

  const handleNewPatient = (data: any) => {
    toast({
      title: 'Patient ajouté',
      description: `${data.usedFirstName} ${data.usedLastName} a été ajouté à la base.`,
    });
  };

  const handleNewNote = (data: any) => {
    toast({
      title: 'Note enregistrée',
      description: 'La note a été ajoutée avec succès.',
    });
  };

  const handleSlotClick = (date: Date, hour: number) => {
    console.log('Slot clicked:', date, hour);
  };

  // Filter appointments
  const filteredAppointments = mockAppointments.filter(apt => {
    if (!selectedMotifs.includes(apt.motifId)) return false;
    if (!selectedStatuses.includes(apt.status)) return false;
    if (selectedPractitioners.length > 0 && !selectedPractitioners.includes(apt.practitionerId)) return false;
    return true;
  });

  return (
    <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="h-full flex">
        {/* Left Filters Panel - Second Column */}
        {isFiltersPanelOpen && (
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 border-r border-border bg-card flex-shrink-0 overflow-hidden flex flex-col"
          >
            <FiltersPanel
              selectedMotifs={selectedMotifs}
              onMotifsChange={setSelectedMotifs}
              selectedStatuses={selectedStatuses}
              onStatusesChange={setSelectedStatuses}
              selectedPractitioners={selectedPractitioners}
              onPractitionersChange={setSelectedPractitioners}
              currentDate={calendar.currentDate}
              selectedDate={calendar.selectedDate}
              onSelectDate={calendar.selectDate}
              appointments={mockAppointments}
            />
          </motion.aside>
        )}

        {/* Main Content - Calendar */}
        <main className="flex-1 flex flex-col min-w-0 bg-background">
          <CalendarToolbar
            dateLabel={calendar.getDateRangeLabel()}
            view={calendar.view}
            onViewChange={calendar.setView}
            onToday={calendar.goToToday}
            onPrevious={calendar.goToPrevious}
            onNext={calendar.goToNext}
            onNewAppointment={() => setIsNewPatientOpen(true)}
            onToggleFilters={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
            showFiltersToggle
          />

          <div className="flex-1 overflow-hidden p-4">
            <WeekGrid
              days={calendar.getWeekDays()}
              appointments={filteredAppointments}
              onAppointmentClick={handleAppointmentClick}
              onSlotClick={handleSlotClick}
            />
          </div>
        </main>
      </div>

      {/* Modals & Panels */}
      <AppointmentDetailsPanel
        appointment={selectedAppointment}
        isOpen={isDetailsPanelOpen}
        onClose={handleCloseDetails}
        onStatusChange={handleStatusChange}
      />

      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onSave={handleNewPatient}
      />

      <NewNoteModal
        isOpen={isNewNoteOpen}
        onClose={() => setIsNewNoteOpen(false)}
        onSave={handleNewNote}
        patient={mockPatients[0]}
        date={calendar.selectedDate}
      />
    </MainLayout>
  );
};

export default AgendaPage;