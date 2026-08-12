import { Link } from 'react-router-dom';
import { Mail, Phone, Shield } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { FaqAccordion } from '@/components/ui/HelpPanel';
import { QuickActionCard } from '@/components/ui/QuickActionCard';
import { FileText, Search } from 'lucide-react';
import { CITIZEN_HELP } from '@/utils/helpContent';
import { usePortalPaths } from '@/utils/portalPaths';

export default function HelpPage() {
  const paths = usePortalPaths();

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Help Center"
        subtitle="Simple answers for reporting issues, tracking complaints, and using GRACE AI."
        breadcrumbs={[{ label: 'Dashboard', to: paths.dashboard }, { label: 'Help' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickActionCard
          icon={FileText}
          title="Submit a complaint"
          description="Report a public issue in a guided step-by-step flow."
          actionLabel="Report a Problem"
          to={paths.complaintNew}
          variant="primary"
        />
        <QuickActionCard
          icon={Search}
          title="Track your complaint"
          description="Use your complaint ID to see live status updates."
          actionLabel="Track Complaint"
          to={paths.track}
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-grace-text">Frequently asked questions</h2>
        <div className="mt-4">
          <FaqAccordion items={CITIZEN_HELP} />
        </div>
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-grace-text">
          <Shield className="h-5 w-5 text-grace-coffee" /> Your privacy
        </h2>
        <p className="mt-3 text-sm text-grace-muted">
          You can only view complaints you submitted. Departments see cases assigned to them.
          Administrators monitor overall performance — never your password or private credentials.
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-grace-text">Contact</h2>
        <ul className="mt-4 space-y-2 text-sm text-grace-muted">
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-grace-sandal" /> support@grace.ai
          </li>
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-grace-sandal" /> 1800-GRACE-AI
          </li>
        </ul>
        <Link to={paths.complaintNew} className="btn-primary mt-4 inline-flex">
          Report a Problem
        </Link>
      </section>
    </div>
  );
}
