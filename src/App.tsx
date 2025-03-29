
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import CompanyDetail from "@/pages/CompanyDetail";
import NewAudit from "@/pages/NewAudit";
import AuditDetail from "@/pages/AuditDetail";
import NewService from "@/pages/NewService";
import ServiceDetail from "@/pages/ServiceDetail";
import Frameworks from "@/pages/frameworks";
import Profile from "@/pages/Profile";
import RiskAnalysis from "@/pages/RiskAnalysis";
import RiskScenarioDetail from "@/pages/RiskScenarioDetail";
import NewRiskScenario from "@/pages/NewRiskScenario";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";

// Create a QueryClient instance outside of the component
const queryClient = new QueryClient();

// Composant pour les routes protégées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié et que le chargement est terminé, rediriger vers login
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-subtle">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // L'effet useEffect va s'occuper de la redirection
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// Définition des routes de l'application (déplacée à l'intérieur de l'AuthProvider)
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      
      <Route path="/company/:id" element={
        <ProtectedRoute>
          <CompanyDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/new-audit/:id" element={
        <ProtectedRoute>
          <NewAudit />
        </ProtectedRoute>
      } />
      
      <Route path="/audit/:id" element={
        <ProtectedRoute>
          <AuditDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/new-service/:id" element={
        <ProtectedRoute>
          <NewService />
        </ProtectedRoute>
      } />
      
      <Route path="/service/:id" element={
        <ProtectedRoute>
          <ServiceDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/risk-analysis/:id" element={
        <ProtectedRoute>
          <RiskAnalysis />
        </ProtectedRoute>
      } />
      
      <Route path="/risk-analysis/scenario/:id" element={
        <ProtectedRoute>
          <RiskScenarioDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/risk-analysis/new-scenario/:id" element={
        <ProtectedRoute>
          <NewRiskScenario />
        </ProtectedRoute>
      } />
      
      <Route path="/frameworks" element={
        <ProtectedRoute>
          <Frameworks />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <DataProvider>
                <AppRoutes />
              </DataProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
