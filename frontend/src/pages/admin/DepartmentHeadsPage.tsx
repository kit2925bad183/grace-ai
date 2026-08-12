import { FormEvent, useEffect, useState } from 'react';
import { createHead, listAdminHeads, type AdminUser } from '@/services/adminService';
import { useToast } from '@/contexts/ToastContext';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminDepartmentHeadsPage() {
  const { success, error: toastError } = useToast();
  const [heads, setHeads] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', employeeCode: '', designation: '', password: '' });

  const load = () => listAdminHeads().then(setHeads).catch((e) => toastError(e instanceof Error ? e.message : 'Failed'));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createHead(form);
      success('Department Head account created successfully.');
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', employeeCode: '', designation: '', password: '' });
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to create head');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Department Heads"
        subtitle="Only admins can create Head of All Departments accounts."
        actions={<button type="button" onClick={() => setShowForm(true)} className="btn-primary">+ Create Department Head</button>}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card grid gap-4 sm:grid-cols-2">
          <input className="input-field" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" className="input-field" placeholder="Official Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field" placeholder="Employee ID" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
          <input className="input-field sm:col-span-2" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <input type="password" className="input-field sm:col-span-2" placeholder="Temporary Password *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">Create Head</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-grace-border text-grace-muted"><th className="py-2">Name</th><th>Email</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {heads.map((h) => (
              <tr key={h._id} className="border-b border-grace-border/50">
                <td className="py-3 font-medium text-grace-text">{h.name}</td>
                <td>{h.email}</td>
                <td>{h.status ?? 'ACTIVE'}</td>
                <td>{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
