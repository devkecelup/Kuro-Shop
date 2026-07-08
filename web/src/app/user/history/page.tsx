"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function UserHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, this would come from a session context (next-auth)
  const userEmail = 'user@example.com'; 

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/user/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });
        const result = await res.json();
        
        if (result.success && result.data) {
          setTransactions(result.data);
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1rem', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-white)' }}>
        Riwayat Transaksi
      </h1>

      {loading ? (
        <div style={{ color: 'var(--text-gray)' }}>Memuat riwayat transaksi...</div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
          <h2 style={{ color: 'var(--text-white)', marginBottom: '1rem' }}>Belum ada transaksi</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Anda belum melakukan pembelian apapun.</p>
          <Link href="/" style={{ padding: '12px 24px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {transactions.map((trx) => (
            <div key={trx.id} style={{ 
              backgroundColor: 'var(--bg-card)', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '0.5rem' }}>
                  {new Date(trx.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-white)', marginBottom: '0.25rem' }}>{trx.game_name}</h3>
                <p style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{trx.item_name}</p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.5rem' }}>
                  ID Transaksi: {trx.id}
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-white)', marginBottom: '0.5rem' }}>
                  Rp {trx.price.toLocaleString('id-ID')}
                </div>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  backgroundColor: 
                    trx.status === 'Sukses' ? 'rgba(16, 185, 129, 0.2)' : 
                    trx.status === 'Dikirim' ? 'rgba(59, 130, 246, 0.2)' :
                    trx.status === 'Diproses' ? 'rgba(168, 85, 247, 0.2)' :
                    trx.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: 
                    trx.status === 'Sukses' ? '#10b981' : 
                    trx.status === 'Dikirim' ? '#3b82f6' :
                    trx.status === 'Diproses' ? '#a855f7' :
                    trx.status === 'Pending' ? '#f59e0b' : '#ef4444',
                  border: `1px solid ${
                    trx.status === 'Sukses' ? '#10b981' : 
                    trx.status === 'Dikirim' ? '#3b82f6' :
                    trx.status === 'Diproses' ? '#a855f7' :
                    trx.status === 'Pending' ? '#f59e0b' : '#ef4444'
                  }`
                }}>
                  {trx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
