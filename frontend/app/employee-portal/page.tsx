'use client';

import React, { useEffect, useState } from 'react';
import { useRouter }                  from 'next/navigation';
import { jwtDecode }                  from 'jwt-decode';
import Link                           from 'next/link';
import styles                         from './EmployeePortal.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type TokenPayload = {
  sub: string;    // user ID
  exp: number;    // expiration (seconds since epoch)
};

type User = {
  id:         string;
  username:   string;
  email:      string;
  role:       string;
  department: string;
  lastLogin:  string;
  status:     string;
};

type Employee = {
  id:         string;
  username:   string;
  email:      string;
  role:       string;
  department: string;
  lastLogin:  string;
  status:     string;
};

export default function EmployeePortal() {
  const router = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [results, setResults] = useState<Employee[]>([]);
  const [error,   setError]   = useState<string>('');

  // Load the logged-in user’s profile
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      try {
        const { sub, exp } = jwtDecode<TokenPayload>(token);
        if (exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        const res = await fetch(`${API_BASE}/api/employees/${sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to load profile');
        }

        const userData: User = await res.json();
        setUser(userData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Invalid token');
      }
    }

    loadUser();
  }, [router]);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!user)  return <p className={styles.loading}>Loading user…</p>;

  return (
    <div className={styles.employeePortalContainer}>
      <div className={styles.employeePortalForm}>

        {/* Your Profile Summary */}
        <section className={styles.profileCard}>
          <h3>Your Profile</h3>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Role:</strong>     {user.role}</p>
          <p><strong>Dept:</strong>     {user.department}</p>
          <p><strong>Email:</strong>    {user.email}</p>
          <p>
            <strong>Last Login:</strong>{' '}
            {new Date(user.lastLogin).toLocaleString()}
          </p>
          <p><strong>Status:</strong>   {user.status}</p>
          <button
            className={styles.button}
            onClick={() => router.push(`/profile/${user.id}/edit`)}
          >
            Edit Profile
          </button>
        </section>

        {/* Search by username only */}
        <SearchByUsername onResults={setResults} />

        {/* Search Results */}
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Dept</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.noResults}>
                  No results found
                </td>
              </tr>
            ) : (
              results.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.username}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.role}</td>
                  <td>{emp.status}</td>
                  <td>{new Date(emp.lastLogin).toLocaleString()}</td>
                  <td className={styles.resultActions}>
                    <Link href={`/profile/${emp.id}`} className={styles.viewLink}>
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SearchByUsername({
  onResults,
}: {
  onResults: (emps: Employee[]) => void;
}) {
  const [term,    setTerm]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('jwt') || '';
      const res   = await fetch(
        `${API_BASE}/api/employees?search=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Search failed');
      }

      // backend returns a raw array of Employee objects
      const employees = (await res.json()) as Employee[];
      onResults(employees);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={styles.searchForm}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search by username…"
        value={term}
        onChange={e => setTerm(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className={styles.button}
        disabled={loading || !term.trim()}
      >
        {loading ? 'Searching…' : 'Search'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}