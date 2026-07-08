import React from 'react';
import Link from 'next/link';

export default function FAQ() {
  return (
    <div className="animate-fade-in container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <nav style={{ marginBottom: '2rem', color: 'var(--text-gray)' }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>FAQ</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-white)' }}>
          FAQ
        </h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>
          Pertanyaan yang sering diajukan.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-white)', marginBottom: '0.5rem' }}>Bagaimana cara top up?</h3>
          <p style={{ color: 'var(--text-gray)' }}>Pilih game, masukkan ID, pilih nominal, dan bayar. Diamond akan masuk otomatis.</p>
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-white)', marginBottom: '0.5rem' }}>Berapa lama proses masuk?</h3>
          <p style={{ color: 'var(--text-gray)' }}>Hanya butuh 1-3 detik setelah pembayaran berhasil.</p>
        </div>
      </div>
    </div>
  );
}
