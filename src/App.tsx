import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useExitIntent } from "@/hooks/useExitIntent";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Services from "./pages/Services";
import BookDemo from "./pages/BookDemo";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import TwoFactorVerification from "./pages/TwoFactorVerification";
import SuperAdmin from "./pages/SuperAdmin";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import Payment from "./pages/Payment";
import Pricing from "./pages/Pricing";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicRoute";
import AdminPublicRoute from "./components/AdminPublicRoute";
import AdminProtectRoute from "./components/AdminProtectedRoute";
import { SubscriptionPlan } from "./pages/SubscriptionPlan";
import Success from "./pages/Success";
import InvoiceDetail from "./InvoiceDetail";
import { useEffect, useState } from "react";
import AuthListener from "./components/AuthListener";
import UpdatePassword from "./pages/Update-password";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isTriggered, setIsTriggered] = useState(false);
  const location = useLocation();

  const resetTrigger = () => setIsTriggered(false);

  useEffect(() => {
    const excludedRoutes = [
      "/dashboard",
      "/super-admin",
      "/super-admin-login",
      "/login",
      "/invoice/:invoice_Id",
      "/success",
      "/forgot-password",
    ];
    if (excludedRoutes.includes(location.pathname)) {
      return;
    }

    const hasSeenPopup = localStorage.getItem("hasSeenExitPopup");
    if (!hasSeenPopup) {
      setIsTriggered(true);
      localStorage.setItem("hasSeenExitPopup", "true");
    }
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/features" element={<Features />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/book-demo" element={<BookDemo />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin"
          element={
            <AdminProtectRoute>
              <SuperAdmin />
            </AdminProtectRoute>
          }
        />
        <Route
          path="/super-admin-login"
          element={
            <AdminPublicRoute>
              <SuperAdminLogin />
            </AdminPublicRoute>
          }
        />
        <Route path="/faq" element={<FAQ />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        <Route path="/invoice/:invoice_Id" element={<InvoiceDetail />} />
        <Route path="/verify-2fa" element={<TwoFactorVerification />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/create-new-plan" element={<SubscriptionPlan />} />
        <Route path="/success" element={<Success />} />

        <Route path="/landing" element={<Landing />} />
        <Route path="/auth-listener" element={<AuthListener />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ExitIntentPopup isOpen={isTriggered} onClose={resetTrigger} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
