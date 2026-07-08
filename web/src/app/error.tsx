"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--primary-color)', margin: 0, lineHeight: 1 }}>500</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-white)' }}>Terjadi Kesalahan Sistem</h2>
      <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px' }}>
        Mohon maaf, sepertinya server kami sedang mengalami sedikit gangguan. Tim kami sudah diberitahu dan sedang memperbaikinya.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: '#ffffff',
            padding: '12px 30px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(230, 0, 0, 0.3)'
          }}
        >
          Coba Lagi
        </button>
        <Link href="/" style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-white)',
          padding: '12px 30px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          textDecoration: 'none',
          border: '1px solid var(--border-color)'
        }}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
