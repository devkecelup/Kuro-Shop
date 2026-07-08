import React from 'react';
import Link from 'next/link';

export default function Tentang() {
  return (
    <div className="animate-fade-in container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <nav style={{ marginBottom: '2rem', color: 'var(--text-gray)' }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Tentang Kami</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-white)' }}>
          Tentang Kami
        </h1>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', color: 'var(--text-gray)', lineHeight: '1.8' }}>
        <p>KuroShop adalah penyedia layanan top up game dan voucher terpercaya di Indonesia. Kami menyediakan proses yang instan, aman, dan harga yang bersahabat.</p>
      </div>
    </div>
  );
}
