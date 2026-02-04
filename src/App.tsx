import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FreeTipsPage from "./pages/FreeTipsPage";
import VipPage from "./pages/VipPage";
import SpecialPage from "./pages/SpecialPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminTipsPage from "./pages/admin/AdminTipsPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import AdminAppInfoPage from "./pages/admin/AdminAppInfoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/free-tips" element={<FreeTipsPage />} />
          <Route path="/vip" element={<VipPage />} />
          <Route path="/special" element={<SpecialPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/free-tips" element={<AdminTipsPage tipType="free" />} />
          <Route path="/admin/vip-tips" element={<AdminTipsPage tipType="vip" />} />
          <Route path="/admin/special-tips" element={<AdminTipsPage tipType="special" />} />
          <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
          <Route path="/admin/app-info" element={<AdminAppInfoPage />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
