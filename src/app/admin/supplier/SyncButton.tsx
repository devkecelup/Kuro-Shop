"use client";

import React, { useState } from 'react';

export default function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSync = async () => {
    if (!confirm('Peringatan: Sinkronisasi akan menarik Ratusan Data Game & Harga baru dari VIP Reseller. Lanjutkan?')) {
      return;
    }

    setIsLoading(true);
    setMessage('Sedang menarik data dari API VIP Reseller. Harap tunggu...');
    
    try {
      const res = await fetch('/api/admin/sync-products', {
        method: 'POST',
      });
      const data = await res.json();
      
      setIsSuccess(data.success);
      setMessage(data.message);
    } catch (error: any) {
      setIsSuccess(false);
      setMessage('Gagal menghubungi server untuk sinkronisasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ color: 'var(--text-white)', fontSize: '1.2rem', marginBottom: '1rem' }}>Sinkronisasi Data Produk</h3>
      <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
        Tarik semua daftar game populer Indonesia dan harga-harga terbarunya (Otomatis ditambah margin 10%).
      </p>
      <button
        onClick={handleSync}
        disabled={isLoading}
        style={{
          padding: '12px 24px',
          backgroundColor: isLoading ? '#555' : 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {isLoading ? 'Sedang Memproses...' : 'Tarik Data & Harga Sekarang'}
      </button>

      {message && (
        <div style={{ marginTop: '1rem', padding: '10px', borderRadius: '8px', backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isSuccess ? '#10b981' : '#ef4444', border: `1px solid ${isSuccess ? '#10b981' : '#ef4444'}` }}>
          {message}
        </div>
      )}
    </div>
  );
}
