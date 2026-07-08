"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminTransactions() {
  const [filter, setFilter] = useState('Semua');
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setTransactions(data);
    }
  };

  const filteredTransactions = filter === 'Semua' 
    ? transactions 
    : transactions.filter(t => t.status === filter);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-white)', fontWeight: 800 }}>Riwayat Transaksi</h1>
      
      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['Semua', 'Sukses', 'Diproses', 'Dikirim', 'Pending', 'Gagal'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === f ? 'none' : '1px solid var(--border-color)',
              backgroundColor: filter === f ? 'var(--primary-color)' : 'var(--bg-card)',
              color: filter === f ? '#fff' : 'var(--text-gray)',
              cursor: 'pointer',
              fontWeight: filter === f ? 'bold' : '500',
              boxShadow: filter === f ? '0 4px 6px rgba(239, 68, 68, 0.2)' : 'none'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>ID Transaksi</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Tanggal</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Pengguna</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Game & Item</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Total Harga</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((trx) => (
              <tr key={trx.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-white)', backgroundColor: 'var(--bg-card)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-gray)' }}>{trx.id}</td>
                <td style={{ padding: '1rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>{new Date(trx.created_at).toLocaleString('id-ID')}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{trx.user_email}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-white)' }}>{trx.game_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{trx.item_name}</div>
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-white)' }}>Rp {trx.price.toLocaleString('id-ID')}</td>
                <td style={{ padding: '1rem' }}>
                  <select
                    value={trx.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      // Optimistic UI update
                      setTransactions(transactions.map(t => t.id === trx.id ? { ...t, status: newStatus } : t));
                      
                      const { error } = await supabase
                        .from('transactions')
                        .update({ status: newStatus })
                        .eq('id', trx.id);
                        
                      if (error) {
                        alert('Gagal update status: ' + error.message);
                        fetchTransactions(); // revert
                      }
                    }}
                    style={{
                      padding: '8px 32px 8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${
                        trx.status === 'Sukses' ? '#10b981' : 
                        trx.status === 'Pending' ? '#f59e0b' : 
                        trx.status === 'Dikirim' ? '#3b82f6' :
                        trx.status === 'Diproses' ? '#a855f7' : '#ef4444'
                      }`,
                      backgroundColor: trx.status === 'Sukses' ? 'rgba(16, 185, 129, 0.15)' : 
                                       trx.status === 'Pending' ? 'rgba(245, 158, 11, 0.15)' : 
                                       trx.status === 'Dikirim' ? 'rgba(59, 130, 246, 0.15)' :
                                       trx.status === 'Diproses' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: trx.status === 'Sukses' ? '#10b981' : 
                             trx.status === 'Pending' ? '#f59e0b' : 
                             trx.status === 'Dikirim' ? '#3b82f6' :
                             trx.status === 'Diproses' ? '#a855f7' : '#ef4444',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      outline: 'none',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${
                        trx.status === 'Sukses' ? '%2310b981' : 
                        trx.status === 'Pending' ? '%23f59e0b' : 
                        trx.status === 'Dikirim' ? '%233b82f6' :
                        trx.status === 'Diproses' ? '%23a855f7' : '%23ef4444'
                      }' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="Pending">Pending / Nunggu</option>
                    <option value="Diproses">Diproses (VIP)</option>
                    <option value="Dikirim">Dikirim</option>
                    <option value="Sukses">Sukses</option>
                    <option value="Gagal">Gagal</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
