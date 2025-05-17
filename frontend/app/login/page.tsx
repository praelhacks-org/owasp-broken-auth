'use client';

import React, { useState } from 'react';
import { useRouter }      from 'next/navigation';
import styles             from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await fetch('/api/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Login failed');
      }

      // API now returns only { message, token }
      const { token } = await res.json() as { token: string };

      if (!token) {
        throw new Error('No token returned from server');
      }

      // store JWT and navigate client-side
      localStorage.setItem('jwt', token);
      router.push('/employee-portal');

    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred'
      );
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <h2>Sign In</h2>

        <input
          type="text"
          className={styles.input}
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />

        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button type="submit" className={styles.button}>
          Log In
        </button>

        {errorMessage && (
          <p className={styles.error}>{errorMessage}</p>
        )}
      </form>
    </div>
  );
}