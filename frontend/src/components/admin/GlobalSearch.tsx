import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, FileText, Building2 } from 'lucide-react';
import { globalAdminSearch, type GlobalSearchResult } from '@/services/adminService';
import { cn } from '@/utils/cn';

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await globalAdminSearch(q);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const hasResults =
    results &&
    (results.users.length > 0 || results.grievances.length > 0 || results.departments.length > 0);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grace-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search users, complaints, departments…"
          className="w-full min-h-[44px] rounded-xl border border-grace-border bg-white py-2 pl-10 pr-4 text-sm focus:border-grace-coffee focus:outline-none focus:ring-2 focus:ring-grace-coffee/20 lg:w-80"
          aria-label="Global search"
        />
      </div>

      {open && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-grace-border bg-white shadow-lg">
          {loading && <p className="p-4 text-sm text-grace-muted">Searching…</p>}
          {!loading && !hasResults && (
            <p className="p-4 text-sm text-grace-muted">No results for &quot;{query}&quot;</p>
          )}
          {!loading && hasResults && results && (
            <div className="divide-y divide-grace-border p-2">
              {results.grievances.length > 0 && (
                <section className="p-2">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-grace-muted">
                    <FileText className="h-3 w-3" /> Complaints
                  </p>
                  {results.grievances.map((g) => (
                    <button
                      key={g._id}
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-grace-sand"
                      onMouseDown={() => {
                        navigate(`/admin/complaints/${g._id}`);
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <span className="font-medium">{g.grievanceId}</span>
                      <span className="ml-2 text-grace-muted">{g.title}</span>
                    </button>
                  ))}
                </section>
              )}
              {results.users.length > 0 && (
                <section className="p-2">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-grace-muted">
                    <User className="h-3 w-3" /> Users
                  </p>
                  {results.users.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-grace-sand"
                      onMouseDown={() => {
                        navigate(`/admin/users?search=${encodeURIComponent(u.email)}`);
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <span className="font-medium">{u.name}</span>
                      <span className="ml-2 text-grace-muted">{u.email}</span>
                    </button>
                  ))}
                </section>
              )}
              {results.departments.length > 0 && (
                <section className="p-2">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-grace-muted">
                    <Building2 className="h-3 w-3" /> Departments
                  </p>
                  {results.departments.map((d) => (
                    <button
                      key={d._id}
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-grace-sand"
                      onMouseDown={() => {
                        navigate('/admin/departments');
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      {d.name} <span className="text-grace-muted">({d.code})</span>
                    </button>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
