import React, { useState } from 'react';
import { toast } from 'sonner';
import ConsultationSidebar from '@/components/consultation/ConsultationSidebar';
import ConsultationHeader from '@/components/consultation/ConsultationHeader';
import PatientDossierPanel from '@/components/consultation/PatientDossierPanel';
import HistoryTimeline from '@/components/consultation/HistoryTimeline';
import MedicalObservationPanel from '@/components/consultation/MedicalObservationPanel';
import CarePlanPanel from '@/components/consultation/CarePlanPanel';
import ConsultationActionBar from '@/components/consultation/ConsultationActionBar';

const ConsultationPage: React.FC = () => {
  const [activeNavItem, setActiveNavItem] = useState('agenda');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleNavClick = (id: string) => {
    setActiveNavItem(id);
    if (id === 'patients') {
      window.location.href = '/patients';
    } else if (id === 'agenda') {
      window.location.href = '/';
    }
  };

  const handleCancel = () => {
    if (isDraft) {
      const confirmed = window.confirm('Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir annuler ?');
      if (!confirmed) return;
    }
    toast.info('Consultation annulée');
    window.history.back();
  };

  const handleSaveWithoutBilling = async () => {
    setIsSaving(true);
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDraft(false);
      toast.success('Consultation enregistrée sans facturation');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    toast.info('Impression du plan de soins...');
    window.print();
  };

  const handleActionCreate = (type: string) => {
    toast.success(`${type === 'pharmacy' ? 'Ordonnance pharmacie' : type === 'biology' ? 'Ordonnance biologie' : type === 'letter' ? 'Courrier' : type === 'imaging' ? 'Ordonnance imagerie' : 'Action'} créée`);
  };

  const handleExportDossier = () => {
    toast.info('Export du dossier patient...');
  };

  const handleDossierSearch = (query: string) => {
    console.log('Searching in dossier:', query);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Top Header */}
      <ConsultationHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Navigation Sidebar */}
        <ConsultationSidebar 
          activeItem={activeNavItem}
          onItemClick={handleNavClick}
        />

        {/* Columns 2-4: Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Column 2: Patient Dossier */}
            <PatientDossierPanel 
              onExportDossier={handleExportDossier}
              onSearch={handleDossierSearch}
            />

            {/* Column 3: History Timeline */}
            <HistoryTimeline />

            {/* Column 4: Observation + Care Plan */}
            <div className="flex-1 flex overflow-hidden">
              {/* Medical Observation */}
              <MedicalObservationPanel 
                onDraftChange={setIsDraft}
              />

              {/* Care Plan */}
              <CarePlanPanel 
                onPrint={handlePrint}
                onActionCreate={handleActionCreate}
              />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <ConsultationActionBar 
            isDraft={isDraft}
            isSaving={isSaving}
            onCancel={handleCancel}
            onSaveWithoutBilling={handleSaveWithoutBilling}
          />
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
