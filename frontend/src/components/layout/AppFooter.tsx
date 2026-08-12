import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GRACE_TAGLINE } from '@/components/brand/BrandLogo';

interface AppFooterProps {
  tagline?: string;
}

export function AppFooter({ tagline = GRACE_TAGLINE }: AppFooterProps) {
  return (
    <footer className="border-t border-grace-border bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-grace-coffee">
            <Shield className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-grace-text">GRACE AI</p>
            <p className="text-sm text-grace-muted">{tagline}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-grace-muted">
          <Link to="/" className="hover:text-grace-coffee">About</Link>
          <Link to="/login" className="hover:text-grace-coffee">Login</Link>
          <Link to="/register" className="hover:text-grace-coffee">Register</Link>
          <Link to="/status" className="hover:text-grace-coffee">System Status</Link>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-grace-muted">
        &copy; {new Date().getFullYear()} GRACE AI. All rights reserved.
      </p>
    </footer>
  );
}
