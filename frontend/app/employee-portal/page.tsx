// src/app/employee-portal/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import styles from './EmployeePortal.module.css';

// Hardcoded search results for now
const sampleResults: Employee[] = [
  { id: '1', name: 'Alice Smith',   department: 'Engineering' },
  { id: '2', name: 'Bob Jones',     department: 'Sales' },
  { id: '3', name: 'Carol Lee',     department: 'HR' },
  { id: '4', name: 'David Nguyen',  department: 'Marketing' },
];

type JWTPayload = {
  id:         string;
  username:   string;
  role:       string;
  department: string;
  exp:        number;
};

type User = Omit<JWTPayload, 'exp'>;

type Employee = {
  id:         string;
  name:       string;
  department: string;
};

export default function EmployeePortal() {
  const [user, setUser]       = useState<User | null>(null);
  const [error, setError]     = useState<string>('');
  // Initialize results with hardcoded values
  const [results, setResults] = useState<Employee[]>(sampleResults);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('Not authenticated');
      return;
    }
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
      const { id, username, role, department } = decoded;
      setUser({ id, username, role, department });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid token');
    }
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!user) return <p className={styles.loading}>Loading user…</p>;

  return (
    <div className={styles.employeePortalContainer}>
      <div className={styles.employeePortalForm}>
        <h2>Employee Portal</h2>
        <p className={styles.greeting}>Hello, <strong>{user.username}</strong>!</p>
        <p className={styles.info}><strong>Role:</strong> {user.role}</p>
        <p className={styles.info}><strong>Department:</strong> {user.department}</p>

        <Link href={`http://localhost:3000/profile/${user.id}/edit`} className={styles.updateLink}>
          Update Profile
        </Link>

        {/* SearchForm left for future integration */}
        <SearchForm onSearch={q => {
          // placeholder: filter hardcoded results
          setResults(sampleResults.filter(r =>
            r.name.toLowerCase().includes(q.toLowerCase())
          ));
        }} />

        <div className={styles.resultsContainer}>
          {results.length === 0
            ? <p className={styles.noResults}>No results found</p>
            : results.map(emp => (
              <div key={emp.id} className={styles.resultItem}>
                <div>
                  <div className={styles.name}>{emp.name}</div>
                  <div className={styles.department}>{emp.department}</div>
                </div>
                <Link href={`/profile/${emp.id}`}> 
                  <a className={styles.viewLink}>View</a>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SearchForm({ onSearch }: { onSearch: (q: string) => void }) {
  const [term, setTerm] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term.trim());
  };
  return (
    <form onSubmit={submit} className={styles.searchForm}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search employees…"
        value={term}
        onChange={e => setTerm(e.target.value)}
      />
      <button type="submit" className={styles.button}>Search</button>
    </form>
  );
}
