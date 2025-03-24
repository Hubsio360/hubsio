
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import Navbar from "@/components/Navbar";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import CompanyDetail from "@/pages/CompanyDetail";
import NewAudit from "@/pages/NewAudit";
import AuditDetail from "@/pages/AuditDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Composant pour les routes protégées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-subtle">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// Définition de l'application
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
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
