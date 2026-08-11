import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <div className="hidden flex-1 flex-col justify-between p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
            <Shield className="h-6 w-6 text-grace-cyan" />
          </div>
          <div>
            <p className="text-xl font-bold">GRACE AI</p>
            <p className="text-sm text-navy-300">Smart Grievance Resolution</p>
          </div>
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold leading-tight">{title}</h1>
          <p className="mt-4 max-w-md text-lg text-navy-300">{subtitle}</p>
        </div>

        <p className="text-sm text-navy-400">
          Transparent Governance &middot; AI-Powered Grievance Redressal
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
