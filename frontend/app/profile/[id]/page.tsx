'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams }       from 'next/navigation';
import styles                         from './Profile.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type ProfileData = {
  username:   string;
  fullName:   string;
  email:      string;
  phone:      string;
  department: string;
  role:       string;
  location:   string;
  status:     string;
  lastLogin:  string;
};

export default function ViewProfilePage() {
  const { id }    = useParams();
  const router    = useRouter();
  const [data,    setData]    = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      router.replace('/login');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          router.replace('/login');
          return;
        }
        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status}`);
        }
        const json = (await res.json()) as ProfileData;
        setData(json);
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading)  return <p className={styles.loading}>Loading…</p>;
  if (error || !data) return <p className={styles.error}>{error || 'Profile not found'}</p>;

  return (
    <div className={styles.editContainer}>
      <div className={styles.editCard}>
        <h2>Profile</h2>

        <div className={styles.form}>
          {[
            ['Username',   data.username],
            ['Full Name',  data.fullName ],
            ['Email',      data.email    ],
            ['Phone',      data.phone    ],
            ['Department', data.department],
            ['Role',       data.role     ],
            ['Location',   data.location ],
            ['Status',     data.status   ],
            ['Last Login', new Date(data.lastLogin).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className={styles.field}>
              <label>{label}</label>
              <div className={styles.value}>{value}</div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={() => router.push('/employee-portal')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}