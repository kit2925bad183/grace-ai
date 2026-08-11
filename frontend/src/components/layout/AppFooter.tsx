import { Shield } from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';

export function AppFooter() {
  return (
    <footer className="border-t border-navy-100 bg-navy-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Shield className="h-5 w-5 text-grace-cyan" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold">GRACE AI</p>
            <p className="text-sm text-navy-300">Smart Grievance Resolution. Transparent Governance.</p>
            <p className="mt-1 text-xs text-navy-400">AI for Smart Governance &amp; Citizen Empowerment</p>
          </div>
        </div>
        <DemoBadge />
      </div>
      <p className="mx-auto mt-6 max-w-7xl text-center text-xs text-navy-500 md:text-right">
        &copy; {new Date().getFullYear()} GRACE AI — Hackathon Demonstration Platform
      </p>
    </footer>
  );
}
