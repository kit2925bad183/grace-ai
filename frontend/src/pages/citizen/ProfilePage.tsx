import { useState, FormEvent } from 'react';
import { Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/components/grievance/GrievanceBadges';
import { PasswordStrength, isPasswordValid } from '@/components/auth/PasswordStrength';
import * as authService from '@/services/authService';
import { useToast } from '@/contexts/ToastContext';

export default function CitizenProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile({ name: form.name.trim(), phone: form.phone.trim() || undefined });
      await refreshUser();
      setEditing(false);
      toast('Profile updated successfully', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid(passwordForm.newPassword)) {
      toast('Password does not meet requirements', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast('Password changed. Please sign in again.', 'success');
      await logout();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Password change failed', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Profile</h1>
        <button type="button" onClick={() => logout()} className="btn-secondary inline-flex items-center gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-100 text-xl font-bold text-navy-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-navy-900">{user.name}</p>
            <p className="text-sm text-navy-500">{user.email}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium text-navy-700">{user.role}</span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Unverified</span>
              )}
              {user.authProvider && (
                <span className="rounded-full bg-grace-blue/10 px-2 py-0.5 text-xs font-medium text-grace-blue">{user.authProvider}</span>
              )}
            </div>
          </div>
        </div>

        {!editing ? (
          <>
            <ProfileField label="Phone" value={user.phone ?? '—'} />
            <ProfileField label="Account Created" value={user.createdAt ? formatDate(user.createdAt) : '—'} />
            <button type="button" onClick={() => { setForm({ name: user.name, phone: user.phone || '' }); setEditing(true); }} className="btn-secondary">
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field mt-1" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {(user.authProvider === 'LOCAL' || user.authProvider === 'BOTH') && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input-field" required />
            <input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input-field" required />
            {passwordForm.newPassword && <PasswordStrength password={passwordForm.newPassword} />}
            <input type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input-field" required />
            <button type="submit" disabled={changingPassword} className="btn-primary inline-flex items-center gap-2">
              {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      )}
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
