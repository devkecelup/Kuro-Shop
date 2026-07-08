"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<any>(null);
  
  // Form states
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [gameId, setGameId] = useState('');
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    fetchReviews();
    fetchGames();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, games(name)')
      .order('created_at', { ascending: false });
      
    if (data) setReviews(data);
    setLoading(false);
  }

  async function fetchGames() {
    const { data } = await supabase.from('games').select('id, name').order('name');
    if (data) {
      setGames(data);
      if (data.length > 0) setGameId(data[0].id);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) return;
    
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      setReviews(reviews.filter(r => r.id !== id));
    } else {
      alert('Gagal menghapus ulasan: ' + error.message);
    }
  };

  const handleEdit = (review: any) => {
    setCurrentReview(review);
    setUserName(review.user_name);
    setRating(review.rating);
    setComment(review.comment || '');
    setGameId(review.game_id || (games[0]?.id || ''));
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentReview(null);
    setUserName('');
    setRating(5);
    setComment('');
    if (games.length > 0) setGameId(games[0].id);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!userName || !comment) {
      alert('Nama dan komentar harus diisi');
      return;
    }

    const payload = {
      user_name: userName,
      rating,
      comment,
      game_id: gameId || null
    };

    if (currentReview) {
      // Update
      const { error } = await supabase.from('reviews').update(payload).eq('id', currentReview.id);
      if (error) alert('Gagal update: ' + error.message);
      else fetchReviews();
    } else {
      // Insert
      const { error } = await supabase.from('reviews').insert(payload);
      if (error) alert('Gagal menambah: ' + error.message);
      else fetchReviews();
    }
    
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manajemen Ulasan</h2>
        <button 
          onClick={handleAdd}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Tambah Ulasan
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p>Memuat ulasan...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>User</th>
                <th style={{ padding: '1rem' }}>Game</th>
                <th style={{ padding: '1rem' }}>Rating</th>
                <th style={{ padding: '1rem' }}>Komentar</th>
                <th style={{ padding: '1rem' }}>Tanggal</th>
                <th style={{ padding: '1rem' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{review.user_name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-gray)' }}>{review.games ? review.games.name : '-'}</td>
                  <td style={{ padding: '1rem', color: '#fbbf24' }}>{"★".repeat(review.rating)}</td>
                  <td style={{ padding: '1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.comment}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(review.created_at).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(review)} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(review.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>Belum ada ulasan</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{currentReview ? 'Edit Ulasan' : 'Tambah Ulasan'}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Nama Pengguna</label>
              <input type="text" value={userName} onChange={e => setUserName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Game</label>
              <select value={gameId} onChange={e => setGameId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }}>
                <option value="">(Umum / Tidak spesifik)</option>
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Rating (1-5)</label>
              <input type="number" min="1" max="5" value={rating} onChange={e => setRating(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Komentar</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
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
