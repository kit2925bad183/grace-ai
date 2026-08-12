import { FormEvent, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { createDepartment, listAdminDepartments, updateDepartment, type AdminDepartment } from '@/services/adminService';
import { useToast } from '@/contexts/ToastContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/Dialog';

export default function AdminDepartmentsPage() {
  const { success, error: toastError } = useToast();
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    officeAddress: '',
  });

  const load = () => {
    setLoading(true);
    listAdminDepartments()
      .then(setDepartments)
      .catch((e) => toastError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createDepartment(form);
      success('Department created successfully.');
      setShowForm(false);
      setForm({ name: '', code: '', description: '', contactEmail: '', contactPhone: '', officeAddress: '' });
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to create department');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await updateDepartment(deactivateId, { active: false });
      success('Department deactivated.');
      setDeactivateId(null);
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to deactivate');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Departments"
        subtitle="Create and manage departments. Only admins can create departments."
        actions={
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary inline-flex gap-2">
            <Plus className="h-4 w-4" /> Create Department
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card grid gap-4 sm:grid-cols-2">
          <Field label="Department Name" required>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Code" required>
            <input className="input-field uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Contact Email">
            <input type="email" className="input-field" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </Field>
          <Field label="Contact Phone">
            <input className="input-field" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </Field>
          <Field label="Office Address" className="sm:col-span-2">
            <input className="input-field" value={form.officeAddress} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })} />
          </Field>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn-primary">Create Department</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-grace-sand" />
      ) : departments.length === 0 ? (
        <EmptyState title="No departments yet" message="Create your first department to begin routing complaints." actionLabel="Create Department" onAction={() => setShowForm(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div key={d._id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-grace-text">{d.name}</h3>
                  <p className="font-mono text-xs text-grace-muted">{d.code}</p>
                </div>
                <span className={`badge ${d.active ? 'bg-grace-success/15 text-grace-success' : 'bg-grace-muted/15 text-grace-muted'}`}>
                  {d.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div><p className="font-bold text-grace-text">{d.stats?.total ?? 0}</p><p className="text-grace-muted">Total</p></div>
                <div><p className="font-bold text-grace-warning">{d.stats?.pending ?? 0}</p><p className="text-grace-muted">Pending</p></div>
                <div><p className="font-bold text-grace-success">{d.stats?.resolved ?? 0}</p><p className="text-grace-muted">Resolved</p></div>
              </div>
              <p className="mt-3 text-xs text-grace-muted">Staff: {d.stats?.staff ?? 0}</p>
              {d.active && (
                <button type="button" onClick={() => setDeactivateId(d._id)} className="mt-3 text-sm text-grace-critical hover:underline">
                  Deactivate
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deactivateId}
        title="Deactivate this department?"
        message="This will prevent new assignments to this department. Historical complaints will remain intact."
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
        onClose={() => setDeactivateId(null)}
      />
    </div>
  );
}

function Field({ label, required, children, className = '' }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-grace-text">{label}{required && ' *'}</label>
      {children}
    </div>
  );
}
