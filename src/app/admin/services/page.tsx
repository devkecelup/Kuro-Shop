"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [href, setHref] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (data) setServices(data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return;
    
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setServices(services.filter(s => s.id !== id));
    } else {
      alert('Gagal menghapus layanan: ' + error.message);
    }
  };

  const handleEdit = (service: any) => {
    setCurrentService(service);
    setTitle(service.title);
    setDescription(service.description || '');
    setHref(service.href);
    setImgUrl(service.img_url || '');
    setBadge(service.badge || '');
    setIsActive(service.is_active);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentService(null);
    setTitle('');
    setDescription('');
    setHref('/joki/');
    setImgUrl('');
    setBadge('Baru');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title || !href) {
      alert('Judul dan URL harus diisi');
      return;
    }

    const payload = {
      title,
      description,
      href,
      img_url: imgUrl,
      badge,
      is_active: isActive
    };

    if (currentService) {
      // Update
      const { error } = await supabase.from('services').update(payload).eq('id', currentService.id);
      if (error) alert('Gagal update: ' + error.message);
      else fetchServices();
    } else {
      // Insert
      const { error } = await supabase.from('services').insert(payload);
      if (error) alert('Gagal menambah: ' + error.message);
      else fetchServices();
    }
    
    setIsModalOpen(false);
  };

  const toggleActive = async (service: any) => {
    const { error } = await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id);
    if (!error) fetchServices();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manajemen Layanan Khusus (Joki/Fitur)</h2>
        <button 
          onClick={handleAdd}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Tambah Layanan
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p>Memuat layanan...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Gambar</th>
                <th style={{ padding: '1rem' }}>Layanan</th>
                <th style={{ padding: '1rem' }}>URL</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <img src={service.img_url || 'https://via.placeholder.com/80x40'} alt={service.title} style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    {service.title}
                    {service.badge && <span style={{ marginLeft: '10px', fontSize: '0.7rem', padding: '2px 6px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '10px' }}>{service.badge}</span>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-gray)' }}>{service.href}</td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => toggleActive(service)}
                      style={{ padding: '4px 8px', backgroundColor: service.is_active ? '#10b981' : 'var(--text-gray)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      {service.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(service)} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(service.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>Belum ada layanan joki/fitur</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{currentService ? 'Edit Layanan' : 'Tambah Layanan'}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Judul Layanan (Misal: Joki Mythic)</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Deskripsi Layanan</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>

            <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>URL Tujuan (Misal: /joki/mythic)</label>
                <input type="text" value={href} onChange={e => setHref(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Label / Badge (Opsional)</label>
                <input type="text" value={badge} onChange={e => setBadge(e.target.value)} placeholder="Misal: Populer, Baru" style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>URL Gambar Sampul (Banner)</label>
              <input type="text" value={imgUrl} onChange={e => setImgUrl(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
              {imgUrl && <img src={imgUrl} alt="Preview" style={{ marginTop: '10px', width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--text-gray)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
