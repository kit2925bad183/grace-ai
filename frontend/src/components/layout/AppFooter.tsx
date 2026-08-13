import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GRACE_TAGLINE } from '@/components/brand/BrandLogo';
import { AGILE_FORCES_TEAM } from '@/constants/graceIdentity';

interface AppFooterProps {
  tagline?: string;
}

export function AppFooter({ tagline = GRACE_TAGLINE }: AppFooterProps) {
  return (
    <footer className="border-t border-civic-border bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-primary">
            <Shield className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-civic-text">GRACE AI</p>
            <p className="text-sm text-civic-muted">{tagline}</p>
            <p className="mt-1 text-xs font-semibold text-civic-primary">AGILE FORCES</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-civic-muted">
          <Link to="/#about" className="hover:text-civic-primary">
            About
          </Link>
          <Link to="/login" className="hover:text-civic-primary">
            Login
          </Link>
          <Link to="/register" className="hover:text-civic-primary">
            Register
          </Link>
          <Link to="/status" className="hover:text-civic-primary">
            System Status
          </Link>
        </nav>
      </div>
      <div className="mx-auto mt-6 max-w-6xl border-t border-civic-border pt-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-civic-muted">
          AGILE FORCES
        </p>
        <ul className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-civic-muted">
          {AGILE_FORCES_TEAM.map((m) => (
            <li key={m.register}>
              {m.name} — {m.register}
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-civic-muted">
        &copy; {new Date().getFullYear()} GRACE AI. All rights reserved.
      </p>
    </footer>
  );
}
