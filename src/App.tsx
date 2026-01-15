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
import PatientInfosTab from "./components/patients/dossier/PatientInfosTab";
import PatientInfosAdminTab from "./components/patients/dossier/PatientInfosAdminTab";
import PatientHistoriqueTab from "./components/patients/dossier/PatientHistoriqueTab";
import PatientAntecedentsTab from "./components/patients/dossier/PatientAntecedentsTab";
import PlaceholderTab from "./components/patients/dossier/PlaceholderTab";
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
              <Route path="documents" element={<PlaceholderTab title="Documents" />} />
              <Route path="observations" element={<PlaceholderTab title="Observations" />} />
              <Route path="traitement" element={<PlaceholderTab title="Traitement en cours" />} />
              <Route path="biologie" element={<PlaceholderTab title="Biologie et Biométrie" />} />
              <Route path="vaccination" element={<PlaceholderTab title="Carnet de vaccination" />} />
              <Route path="factures" element={<PlaceholderTab title="Factures" />} />
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
