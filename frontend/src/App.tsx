import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import {
  GuestRoute,
  UserRoute,
  DepartmentRoute,
  HeadRoute,
  AdminRoute,
} from '@/components/routes/ProtectedRoutes';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import CitizenLayout from '@/layouts/CitizenLayout';
import AuthorityLayout from '@/layouts/AuthorityLayout';
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
import HotspotsPage from '@/pages/authority/HotspotsPage';
import AIInsightsPage from '@/pages/authority/AIInsightsPage';
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import AdminDepartmentsPage from '@/pages/admin/DepartmentsPage';
import AdminDepartmentHeadsPage from '@/pages/admin/DepartmentHeadsPage';
import AdminDepartmentUsersPage from '@/pages/admin/DepartmentUsersPage';
import AdminAuditLogsPage from '@/pages/admin/AuditLogsPage';
import AdminHealthPage from '@/pages/admin/HealthPage';
import AdminSettingsPage from '@/pages/admin/SettingsPage';
import AdminUsersPage from '@/pages/admin/UsersPage';
import AdminSecurityPage from '@/pages/admin/SecurityPage';
import HelpPage from '@/pages/citizen/HelpPage';
import StatusPage from '@/pages/StatusPage';
import ShowcasePage from '@/pages/ShowcasePage';
import NotFoundPage, { TrackComplaintPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            <Route element={<UserRoute />}>
              <Route path="/track/:grievanceId" element={<TrackGrievancePage />} />
              <Route path="/user" element={<CitizenLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CitizenDashboardPage />} />
                <Route path="complaints/new" element={<RegisterGrievancePage />} />
                <Route path="register" element={<Navigate to="/user/complaints/new" replace />} />
                <Route path="complaints" element={<MyComplaintsPage />} />
                <Route path="complaints/:id" element={<ComplaintDetailPage />} />
                <Route path="track" element={<TrackComplaintPage />} />
                <Route path="notifications" element={<CitizenNotificationsPage />} />
                <Route path="profile" element={<CitizenProfilePage />} />
                <Route path="help" element={<HelpPage />} />
              </Route>
            </Route>

            <Route element={<DepartmentRoute />}>
              <Route path="/department" element={<AuthorityLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AuthorityDashboardPage />} />
                <Route path="complaints" element={<AuthorityGrievancesPage />} />
                <Route path="complaints/:id" element={<AuthorityGrievanceDetailPage />} />
                <Route path="sla" element={<SLAMonitoringPage />} />
                <Route path="duplicates" element={<DuplicatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="notifications" element={<AuthorityNotificationsPage />} />
                <Route path="profile" element={<AuthorityProfilePage />} />
              </Route>
            </Route>

            <Route element={<HeadRoute />}>
              <Route path="/head" element={<AuthorityLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AuthorityDashboardPage />} />
                <Route path="complaints" element={<AuthorityGrievancesPage />} />
                <Route path="complaints/:id" element={<AuthorityGrievanceDetailPage />} />
                <Route path="sla" element={<SLAMonitoringPage />} />
                <Route path="duplicates" element={<DuplicatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="hotspots" element={<HotspotsPage />} />
                <Route path="insights" element={<AIInsightsPage />} />
                <Route path="policy-impact" element={<PolicyImpactPage />} />
                <Route path="notifications" element={<AuthorityNotificationsPage />} />
                <Route path="profile" element={<AuthorityProfilePage />} />
              </Route>
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="departments" element={<AdminDepartmentsPage />} />
                <Route path="department-heads" element={<AdminDepartmentHeadsPage />} />
                <Route path="department-users" element={<AdminDepartmentUsersPage />} />
                <Route path="complaints" element={<AuthorityGrievancesPage />} />
                <Route path="complaints/:id" element={<AuthorityGrievanceDetailPage />} />
                <Route path="sla" element={<SLAMonitoringPage />} />
                <Route path="duplicates" element={<DuplicatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="hotspots" element={<HotspotsPage />} />
                <Route path="insights" element={<AIInsightsPage />} />
                <Route path="policy-impact" element={<PolicyImpactPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="security" element={<AdminSecurityPage />} />
                <Route path="notifications" element={<AuthorityNotificationsPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="health" element={<AdminHealthPage />} />
                <Route path="profile" element={<AuthorityProfilePage />} />
              </Route>
            </Route>

            <Route path="/citizen/*" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/authority/*" element={<Navigate to="/head/dashboard" replace />} />
            <Route path="/officer/*" element={<Navigate to="/department/dashboard" replace />} />

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
