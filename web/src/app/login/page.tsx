"use client";

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'NotRegistered') {
      setError('Akun belum terdaftar. Silakan daftar terlebih dahulu.');
    }
  }, [searchParams]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError("Email atau Password salah");
    } else {
      if (email === 'admin@kuroshop.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  };

  const handleGoogleLogin = () => {
    document.cookie = "oauth_action=login; path=/; max-age=60";
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '2.5rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img 
            src="https://i.postimg.cc/HkqPVjpH/Untitled-05-Juli-2026-pukul-22-44-39.png" 
            alt="Mascot Logo" 
            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
          />
        </div>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem' }}>
          Login to <span style={{ color: 'var(--primary-color)' }}>KuroShop</span>
        </h1>
        
        {error && (
          <div style={{
            backgroundColor: 'rgba(230, 0, 0, 0.1)',
            color: 'var(--primary-color)',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            border: '1px solid rgba(230, 0, 0, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-dark)',
                color: 'white',
                outline: 'none'
              }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-dark)',
                color: 'white',
                outline: 'none'
              }}
              required
            />
          </div>
          <button type="submit" style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            fontWeight: 'bold',
            marginTop: '0.5rem',
            transition: 'background-color 0.3s'
          }}>
            Sign In
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          color: 'var(--text-gray)'
        }}>
          <hr style={{ flex: 1, borderColor: 'var(--border-color)' }} />
          <span style={{ padding: '0 10px', fontSize: '0.9rem' }}>Atau Login Dengan</span>
          <hr style={{ flex: 1, borderColor: 'var(--border-color)' }} />
        </div>

        <button onClick={handleGoogleLogin} style={{
          width: '100%',
          backgroundColor: 'white',
          color: 'black',
          padding: '12px',
          borderRadius: '6px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
          Belum punya akun? <Link href="/register" style={{ color: 'var(--primary-color)' }}>Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
