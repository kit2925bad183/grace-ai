import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { getRoleDashboardPath } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NotFoundPage() {
  const { user } = useAuth();
  const dashboardPath = user ? getRoleDashboardPath(user.role) : '/';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50 px-4">
      <p className="text-6xl font-bold text-navy-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-md text-center text-sm text-navy-600">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={dashboardPath} className="btn-primary inline-flex items-center gap-2">
          <Home className="h-4 w-4" />
          Return to dashboard
        </Link>
        <Link to="/" className="btn-secondary inline-flex items-center gap-2">
          <Search className="h-4 w-4" />
          Go to home
        </Link>
      </div>
    </div>
  );
}

import { usePortalPaths } from '@/utils/portalPaths';

export function TrackComplaintPage() {
  const paths = usePortalPaths();
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Track Complaint"
        subtitle="Enter your complaint ID to view status and timeline"
        breadcrumbs={[
          { label: 'Dashboard', to: paths.dashboard },
          { label: 'Track Complaint' },
        ]}
      />
      <TrackComplaintForm basePath="/track" />
    </div>
  );
}

export function TrackComplaintForm({ basePath = '/track' }: { basePath?: string }) {
  const [grievanceId, setGrievanceId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = grievanceId.trim().toUpperCase();
    if (id) navigate(`${basePath}/${id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label htmlFor="grievanceId" className="block text-sm font-medium text-navy-700">
          Grievance ID
        </label>
        <input
          id="grievanceId"
          type="text"
          value={grievanceId}
          onChange={(e) => setGrievanceId(e.target.value)}
          placeholder="GRV-2026-XXXX"
          className="input-field mt-1 font-mono uppercase"
          required
          pattern="GRV-[0-9]{4}-[0-9]+"
          title="Format: GRV-YYYY-XXXX"
        />
        <p className="mt-1 text-xs text-navy-500">Example: GRV-2026-1042</p>
      </div>
      <button type="submit" className="btn-primary w-full">
        Track Complaint
      </button>
    </form>
  );
}
