import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import SecondaryHeader from '@/components/calendar/SecondaryHeader';
import MiniCalendar from '@/components/calendar/MiniCalendar';
import WeekGrid from '@/components/calendar/WeekGrid';
import FiltersPanel from '@/components/calendar/FiltersPanel';
import AgendaSidebarHeader from '@/components/calendar/AgendaSidebarHeader';
import AppointmentDetailsPanel from '@/components/appointments/AppointmentDetailsPanel';
import AppointmentPreviewCard from '@/components/calendar/AppointmentPreviewCard';
import NewPatientModal from '@/components/patients/NewPatientModal';
import NewNoteModal from '@/components/notes/NewNoteModal';
import { useCalendar } from '@/hooks/useCalendar';
import { useHoverPreview } from '@/hooks/useHoverPreview';
import { mockAppointments, mockMotifs, mockPatients } from '@/data/mockData';
import { Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';

const AgendaPage: React.FC = () => {
  const { toast } = useToast();
  const calendar = useCalendar();
  const hoverPreview = useHoverPreview();
  
  const [activeNav, setActiveNav] = React.useState('agenda');
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = React.useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = React.useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = React.useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(true);
  
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
    // Open new appointment modal (future feature)
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
      {/* Secondary Header - Below main blue header */}
      <SecondaryHeader
        dateLabel={calendar.getDateRangeLabel()}
        view={calendar.view}
        onViewChange={calendar.setView}
        onToday={calendar.goToToday}
        onPrevious={calendar.goToPrevious}
        onNext={calendar.goToNext}
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        isSidebarVisible={isSidebarVisible}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AnimatePresence>
          {isSidebarVisible && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border bg-muted/20 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar"
            >
              {/* Trouver un créneau button */}
              <AgendaSidebarHeader onNewAppointment={() => setIsNewPatientOpen(true)} />
              
              {/* Mini Calendar */}
              <MiniCalendar
                currentDate={calendar.currentDate}
                selectedDate={calendar.selectedDate}
                onSelectDate={calendar.selectDate}
                appointments={mockAppointments}
              />

              {/* Preview Card - appears when hovering an appointment */}
              <AppointmentPreviewCard
                appointment={hoverPreview.previewData.appointment}
                isVisible={hoverPreview.isPreviewVisible}
                type={hoverPreview.previewData.type}
                onClick={() => {
                  if (hoverPreview.previewData.appointment) {
                    handleAppointmentClick(hoverPreview.previewData.appointment);
                  }
                }}
              />

              {/* Filters: Statuts, Motifs, Agendas - collapsed when preview is visible */}
              <FiltersPanel
                selectedMotifs={selectedMotifs}
                onMotifsChange={setSelectedMotifs}
                selectedStatuses={selectedStatuses}
                onStatusesChange={setSelectedStatuses}
                selectedPractitioners={selectedPractitioners}
                onPractitionersChange={setSelectedPractitioners}
                isCollapsed={hoverPreview.isPreviewVisible}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col p-4 min-w-0 overflow-hidden">
          <WeekGrid
            days={calendar.getWeekDays()}
            appointments={filteredAppointments}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentHover={hoverPreview.handleMouseEnter}
            onAppointmentLeave={hoverPreview.handleMouseLeave}
            onSlotClick={handleSlotClick}
          />
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
