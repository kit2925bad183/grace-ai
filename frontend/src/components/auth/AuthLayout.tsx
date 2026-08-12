import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GRACE_TAGLINE } from '@/components/brand/BrandLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-grace-sand">
      <div className="hidden flex-1 flex-col justify-between bg-grace-coffee p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Shield className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-bold">GRACE AI</p>
            <p className="text-sm text-grace-sand/90">{GRACE_TAGLINE}</p>
          </div>
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold leading-tight">{title}</h1>
          <p className="mt-4 max-w-md text-lg text-grace-sand/90">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-grace-sand/80">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Secure authentication · MongoDB-backed · Role-based access
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-4 sm:p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
