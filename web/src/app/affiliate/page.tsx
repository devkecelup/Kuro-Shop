import React from 'react';
import Link from 'next/link';

export default function Affiliate() {
  return (
    <div className="animate-fade-in container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <nav style={{ marginBottom: '2rem', color: 'var(--text-gray)' }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Affiliate</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-white)' }}>
          Program Affiliate
        </h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>
          Dapatkan komisi untuk setiap teman yang mendaftar dan bertransaksi melalui link Anda.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-white)' }}>Gabung Sekarang</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Dapatkan komisi hingga 5% dari total transaksi referral Anda.</p>
        <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none' }}>
          Daftar Affiliate
        </button>
      </div>
    </div>
  );
}
