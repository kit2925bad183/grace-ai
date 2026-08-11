import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/components/grievance/GrievanceBadges';

export default function CitizenProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Profile</h1>
      <div className="card space-y-4">
        <ProfileField label="Name" value={user.name} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Phone" value={user.phone ?? '—'} />
        <ProfileField label="Role" value={user.role} />
        <ProfileField
          label="Account Created"
          value={user.createdAt ? formatDate(user.createdAt) : '—'}
        />
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-navy-50 pb-3 last:border-0">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-navy-900">{value}</p>
    </div>
  );
}
