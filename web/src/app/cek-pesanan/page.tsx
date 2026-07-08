"use client";

import React, { useState } from 'react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';

export default function CekPesanan() {
  const [invoice, setInvoice] = useState('');
  const [trxData, setTrxData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async () => {
    if (!invoice) return;
    setLoading(true);
    setErrorMsg('');
    setTrxData(null);
    
    const res = await fetch('/api/cek-pesanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice })
    });
    
    const result = await res.json();
      
    if (!res.ok || !result.success) {
      setErrorMsg(result.message || 'Pesanan tidak ditemukan. Pastikan nomor invoice benar.');
    } else {
      setTrxData(result.data);
    }
    setLoading(false);
  };

  const getStatusSteps = (status: string) => {
    // Basic logic for visual steps
    if (status === 'Pending') return 1;
    if (status === 'Diproses') return 2;
    if (status === 'Dikirim') return 3;
    if (status === 'Sukses' || status === 'Berhasil') return 4;
    return 0; // Gagal or unknown
  };

  const currentStep = trxData ? getStatusSteps(trxData.status) : 0;

  return (
    <div className="animate-fade-in container" style={{ padding: '4rem 1rem', maxWidth: '900px' }}>
      <nav style={{ marginBottom: '2rem', color: 'var(--text-gray)' }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Cek Pesanan</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--primary-color)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Tracking Real-Time
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-white)' }}>
          Cek Status Pesananmu
        </h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>
          Masukkan nomor invoice (ID Transaksi) untuk memantau status transaksi secara real-time.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        backgroundColor: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Contoh: TRX-123456"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-dark)',
                color: 'var(--text-white)',
                fontSize: '1rem'
              }}
            />
            <button className="btn-primary" onClick={handleTrack} disabled={loading} style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Melacak...' : 'Lacak'}
            </button>
          </div>

          {errorMsg && (
            <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #ef4444' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1: Pending */}
            <div style={{ display: 'flex', gap: '1rem', opacity: currentStep >= 1 ? 1 : 0.5 }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: currentStep >= 1 ? 'var(--primary-color)' : 'var(--border-color)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
              }}>
                ✓
              </div>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Pending</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', margin: 0 }}>Pesanan diterima sistem</p>
              </div>
            </div>

            {/* Step 2: Diproses */}
            <div style={{ display: 'flex', gap: '1rem', opacity: currentStep >= 2 ? 1 : 0.5 }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: currentStep >= 2 ? '#a855f7' : 'var(--border-color)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
              }}>
                ✓
              </div>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Diproses</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', margin: 0 }}>Sedang diproses oleh server/admin</p>
              </div>
            </div>

            {/* Step 3: Dikirim / Sukses */}
            <div style={{ display: 'flex', gap: '1rem', opacity: currentStep >= 4 ? 1 : (currentStep === 3 ? 1 : 0.5) }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: currentStep >= 4 ? '#10b981' : (currentStep === 3 ? '#3b82f6' : 'var(--border-color)'),
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
              }}>
                ✓
              </div>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>{currentStep === 3 ? 'Dikirim' : 'Sukses'}</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', margin: 0 }}>Pesanan selesai dan masuk ke akun</p>
              </div>
            </div>
            
            {trxData?.status === 'Gagal' && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                }}>
                  ✗
                </div>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px', color: '#ef4444' }}>Gagal</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', margin: 0 }}>Pesanan dibatalkan atau gagal</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-dark)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-gray)' }}>Invoice</span>
            <span style={{ fontWeight: 'bold' }}>{trxData ? trxData.id : '—'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-gray)' }}>Game</span>
              <span>{trxData ? trxData.game_name : '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-gray)' }}>Status</span>
              <span style={{ 
                fontWeight: 'bold',
                color: 
                  trxData?.status === 'Sukses' || trxData?.status === 'Berhasil' ? '#10b981' : 
                  trxData?.status === 'Dikirim' ? '#3b82f6' :
                  trxData?.status === 'Diproses' ? '#a855f7' :
                  trxData?.status === 'Pending' ? '#f59e0b' : 
                  trxData?.status === 'Gagal' ? '#ef4444' : 'var(--text-white)'
              }}>{trxData ? trxData.status : '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-gray)' }}>Produk</span>
              <span>{trxData ? trxData.item_name : '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-gray)' }}>Total</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                {trxData ? `Rp ${trxData.price.toLocaleString('id-ID')}` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '3rem',
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Butuh Bantuan?</h3>
        <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>Jika pesanan tidak ditemukan atau ada masalah, hubungi CS kami.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a href="#" className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', display: 'inline-block' }}>💬 Live Chat</a>
        </div>
      </div>
    </div>
  );
}
