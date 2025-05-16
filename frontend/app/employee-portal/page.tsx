// src/app/employee-portal/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './EmployeePortal.module.css';

type User = {
  id:         string;
  username:   string;
  role:       string;
  department: string;
};

const sampleResults = [
  { id: '1', name: 'Alice Smith', department: 'Engineering' },
  { id: '2', name: 'Bob Jones',   department: 'Sales' },
  { id: '3', name: 'Carol Lee',   department: 'HR' },
];

export default function EmployeePortal() {
  const [user, setUser]       = useState<User|null>(null);
  const [error, setError]     = useState<string>('');
  const [results, setResults] = useState<typeof sampleResults>([]);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      // Dummy user data for demo
      setUser({
        id:         '1',
        username:   'test',
        role:       'test',
        department: 'test',
      });
      // Load sample results for layout
      setResults(sampleResults);
    }
    loadProfile();
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!user)  return <p className={styles.loading}>Loading…</p>;

  return (
    <div className={styles.employeePortalContainer}>
      <div className={styles.employeePortalForm}>
        <h2>Employee Portal</h2>
        <p className={styles.greeting}>Hello, <strong>{user.username}</strong>!</p>
        <p className={styles.info}><strong>Role:</strong> {user.role}</p>
        <p className={styles.info}><strong>Department:</strong> {user.department}</p>

        <Link href={`/profile/edit/${user.id}`} className={styles.updateLink}>
  Update Profile
</Link>

        <SearchForm onSearch={q => setResults(
          sampleResults.filter(r => r.name.toLowerCase().includes(q.toLowerCase()))
        )} />

        <div className={styles.resultsContainer}>
          {results.length === 0
            ? <p className={styles.noResults}>No results</p>
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