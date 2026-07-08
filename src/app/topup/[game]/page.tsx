"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FlashSaleTimer from '@/components/FlashSaleTimer';
// Import GAMES only for the fallback fields definition since DB doesn't have it yet
import { GAMES } from '@/lib/gamesData';
import ReviewSection from '@/components/ReviewSection';
import Script from 'next/script';

export default function GameTopup({ params }: { params: Promise<{ game: string }> }) {
  const unwrappedParams = use(params);
  const gameKey = unwrappedParams.game;
  
  const [game, setGame] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for MLBB Nickname Checker
  const [nickname, setNickname] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState(false);

  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [selectedNominal, setSelectedNominal] = useState<any | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('QRIS');
  const [qty, setQty] = useState(1);
  const [timeLeft, setTimeLeft] = useState('');

  // States for Checkout & Review
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: gameData } = await supabase.from('games').select('*').eq('slug', gameKey).single();
      if (gameData) {
        setGame(gameData);
        const { data: itemData } = await supabase.from('game_items').select('*').eq('game_id', gameData.id).lte('price', 500000);
        if (itemData) {
          const now = new Date();
          const processedItems = itemData.map(item => {
            if (!item.is_flash_sale) return item;
            let endDate = null;
            let stock = null;
            try {
              if (item.icon_url && item.icon_url.startsWith('{')) {
                const parsed = JSON.parse(item.icon_url);
                if (parsed.endDate) endDate = new Date(parsed.endDate);
                if (parsed.stock !== undefined && parsed.stock !== '') stock = parseInt(parsed.stock);
              } else if (item.icon_url) {
                endDate = new Date(item.icon_url);
              }
            } catch(e) {}
            
            if (endDate && endDate < now) return { ...item, is_flash_sale: false };
            if (stock !== null && stock <= 0) return { ...item, is_flash_sale: false };
            return item;
          });
          setItems(processedItems);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [gameKey]);

  const handleCheckId = async () => {
    if (!formFields.userid || !formFields.zoneid) {
      alert('Harap isi User ID dan Zone ID terlebih dahulu');
      return;
    }
    
    setCheckingId(true);
    setNickname(null);
    try {
      const res = await fetch('/api/check-id/mlbb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: formFields.userid, zoneid: formFields.zoneid })
      });
      const data = await res.json();
      if (data.success) {
        setNickname(data.username);
      } else {
        alert(data.message || 'ID tidak ditemukan');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat mengecek ID');
    }
    setCheckingId(false);
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    
    try {
      const payload = {
        gameName: game.name,
        itemName: selectedNominal.name,
        providerCode: selectedNominal.provider_code,
        price: (selectedNominal.is_flash_sale && selectedNominal.discount_price ? selectedNominal.discount_price : subtotal) * qty + adminFee,
        qty: qty,
        customerDetails: { email: 'user@example.com' }, // Ganti dengan session email
        formFields: formFields
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        // Trigger Midtrans Snap
        (window as any).snap.pay(data.token, {
          onSuccess: function(result: any){
            console.log('success', result);
            setShowReviewModal(true);
          },
          onPending: function(result: any){
            console.log('pending', result);
            alert('Pesanan Pending. Menunggu pembayaran Anda!');
          },
          onError: function(result: any){
            console.log('error', result);
            alert('Pembayaran gagal!');
          },
          onClose: function(){
            console.log('customer closed the popup without finishing the payment');
          }
        });
      } else {
        alert(data.message || 'Gagal memproses checkout');
      }
    } catch(e) {
      console.error(e);
      alert('Terjadi kesalahan saat checkout.');
    }

    setIsCheckoutLoading(false);
  };

  const submitReview = async () => {
    try {
      const { error } = await supabase.from('reviews').insert({
        game_id: game.id,
        user_name: 'Pengguna', // Bisa diganti session name
        rating: reviewRating,
        comment: reviewComment
      });
      if (error) console.error("Gagal submit review:", error);
    } catch(e) {
      console.error(e);
    }
    setIsReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewModal(false);
    }, 2000);
  };

  if (!loading && !game) {
    notFound();
  }

  let derivedGameKey = 'default';
  if (game && game.name) {
    const nameLower = game.name.toLowerCase();
    if (nameLower.includes('mobile legends')) derivedGameKey = 'mlbb';
    else if (nameLower.includes('free fire')) derivedGameKey = 'freefire';
    else if (nameLower.includes('pubg')) derivedGameKey = 'pubg';
    else if (nameLower.includes('valorant')) derivedGameKey = 'valorant';
    else if (nameLower.includes('genshin')) derivedGameKey = 'genshin';
    else if (nameLower.includes('roblox')) derivedGameKey = 'roblox';
  }

  const staticGameData = (GAMES as any)[derivedGameKey] || { fields: [{id:"userid", label:"User ID", placeholder: "Masukkan User ID", type:"text", width:"full"}], hint: "" };
  const categories = Array.from(new Set(items.map(i => i.category)));

  const subtotal = selectedNominal ? (selectedNominal.is_flash_sale && selectedNominal.discount_price ? selectedNominal.discount_price : selectedNominal.price) : 0;
  
  const getAdminFee = (method: string) => {
    if (!subtotal) return 0;
    const base = subtotal * qty;
    switch(method) {
      case 'QRIS': return Math.ceil(base * 0.007);
      case 'GoPay': return Math.ceil(base * 0.02);
      case 'DANA': return Math.ceil(base * 0.015);
      case 'OVO': return Math.ceil(base * 0.015);
      case 'Virtual Account': return 4000;
      default: return 0;
    }
  };

  const adminFee = selectedPayment ? getAdminFee(selectedPayment) : 0;
  const total = (subtotal * qty) + adminFee;

  const isFormComplete = staticGameData.fields.every((f: any) => formFields[f.id] && formFields[f.id].trim() !== '');

  if (loading) return <div style={{ color: 'white', padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />
      <div className="animate-fade-in container" style={{ padding: '4rem 1rem' }}>
      <nav style={{ marginBottom: '2rem', color: 'var(--text-gray)' }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <Link href="/" style={{ color: 'inherit' }}>Top Up Game</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{game.name}</span>
      </nav>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left Form */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', backgroundColor: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={game.image_url || "https://i.pinimg.com/originals/a0/0a/63/a00a63ba39d10b777a4a90b4d0cd5c2d.webp"} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-white)' }}>{game.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                <span style={{ color: '#f59e0b' }}>★ 4.9</span>
                <span>·</span>
                <span>{'10rb+ terjual'}</span>
                <span>·</span>
                <span style={{ color: '#10b981' }}>Proses Otomatis</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-white)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', marginRight: '10px', fontSize: '1rem' }}>1</span>
              Masukkan Data Akun
            </h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {staticGameData.fields.map((field: any) => (
                <input 
                  key={field.id}
                  type={field.type} 
                  placeholder={field.placeholder} 
                  value={formFields[field.id] || ''} 
                  onChange={(e) => setFormFields({...formFields, [field.id]: e.target.value})}
                  style={{ flex: field.width === 'half' ? '1 1 45%' : '1 1 100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-white)' }} 
                />
              ))}
            </div>
            
            {/* Nickname display for MLBB */}
            {derivedGameKey === 'mlbb' && (
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleCheckId} 
                  disabled={checkingId}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', flex: '0 0 auto' }}
                >
                  {checkingId ? 'Mengecek...' : 'Cek ID'}
                </button>
                
                {nickname && (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto' }}>
                    <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Nickname:</span>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{nickname}</span>
                  </div>
                )}
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.5rem' }}>{staticGameData.hint}</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-white)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', marginRight: '10px', fontSize: '1rem' }}>2</span>
              Pilih Nominal
            </h2>
            
            {categories.map((cat: any, i: number) => {
              const catItems = items.filter(item => item.category === cat).sort((a, b) => {
                if (a.is_flash_sale && !b.is_flash_sale) return -1;
                if (!a.is_flash_sale && b.is_flash_sale) return 1;
                return a.price - b.price;
              });
              return (
              <div key={i} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-white)' }}>{cat}</h3>
                <div className="product-grid">
                  {catItems.map((nom: any, idx: number) => {
                    const label = nom.name;
                    const isSelected = selectedNominal === nom;
                    return (
                      <div key={idx} onClick={() => setSelectedNominal(nom)} style={{
                        padding: '1rem', borderRadius: '12px', border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                        backgroundColor: 'var(--bg-dark)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative'
                      }}>
                        {nom.is_flash_sale && (
                          <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', color: 'white', padding: '4px 10px', borderTopRightRadius: '11px', borderBottomLeftRadius: '11px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            <span style={{ animation: 'pulse 1s infinite', display: 'flex', alignItems: 'center' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '14px', height: '14px' }}>
                                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                              </svg>
                            </span> 
                            Flash Sale <FlashSaleTimer endDate={nom.icon_url} />
                          </div>
                        )}
                        {nom.is_flash_sale && (() => {
                          let stock = null;
                          try {
                            if (nom.icon_url && nom.icon_url.startsWith('{')) {
                              const p = JSON.parse(nom.icon_url);
                              if (p.stock !== undefined && p.stock !== '' && p.stock > 0) stock = p.stock;
                            }
                          } catch(e) {}
                          if (stock !== null) {
                            return (
                              <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fbbf24', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', zIndex: 2 }}>
                                Sisa {stock}
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div style={{ fontWeight: 'bold', color: 'var(--text-white)', fontSize: '0.95rem' }}>{label}</div>
                        <div style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>Rp {(nom.is_flash_sale && nom.discount_price ? nom.discount_price : nom.price).toLocaleString('id-ID')}</div>
                        {(nom.is_flash_sale && nom.discount_price) && <div style={{ color: 'var(--text-gray)', fontSize: '0.75rem', textDecoration: 'line-through' }}>Rp {nom.price.toLocaleString('id-ID')}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )})}
            
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-white)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', marginRight: '10px', fontSize: '1rem' }}>3</span>
              Pilih Metode Pembayaran
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {['QRIS', 'DANA', 'GoPay', 'OVO', 'Virtual Account'].map(method => {
                const feeAmount = getAdminFee(method);
                return (
                  <div key={method} onClick={() => setSelectedPayment(method)} style={{
                    padding: '1rem 1.5rem', borderRadius: '12px', border: `2px solid ${selectedPayment === method ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    backgroundColor: 'var(--bg-dark)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-white)' }}>{method}</div>
                    <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                      {feeAmount > 0 ? `+ Rp ${feeAmount.toLocaleString('id-ID')}` : 'Gratis'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Summary */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-white)' }}>Ringkasan Pesanan</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>Game</span>
                <span style={{ color: 'var(--text-white)' }}>{game.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>Akun</span>
                <span style={{ color: isFormComplete ? 'var(--text-white)' : 'var(--text-gray)' }}>
                  {isFormComplete ? Object.values(formFields).join(' ') : 'Belum diisi'}
                </span>
              </div>
              {derivedGameKey === 'mlbb' && nickname && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-gray)' }}>Nickname</span>
                  <span style={{ color: 'var(--text-white)' }}>{nickname}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>Produk</span>
                <span style={{ color: selectedNominal ? 'var(--text-white)' : 'var(--text-gray)' }}>
                  {selectedNominal ? selectedNominal.name : 'Belum dipilih'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>Metode Bayar</span>
                <span style={{ color: 'var(--text-white)' }}>{selectedPayment}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '1rem 0' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>Harga Produk</span>
                <span style={{ color: 'var(--text-white)' }}>Rp {(selectedNominal && selectedNominal.is_flash_sale && selectedNominal.discount_price ? selectedNominal.discount_price : subtotal).toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>Biaya Admin</span>
                <span style={{ color: 'var(--text-white)' }}>Rp {adminFee.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '1rem 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-white)' }}>Total Bayar</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary-color)' }}>
                Rp {selectedNominal ? (((selectedNominal.is_flash_sale && selectedNominal.discount_price ? selectedNominal.discount_price : subtotal) * qty) + adminFee).toLocaleString('id-ID') : '0'}
              </span>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleCheckout}
              disabled={!selectedNominal || !isFormComplete || isCheckoutLoading} 
              style={{
                width: '100%', padding: '16px', borderRadius: '8px', fontWeight: 'bold', border: 'none',
                opacity: (!selectedNominal || !isFormComplete || isCheckoutLoading) ? 0.5 : 1, 
                cursor: (!selectedNominal || !isFormComplete || isCheckoutLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              {isCheckoutLoading ? 'Memproses Transaksi...' : 'Beli Sekarang'}
            </button>
            {derivedGameKey === 'roblox' && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>
                  ⚠️ Perhatian: Pesanan via Username akan diproses dalam waktu estimasi 1 jam. Mohon pastikan Username akun Anda sudah sesuai.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Review Section (Removed as per request) */}

      {/* Review Modal Pop-up */}
      {showReviewModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="animate-fade-in" style={{
            backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)',
            width: '90%', maxWidth: '500px', textAlign: 'center'
          }}>
            {!isReviewSubmitted ? (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-white)', marginBottom: '0.5rem' }}>Transaksi Berhasil!</h3>
                <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Bagaimana pengalaman top up Anda hari ini?</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      onClick={() => setReviewRating(star)}
                      style={{ cursor: 'pointer', fontSize: '2.5rem', color: star <= reviewRating ? '#fbbf24' : '#4b5563', transition: 'color 0.2s' }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <textarea
                  placeholder="Tulis ulasan Anda (Opsional)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-dark)', color: 'var(--text-white)', marginBottom: '1.5rem', minHeight: '100px', resize: 'vertical'
                  }}
                />

                <button 
                  onClick={submitReview}
                  style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  Kirim Ulasan
                </button>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-gray)', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}
                >
                  Nanti Saja
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-white)', marginBottom: '1rem' }}>Terima Kasih!</h3>
                <p style={{ color: 'var(--text-gray)' }}>Ulasan Anda sangat berarti bagi kami.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
