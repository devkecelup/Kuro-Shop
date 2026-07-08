"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

export default function ReviewSection({ gameId }: { gameId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [gameId]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;

    setLoading(true);
    const { error } = await supabase.from('reviews').insert([{
      game_id: gameId,
      user_email: session.user.email,
      user_name: session.user.name || session.user.email,
      rating,
      comment
    }]);

    if (!error) {
      setComment('');
      setRating(5);
      fetchReviews();
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-white)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', marginRight: '10px', fontSize: '1rem' }}>★</span>
        Ulasan Pelanggan
      </h2>

      {session ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-white)' }}>Tulis Ulasanmu</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Bintang</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)', width: '100px' }}>
              <option value={5}>5 Bintang</option>
              <option value={4}>4 Bintang</option>
              <option value={3}>3 Bintang</option>
              <option value={2}>2 Bintang</option>
              <option value={1}>1 Bintang</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)' }}>Komentar</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bagaimana pengalaman belanjamu?"
              required
              rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Mengirim...' : 'Kirim Ulasan'}
          </button>
        </form>
      ) : (
        <div style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-gray)', marginBottom: '1rem' }}>Silakan login untuk memberikan ulasan.</p>
          <a href="/login" style={{ display: 'inline-block', backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Login Sekarang</a>
        </div>
      )}

      <div>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-gray)', textAlign: 'center' }}>Belum ada ulasan untuk game ini. Jadilah yang pertama!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-white)' }}>{rev.user_name}</span>
                  <span style={{ color: '#f59e0b' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                </div>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>{rev.comment}</p>
                <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem' }}>{new Date(rev.created_at).toLocaleDateString('id-ID')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
