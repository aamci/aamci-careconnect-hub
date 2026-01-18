import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { InfosAdministrativesPanel } from './infos-administratives';
import { ActionsPanel } from './actions-panel';

interface OutletContext {
  patient: Patient;
}

const PatientInfosAdminTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/patients');
  };

  return (
    <div className="h-full flex">
      {/* Central Form Panel */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <InfosAdministrativesPanel patient={patient} onClose={handleClose} />
      </div>

      {/* Right Actions Panel - Responsive: hidden on small screens */}
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <ActionsPanel patient={patient} />
      </div>
    </div>
  );
};

export default PatientInfosAdminTab;
