import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import {
  GuestRoute,
  CitizenRoute,
  AuthorityRoute,
  OfficerRoute,
  AdminRoute,
} from '@/components/routes/ProtectedRoutes';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import CitizenLayout from '@/layouts/CitizenLayout';
import AuthorityLayout from '@/layouts/AuthorityLayout';
import {
  OfficerLayout,
  AdminLayout,
  OfficerDashboardPage,
  AdminSystemDataPage,
} from '@/layouts/OfficerAdminLayout';
import CitizenDashboardPage from '@/pages/citizen/DashboardPage';
import RegisterGrievancePage from '@/pages/citizen/RegisterGrievancePage';
import MyComplaintsPage from '@/pages/citizen/MyComplaintsPage';
import ComplaintDetailPage from '@/pages/citizen/ComplaintDetailPage';
import CitizenNotificationsPage from '@/pages/citizen/NotificationsPage';
import CitizenProfilePage from '@/pages/citizen/ProfilePage';
import TrackGrievancePage from '@/pages/citizen/TrackGrievancePage';
import AuthorityDashboardPage from '@/pages/authority/DashboardPage';
import AuthorityGrievancesPage from '@/pages/authority/GrievancesPage';
import AuthorityGrievanceDetailPage from '@/pages/authority/GrievanceDetailPage';
import SLAMonitoringPage from '@/pages/authority/SLAMonitoringPage';
import DuplicatesPage from '@/pages/authority/DuplicatesPage';
import AuthorityNotificationsPage from '@/pages/authority/NotificationsPage';
import AuthorityProfilePage from '@/pages/authority/ProfilePage';
import AnalyticsPage from '@/pages/authority/AnalyticsPage';
import PolicyImpactPage from '@/pages/authority/PolicyImpactPage';
import NotFoundPage, { TrackComplaintPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<CitizenRoute />}>
              <Route path="/track/:grievanceId" element={<TrackGrievancePage />} />
              <Route path="/citizen" element={<CitizenLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CitizenDashboardPage />} />
                <Route path="register" element={<RegisterGrievancePage />} />
                <Route path="register-grievance" element={<Navigate to="/citizen/register" replace />} />
                <Route path="complaints" element={<MyComplaintsPage />} />
                <Route path="complaints/:id" element={<ComplaintDetailPage />} />
                <Route path="track" element={<TrackComplaintPage />} />
                <Route path="notifications" element={<CitizenNotificationsPage />} />
                <Route path="profile" element={<CitizenProfilePage />} />
              </Route>
            </Route>

            <Route element={<AuthorityRoute />}>
              <Route path="/authority" element={<AuthorityLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AuthorityDashboardPage />} />
                <Route path="grievances" element={<AuthorityGrievancesPage />} />
                <Route path="grievances/:id" element={<AuthorityGrievanceDetailPage />} />
                <Route path="sla" element={<SLAMonitoringPage />} />
                <Route path="duplicates" element={<DuplicatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="policy-impact" element={<PolicyImpactPage />} />
                <Route path="notifications" element={<AuthorityNotificationsPage />} />
                <Route path="profile" element={<AuthorityProfilePage />} />
              </Route>
            </Route>

            <Route element={<OfficerRoute />}>
              <Route path="/officer" element={<OfficerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<OfficerDashboardPage />} />
              </Route>
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="system-data" replace />} />
                <Route path="system-data" element={<AdminSystemDataPage />} />
              </Route>
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
