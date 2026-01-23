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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
