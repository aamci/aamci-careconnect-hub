import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AgendaPage from "./pages/AgendaPage";
import PatientsPage from "./pages/PatientsPage";
import PatientDossierPage from "./pages/PatientDossierPage";
import PatientHomeTab from "./components/patients/dossier/PatientHomeTab";
import PatientConsultationTab from "./components/patients/dossier/PatientConsultationTab";
import PatientInfosTab from "./components/patients/dossier/PatientInfosTab";
import PatientHistoriqueTab from "./components/patients/dossier/PatientHistoriqueTab";
import PatientAntecedentsTab from "./components/patients/dossier/PatientAntecedentsTab";
import PlaceholderTab from "./components/patients/dossier/PlaceholderTab";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AgendaPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:patientId" element={<PatientDossierPage />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<PatientHomeTab />} />
            <Route path="consultation" element={<PatientConsultationTab />} />
            <Route path="infos" element={<PatientInfosTab />} />
            <Route path="infos-administratives" element={<PatientInfosTab />} />
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
