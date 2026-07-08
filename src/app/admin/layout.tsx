import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'Admin') {
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-white)', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ marginBottom: '3rem', paddingLeft: '1rem' }}>
          <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>KuroAdmin</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500 }}>Dashboard Panel</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin" style={{ padding: '12px 16px', borderRadius: '8px', display: 'block', transition: 'all 0.2s', color: 'var(--text-white)', textDecoration: 'none', fontWeight: 600 }}>
            Dashboard
          </Link>
          <Link href="/admin/games" style={{ padding: '12px 16px', borderRadius: '8px', display: 'block', transition: 'all 0.2s', color: 'var(--text-white)', textDecoration: 'none', fontWeight: 600 }}>
            Kelola Game & Harga
          </Link>
          <Link href="/admin/supplier" style={{ padding: '12px 16px', borderRadius: '8px', display: 'block', transition: 'all 0.2s', color: 'var(--text-white)', textDecoration: 'none', fontWeight: 600 }}>
            Supplier (VIP Reseller)
          </Link>
          <Link href="/admin/transactions" style={{ padding: '12px 16px', borderRadius: '8px', display: 'block', transition: 'all 0.2s', color: 'var(--text-white)', textDecoration: 'none', fontWeight: 600 }}>
            Riwayat Transaksi
          </Link>
          <Link href="/admin/users" style={{ padding: '12px 16px', borderRadius: '8px', display: 'block', transition: 'all 0.2s', color: 'var(--text-white)', textDecoration: 'none', fontWeight: 600 }}>
            Kelola Pengguna
          </Link>
          <Link href="/admin/reviews" style={{ padding: '12px 16px', borderRadius: '8px', display: 'block', transition: 'all 0.2s', color: 'var(--text-white)', textDecoration: 'none', fontWeight: 600 }}>
            Ulasan Pelanggan
          </Link>
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Link href="/" style={{ padding: '12px 16px', borderRadius: '8px', display: 'block', transition: 'all 0.2s', color: 'var(--text-gray)', textDecoration: 'none', fontWeight: 600 }}>
              ← Kembali ke Toko
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
