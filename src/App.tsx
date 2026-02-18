import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import AgendaPage from "./pages/AgendaPage";
import PatientsPage from "./pages/PatientsPage";
import PatientDossierPage from "./pages/PatientDossierPage";
import PatientHomeTab from "./components/patients/dossier/PatientHomeTab";
import PatientConsultationTab from "./components/patients/dossier/PatientConsultationTab";
import PatientInfosAdminTab from "./components/patients/dossier/PatientInfosAdminTab";
import PatientHistoriqueTab from "./components/patients/dossier/PatientHistoriqueTab";
import PatientAntecedentsTab from "./components/patients/dossier/PatientAntecedentsTab";
import PatientDocumentsTab from "./components/patients/dossier/PatientDocumentsTab";
import PatientObservationsTab from "./components/patients/dossier/PatientObservationsTab";
import PatientTraitementTab from "./components/patients/dossier/PatientTraitementTab";
import PatientBiologieTab from "./components/patients/dossier/PatientBiologieTab";
import PatientVaccinationTab from "./components/patients/dossier/PatientVaccinationTab";
import PatientFacturesTab from "./components/patients/dossier/PatientFacturesTab";
import WaitingRoomPage from "./pages/WaitingRoomPage";
import VideoRoomPage from "./pages/VideoRoomPage";
import TeleconsultationListPage from "./pages/TeleconsultationListPage";
import AdminTeleconsultationSetup from "./pages/AdminTeleconsultationSetup";
import ActivityPage from "./pages/ActivityPage";
import SettingsPage from "./pages/SettingsPage";
import SettingsAccueil from "./components/settings/SettingsAccueil";
import ComptesUtilisateurs from "./components/settings/cabinet/ComptesUtilisateurs";
import Remplacants from "./components/settings/cabinet/Remplacants";
import AgendasSettings from "./components/settings/cabinet/AgendasSettings";
import VisibiliteReservation from "./components/settings/cabinet/VisibiliteReservation";
import LieuxConsultation from "./components/settings/cabinet/LieuxConsultation";
import MotifsConsultation from "./components/settings/rdv/MotifsConsultation";
import CategoriesMotifs from "./components/settings/rdv/CategoriesMotifs";
import InstructionsInternes from "./components/settings/rdv/InstructionsInternes";
import SyntheseConsignes from "./components/settings/rdv/SyntheseConsignes";
import ConsignesSettings from "./components/settings/rdv/ConsignesSettings";
import QuestionsSettings from "./components/settings/rdv/QuestionsSettings";
import DocumentsRdv from "./components/settings/rdv/DocumentsRdv";
import ChampsRdv from "./components/settings/rdv/ChampsRdv";
import MessagerieSettings from "./components/settings/messagerie/MessagerieSettings";
import Statistiques from "./components/settings/avances/Statistiques";
import Identitovigilance from "./components/settings/avances/Identitovigilance";
import DonneesSettings from "./components/settings/avances/DonneesSettings";
import MonCompte from "./components/settings/profil/MonCompte";
import CentreConfidentialite from "./components/settings/profil/CentreConfidentialite";
import JournalSecurite from "./components/settings/profil/JournalSecurite";
import MaSignature from "./components/settings/profil/MaSignature";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
            <Route path="/patients/:patientId" element={<ProtectedRoute><PatientDossierPage /></ProtectedRoute>}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<PatientHomeTab />} />
              <Route path="consultation" element={<PatientConsultationTab />} />
              <Route path="infos" element={<PatientInfosAdminTab />} />
              <Route path="infos-administratives" element={<PatientInfosAdminTab />} />
              <Route path="historique" element={<PatientHistoriqueTab />} />
              <Route path="antecedents" element={<PatientAntecedentsTab />} />
              <Route path="documents" element={<PatientDocumentsTab />} />
              <Route path="observations" element={<PatientObservationsTab />} />
              <Route path="traitement" element={<PatientTraitementTab />} />
              <Route path="biologie" element={<PatientBiologieTab />} />
              <Route path="vaccination" element={<PatientVaccinationTab />} />
              <Route path="factures" element={<PatientFacturesTab />} />
            </Route>
            {/* Stats/Activity route */}
            <Route path="/stats" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
            {/* Teleconsultation routes */}
            <Route path="/teleconsult" element={<ProtectedRoute><TeleconsultationListPage /></ProtectedRoute>} />
            <Route path="/admin/teleconsult-setup" element={<ProtectedRoute><AdminTeleconsultationSetup /></ProtectedRoute>} />
            <Route path="/visio/waiting/:teleconsultationId" element={<WaitingRoomPage />} />
            <Route path="/visio/:teleconsultationId" element={<VideoRoomPage />} />
            {/* Settings routes */}
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}>
              <Route index element={<SettingsAccueil />} />
              <Route path="comptes" element={<ComptesUtilisateurs />} />
              <Route path="remplacants" element={<Remplacants />} />
              <Route path="agendas" element={<AgendasSettings />} />
              <Route path="visibilite" element={<VisibiliteReservation />} />
              <Route path="lieux" element={<LieuxConsultation />} />
              <Route path="motifs" element={<MotifsConsultation />} />
              <Route path="categories" element={<CategoriesMotifs />} />
              <Route path="instructions" element={<InstructionsInternes />} />
              <Route path="synthese-consignes" element={<SyntheseConsignes />} />
              <Route path="consignes" element={<ConsignesSettings />} />
              <Route path="questions" element={<QuestionsSettings />} />
              <Route path="documents-rdv" element={<DocumentsRdv />} />
              <Route path="champs-rdv" element={<ChampsRdv />} />
              <Route path="messagerie" element={<MessagerieSettings />} />
              <Route path="statistiques" element={<Statistiques />} />
              <Route path="identitovigilance" element={<Identitovigilance />} />
              <Route path="donnees" element={<DonneesSettings />} />
              <Route path="mon-compte" element={<MonCompte />} />
              <Route path="confidentialite" element={<CentreConfidentialite />} />
              <Route path="journal-securite" element={<JournalSecurite />} />
              <Route path="signature" element={<MaSignature />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
