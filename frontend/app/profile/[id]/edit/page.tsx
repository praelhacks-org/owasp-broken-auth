// src/app/profile/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "../../../employee-portal/EmployeePortal.module.css";

type FormData = {
  name: string;
  password: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          throw new Error(`Fetch failed with status ${res.status}`);
        }

        const data = await res.json();
        setFormData({
          name: data.username,
          password: "",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred";
        console.error(msg);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("jwt");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.name,
          password: formData.password,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        throw new Error(`Update failed with status ${res.status}`);
      }

      router.push(`/employee-portal`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error(msg);
      setError("Update failed");
    }
  };

  if (loading) return <p className={styles.loading}>Loading…</p>;

  return (
    <div className={styles.employeePortalContainer}>
      <div className={styles.employeePortalForm}>
        <h2>Edit Profile</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div style={{ marginBottom: '1rem' }}>
          <label className={styles.info} style={{ display: 'block', marginBottom: '0.5rem' }}>
            Name
          </label>
          <input
            className={styles.input}
            style={{ width: '100%' }}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className={styles.info} style={{ display: 'block', marginBottom: '0.5rem' }}>
            New Password
          </label>
          <input
            type="password"
            className={styles.input}
            style={{ width: '100%' }}
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          onClick={handleSubmit}
          style={{ alignSelf: "flex-start", marginTop: "1rem" }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
