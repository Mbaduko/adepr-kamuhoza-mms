import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AppLayout } from "@/components/Layout/AppLayout"
import { Landing } from "@/pages/Landing"
import { Login } from "@/pages/Login"
import { CertificateProcess } from "@/pages/CertificateProcess"
import { Dashboard } from "@/pages/Dashboard"
import { Profile } from "@/pages/Profile"
import { Certificates } from "@/pages/Certificates"
import { Members } from "@/pages/Members"
import { Zones } from "@/pages/Zones"
import NotFound from "./pages/NotFound"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"

const queryClient = new QueryClient()

// Component to handle home page routing
const HomePage = () => {
  const { state } = useAuth();
  
  // Show loading while auto-login is happening
  if (state.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Logging you in...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to dashboard
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If not authenticated, show landing page
  return <Landing />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Home page - shows landing or redirects to dashboard */}
              <Route path="/" element={<HomePage />} />
              
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/certificate-process" element={<CertificateProcess />} />

              {/* Dashboard as main protected route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="members" element={<Members />} />
                <Route path="zones" element={<Zones />} />
                <Route path="statistics" element={<Dashboard />} />
                <Route path="pastors" element={<Dashboard />} />
                {/* Add more protected routes here */}
              </Route>

              {/* Redirect old routes to dashboard */}
              <Route path="/index" element={<Navigate to="/dashboard" replace />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
