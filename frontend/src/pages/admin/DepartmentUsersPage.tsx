import { FormEvent, useEffect, useState } from 'react';
import { createDepartmentUser, listAdminDepartments, listAdminUsers, type AdminDepartment, type AdminUser } from '@/services/adminService';
import { useToast } from '@/contexts/ToastContext';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminDepartmentUsersPage() {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', employeeCode: '', designation: '', password: '', departmentId: '' });

  const load = () => {
    listAdminUsers({ role: 'DEPARTMENT' }).then((r) => setUsers(r.items)).catch((e) => toastError(e instanceof Error ? e.message : 'Failed'));
    listAdminDepartments().then(setDepartments).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createDepartmentUser(form);
      success('Department user created successfully.');
      setShowForm(false);
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Department Users"
        subtitle="Create department staff accounts and assign them to a department."
        actions={<button type="button" onClick={() => setShowForm(true)} className="btn-primary">+ Create Department User</button>}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card grid gap-4 sm:grid-cols-2">
          <input className="input-field" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" className="input-field" placeholder="Official Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <select className="input-field sm:col-span-2" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} required>
            <option value="">Select Department *</option>
            {departments.filter((d) => d.active).map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field" placeholder="Employee ID" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
          <input className="input-field sm:col-span-2" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <input type="password" className="input-field sm:col-span-2" placeholder="Temporary Password *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">Create User</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-grace-border text-grace-muted"><th className="py-2">Name</th><th>Email</th><th>Department</th><th>Status</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-grace-border/50">
                <td className="py-3 font-medium">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.departmentId?.name ?? '—'}</td>
                <td>{u.status ?? 'ACTIVE'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
