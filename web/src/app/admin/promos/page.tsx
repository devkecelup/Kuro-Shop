"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPromos() {
  const [promos, setPromos] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<any>(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    const { data, error } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setPromos(data);
    }
  };

  const handleEdit = (promo: any) => {
    setCurrentPromo(promo);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('promos').delete().eq('id', id);
    if (!error) {
      setPromos(promos.filter(p => p.id !== id));
    } else {
      console.error(error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPromo.id) {
      // Update
      const { data, error } = await supabase
        .from('promos')
        .update({
          title: currentPromo.title,
          image_url: currentPromo.image_url,
          target_url: currentPromo.target_url,
          is_active: currentPromo.is_active
        })
        .eq('id', currentPromo.id)
        .select();
        
      if (!error && data) {
        setPromos(promos.map(p => p.id === currentPromo.id ? data[0] : p));
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('promos')
        .insert([{
          title: currentPromo.title,
          image_url: currentPromo.image_url,
          target_url: currentPromo.target_url || '#',
          is_active: currentPromo.is_active
        }])
        .select();
        
      if (!error && data) {
        setPromos([data[0], ...promos]);
      }
    }
    setIsEditing(false);
    setCurrentPromo(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#fff' }}>Kelola Promo & Flash Sale</h1>
        <button 
          onClick={() => { setCurrentPromo({ title: '', image_url: '', target_url: '', is_active: true }); setIsEditing(true); }}
          style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Tambah Promo Baru
        </button>
      </div>

      {isEditing && currentPromo && (
        <div style={{ backgroundColor: '#1e1e1e', padding: '2rem', borderRadius: '12px', border: '1px solid #333', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#fff' }}>{currentPromo.id ? 'Edit Promo' : 'Tambah Promo'}</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Judul Promo</label>
              <input 
                type="text" 
                value={currentPromo.title} 
                onChange={(e) => setCurrentPromo({...currentPromo, title: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#121212', color: '#fff' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Link Gambar (URL)</label>
              <input 
                type="url" 
                value={currentPromo.image_url} 
                onChange={(e) => setCurrentPromo({...currentPromo, image_url: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#121212', color: '#fff' }}
                required
                placeholder="https://i.postimg.cc/..."
              />
              {currentPromo.image_url && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>Preview Gambar:</p>
                  <img src={currentPromo.image_url} alt="Preview" style={{ height: '100px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={currentPromo.is_active}
                  onChange={(e) => setCurrentPromo({...currentPromo, is_active: e.target.checked})}
                />
                Promo Aktif (Tampilkan di halaman depan)
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Simpan</button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ backgroundColor: '#333', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {promos.map((promo) => (
          <div key={promo.id} style={{ backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
            <img src={promo.image_url} alt={promo.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{promo.title}</h3>
              <span style={{ 
                display: 'inline-block', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '0.8rem',
                backgroundColor: promo.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(230, 0, 0, 0.2)',
                color: promo.is_active ? '#10b981' : '#e60000',
                marginBottom: '1rem'
              }}>
                {promo.is_active ? 'Aktif' : 'Tidak Aktif'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(promo)} style={{ flex: 1, backgroundColor: '#3b82f6', color: '#fff', padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(promo.id)} style={{ flex: 1, backgroundColor: '#e60000', color: '#fff', padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
