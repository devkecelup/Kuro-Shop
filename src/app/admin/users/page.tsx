"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
  };

  const toggleBan = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Aktif' ? 'Banned' : 'Aktif';
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-white)', fontWeight: 800 }}>Kelola Pengguna</h1>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>ID User</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Nama</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Role</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-white)', backgroundColor: 'var(--bg-card)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{user.id}</td>
                <td style={{ padding: '1rem' }}>{user.name}</td>
                <td style={{ padding: '1rem', color: '#aaa' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                    backgroundColor: user.role === 'Admin' ? 'rgba(59, 130, 246, 0.2)' : user.role === 'Reseller' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                    color: user.role === 'Admin' ? '#3b82f6' : user.role === 'Reseller' ? '#8b5cf6' : 'var(--text-gray)'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                    backgroundColor: user.status === 'Aktif' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: user.status === 'Aktif' ? '#10b981' : '#ef4444'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {user.role !== 'Admin' && (
                    <button 
                      onClick={() => toggleBan(user.id, user.status)} 
                      style={{ 
                        backgroundColor: user.status === 'Aktif' ? '#e60000' : '#10b981', 
                        color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' 
                      }}
                    >
                      {user.status === 'Aktif' ? 'Ban User' : 'Unban User'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
