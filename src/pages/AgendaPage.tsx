import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import SecondaryHeader from '@/components/calendar/SecondaryHeader';
import MiniCalendar from '@/components/calendar/MiniCalendar';
import { AgendaGrid } from '@/components/calendar/grid';
import FiltersPanel from '@/components/calendar/FiltersPanel';
import AgendaSidebarHeader from '@/components/calendar/AgendaSidebarHeader';
import AppointmentDetailsPanel from '@/components/appointments/AppointmentDetailsPanel';
import AppointmentPreviewCard from '@/components/calendar/AppointmentPreviewCard';
import OpeningPreviewCard from '@/components/calendar/openings/OpeningPreviewCard';
import { OpeningWizardModal } from '@/components/calendar/openings';
import NewPatientModal from '@/components/patients/NewPatientModal';
import NewNoteModal from '@/components/notes/NewNoteModal';
import { useCalendar } from '@/hooks/useCalendar';
import { useHoverPreview } from '@/hooks/useHoverPreview';
import { useMotifs, useWeekAppointments } from '@/hooks/data/useAppointments';
import { usePractitioners } from '@/hooks/data/usePractitioners';
import { usePatients } from '@/hooks/data/usePatients';
import { useWeekOpenings, type PractitionerOpening } from '@/hooks/data/useOpenings';
import { Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';

const AgendaPage: React.FC = () => {
  const { toast } = useToast();
  const calendar = useCalendar();
  const hoverPreview = useHoverPreview();
  
  // Fetch data from Supabase with fallback
  const { data: motifs = [] } = useMotifs();
  const { data: practitioners = [] } = usePractitioners();
  const { data: patients = [] } = usePatients();
  const { data: appointments = [] } = useWeekAppointments(calendar.currentDate);
  const { data: openings = [] } = useWeekOpenings(calendar.currentDate);
  
  const [activeNav, setActiveNav] = React.useState('agenda');
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = React.useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = React.useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = React.useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(true);
  
  // Opening edit mode
  const [isOpeningEditMode, setIsOpeningEditMode] = React.useState(false);
  const [hoveredOpening, setHoveredOpening] = React.useState<PractitionerOpening | null>(null);
  const [isOpeningWizardOpen, setIsOpeningWizardOpen] = React.useState(false);
  const [editingOpening, setEditingOpening] = React.useState<PractitionerOpening | null>(null);
  const [newOpeningData, setNewOpeningData] = React.useState<{
    date: Date;
    startTime: string;
    endTime: string;
  } | null>(null);
  
  // Filters - initialize with all motifs when loaded
  const [selectedMotifs, setSelectedMotifs] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([
    'scheduled', 'waiting', 'in-progress', 'completed'
  ]);
  const [selectedPractitioners, setSelectedPractitioners] = React.useState<string[]>([]);

  // Get first practitioner for opening creation
  const activePractitioner = practitioners[0];

  // Update selected motifs when data loads
  React.useEffect(() => {
    if (motifs.length > 0 && selectedMotifs.length === 0) {
      setSelectedMotifs(motifs.map(m => m.id));
    }
  }, [motifs, selectedMotifs.length]);

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
    if (isOpeningEditMode && activePractitioner) {
      // Open wizard to create new opening
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endHour = Math.min(hour + 1, 20);
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      
      setNewOpeningData({ date, startTime, endTime });
      setEditingOpening(null);
      setIsOpeningWizardOpen(true);
    }
  };

  // Handle opening slot creation via drag
  const handleOpeningDragCreate = (date: Date, startTime: string, endTime: string) => {
    if (activePractitioner) {
      setNewOpeningData({ date, startTime, endTime });
      setEditingOpening(null);
      setIsOpeningWizardOpen(true);
    }
  };

  // Handle opening hover for preview
  const handleOpeningHover = (opening: PractitionerOpening) => {
    setHoveredOpening(opening);
  };

  const handleOpeningLeave = () => {
    setHoveredOpening(null);
  };

  // Handle opening edit
  const handleOpeningEdit = (opening: PractitionerOpening) => {
    setEditingOpening(opening);
    setNewOpeningData(null);
    setIsOpeningWizardOpen(true);
  };

  // Handle opening copy (create new from existing)
  const handleOpeningCopy = (opening: PractitionerOpening) => {
    setNewOpeningData({
      date: opening.openingDate,
      startTime: opening.startTime,
      endTime: opening.endTime,
    });
    setEditingOpening(null);
    setIsOpeningWizardOpen(true);
  };

  const handleCloseOpeningWizard = () => {
    setIsOpeningWizardOpen(false);
    setEditingOpening(null);
    setNewOpeningData(null);
  };

  // Toggle opening edit mode
  const handleToggleOpeningEditMode = () => {
    setIsOpeningEditMode(!isOpeningEditMode);
    if (isOpeningEditMode) {
      setHoveredOpening(null);
    }
  };

  // Filter appointments
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter(apt => {
      if (selectedMotifs.length > 0 && !selectedMotifs.includes(apt.motifId)) return false;
      if (!selectedStatuses.includes(apt.status)) return false;
      if (selectedPractitioners.length > 0 && !selectedPractitioners.includes(apt.practitionerId)) return false;
      return true;
    });
  }, [appointments, selectedMotifs, selectedStatuses, selectedPractitioners]);

  // Check if showing opening preview (collapse filters)
  const isShowingOpeningPreview = isOpeningEditMode && hoveredOpening !== null;
  const isShowingAnyPreview = hoverPreview.isPreviewVisible || isShowingOpeningPreview;

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
        isOpeningEditMode={isOpeningEditMode}
        onToggleOpeningEditMode={handleToggleOpeningEditMode}
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
                appointments={appointments}
              />

              {/* Preview Card - appears when hovering an appointment */}
              <AppointmentPreviewCard
                appointment={hoverPreview.previewData.appointment}
                isVisible={hoverPreview.isPreviewVisible && !isOpeningEditMode}
                type={hoverPreview.previewData.type}
                onClick={() => {
                  if (hoverPreview.previewData.appointment) {
                    handleAppointmentClick(hoverPreview.previewData.appointment);
                  }
                }}
              />

              {/* Opening Preview Card - appears when hovering an opening in edit mode */}
              <OpeningPreviewCard
                opening={hoveredOpening}
                isVisible={isShowingOpeningPreview}
                onClick={() => {
                  if (hoveredOpening) {
                    handleOpeningEdit(hoveredOpening);
                  }
                }}
              />

              {/* Filters: Statuts, Motifs, Agendas - collapsed when preview is visible */}
              <FiltersPanel
                motifs={motifs}
                practitioners={practitioners}
                selectedMotifs={selectedMotifs}
                onMotifsChange={setSelectedMotifs}
                selectedStatuses={selectedStatuses}
                onStatusesChange={setSelectedStatuses}
                selectedPractitioners={selectedPractitioners}
                onPractitionersChange={setSelectedPractitioners}
                isCollapsed={isShowingAnyPreview}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col p-3 min-w-0 overflow-hidden">
          <AgendaGrid
            view={calendar.view}
            days={calendar.getWeekDays()}
            currentDate={calendar.currentDate}
            selectedDate={calendar.selectedDate}
            appointments={filteredAppointments}
            openings={openings}
            isOpeningEditMode={isOpeningEditMode}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentHover={hoverPreview.handleMouseEnter}
            onAppointmentLeave={hoverPreview.handleMouseLeave}
            onOpeningHover={handleOpeningHover}
            onOpeningLeave={handleOpeningLeave}
            onOpeningEdit={handleOpeningEdit}
            onOpeningCopy={handleOpeningCopy}
            onOpeningDragCreate={handleOpeningDragCreate}
            onSlotClick={handleSlotClick}
            onDayClick={calendar.selectDate}
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
        patient={patients[0]}
        date={calendar.selectedDate}
      />

      {/* Opening Wizard Modal */}
      {activePractitioner && (
        <OpeningWizardModal
          isOpen={isOpeningWizardOpen}
          onClose={handleCloseOpeningWizard}
          practitionerId={activePractitioner.id}
          initialDate={newOpeningData?.date}
          initialStartTime={newOpeningData?.startTime}
          initialEndTime={newOpeningData?.endTime}
          editingOpening={editingOpening}
        />
      )}
    </MainLayout>
  );
};

export default AgendaPage;
