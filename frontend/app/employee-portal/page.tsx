'use client';

import React, { useEffect, useState } from 'react';
import { useRouter }                    from 'next/navigation';
import { jwtDecode }                    from 'jwt-decode';
import Link                             from 'next/link';
import styles                           from './EmployeePortal.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TokenPayload = {
  sub: string;    // user ID
  exp: number;    // expiration (seconds since epoch)
};

type User = {
  id:         string;
  username:   string;
  role:       string;
  department: string;
};

type Employee = {
  id:         string;
  username:       string;
  department: string;
};

export default function EmployeePortal() {
  const router = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [error,   setError]   = useState<string>('');
  const [results, setResults] = useState<Employee[]>([]);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      try {
        // decode only for sub & exp
        const { sub, exp } = jwtDecode<TokenPayload>(token);
        if (exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        // fetch full user profile
        const res = await fetch(`${API_BASE}/api/employees/${sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to load user');
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
        <h2>Employee Portal</h2>

        <p className={styles.greeting}>
          Hello, <strong>{user.username}</strong>!
        </p>
        <p className={styles.info}>
          <strong>Role:</strong> {user.role}
        </p>
        <p className={styles.info}>
          <strong>Department:</strong> {user.department}
        </p>

        <Link
          href={`/profile/${user.id}/edit`}
          className={styles.updateLink}
        >
          Update Profile
        </Link>

        <SearchForm onResults={setResults} />

        <div className={styles.resultsContainer}>
          {results.length === 0 ? (
            <p className={styles.noResults}>No results found</p>
          ) : (
            results.map(emp => (
              <div key={emp.id} className={styles.resultItem}>
                <div>
                  <div className={styles.username}>{emp.username}</div>
                  <div className={styles.department}>{emp.department}</div>
                </div>
                <Link href={`/profile/${emp.id}`} className={styles.viewLink}>
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SearchForm({
  onResults,
}: {
  onResults: (results: Employee[]) => void;
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Search failed');
      }

      const data: Employee[] = await res.json();
      onResults(data);
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
        placeholder="Search employees…"
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