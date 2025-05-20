// src/app/profile/[id]/edit/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams }       from "next/navigation";
import styles                         from "../Profile.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// exactly matches the shape you store in users.json
type FormData = {
  username:   string;
  password:   string;
  fullName:   string;
  email:      string;
  phone:      string;
  department: string;
  role:       string;
  location:   string;
  status:     string;
};

// helpfully type the list of editable fields
const FIELDS: Array<{
  label: string;
  key: keyof FormData;
  type: "text" | "password" | "email" | "tel";
  required?: boolean;
}> = [
  { label: "Username",    key: "username",   type: "text" },
  { label: "New Password",key: "password",   type: "password", required: false },
  { label: "Full Name",   key: "fullName",   type: "text" },
  { label: "Email",       key: "email",      type: "email" },
  { label: "Phone",       key: "phone",      type: "tel" },
  { label: "Department",  key: "department", type: "text" },
  { label: "Role",        key: "role",       type: "text" },
  { label: "Location",    key: "location",   type: "text" },
];

export default function EditProfilePage() {
  const { id }    = useParams();
  const router    = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username:   "",
    password:   "",
    fullName:   "",
    email:      "",
    phone:      "",
    department: "",
    role:       "",
    location:   "",
    status:     "active",
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // 1) load existing profile
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status}`);
        }

        const data = (await res.json()) as FormData;
        // clear password on load
        setFormData({ ...data, password: "" });
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  // 2) handle submit
  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setError("");

    const token = localStorage.getItem("jwt");
    if (!token) {
      router.replace("/login");
      return;
    }

    // only include password if user typed one
    const payload: Partial<FormData> = { ...formData };
    if (!formData.password) {
      delete payload.password;
    }

    try {
      const res = await fetch(`${API_BASE}/api/employees/${id}`, {
        method:  "PUT",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        throw new Error(`Update failed: ${res.status}`);
      }
      router.push("/employee-portal");
    } catch {
      setError("Update failed");
    }
  };

  if (loading) {
    return <p className={styles.loading}>Loading…</p>;
  }

  return (
    <div className={styles.editContainer}>
      <div className={styles.editCard}>
        <h2>Edit Profile</h2>
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {FIELDS.map(({ label, key, type, required = true }) => (
            <div key={key} className={styles.field}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                type={type}
                value={formData[key]}
                required={required}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                className={styles.input}
              />
            </div>
          ))}

          {/* status dropdown */}
          <div className={styles.field}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, status: e.target.value }))
              }
              className={styles.input}
            >
              <option value="active">active</option>
              <option value="on leave">on leave</option>
              <option value="terminated">terminated</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.button}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}