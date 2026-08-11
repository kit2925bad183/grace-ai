import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <div className="max-w-md rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-elevated">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-grace-critical" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900">Access Denied</h1>
        <p className="mt-2 text-sm text-navy-600">
          You do not have permission to access this page. Please sign in with an account that has
          the required role.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
          <Link to="/" className="btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
