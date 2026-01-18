import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { InfosAdministrativesPanel } from './infos-administratives';
import DossierPageLayout from './shared/DossierPageLayout';

interface OutletContext {
  patient: Patient;
}

/**
 * PatientInfosAdminTab - Uses canonical DossierPageLayout
 *
 * L5 Anti-overlap:
 * - DossierPageLayout handles responsive actions panel
 * - InfosAdministrativesPanel handles form content only
 * - minmax grid columns prevent overlap at any zoom
 */
const PatientInfosAdminTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();

  return (
    <DossierPageLayout
      patient={patient}
      title="Informations administratives"
      breadcrumbLabel="Coordonnées"
      compactHeader
    >
      <InfosAdministrativesPanel patient={patient} />
    </DossierPageLayout>
  );
};

export default PatientInfosAdminTab;
