import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import FlashSaleTimer from '@/components/FlashSaleTimer';

export const revalidate = 0; // Disable cache so flash sales update immediately

export default async function Home() {
  const { data: games } = await supabase.from('games').select('*').order('name', { ascending: true });
  // Get items that are currently flash sale
  const { data: rawFlashSales } = await supabase
    .from('game_items')
    .select('*, games(name, image_url, slug)')
    .eq('is_flash_sale', true);
    
  const now = new Date();
  const flashSales = (rawFlashSales || []).filter(item => {
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
    
    if (endDate && endDate < now) return false;
    if (stock !== null && stock <= 0) return false;
    return true;
  }).slice(0, 10);
  const { data: latestReviews } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(6);
  const { data: services } = await supabase.from('services').select('*').eq('is_active', true).order('created_at', { ascending: true });

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section" style={{
        paddingTop: '9rem',
        paddingBottom: '6rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'url("https://i.postimg.cc/QdJc8Drd/mlbb-hirara-glided-embers-skin-hd-wallpaper-by-rakibhasansuhan-dmbchzt-pre.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 15%',
      }}>
        {/* Red overlay for readability */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, rgba(138, 0, 0, 0.9) 0%, rgba(230, 0, 0, 0.4) 100%)'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px', maxWidth: '600px' }}>
            <h1 className="hero-title">
              Top Up Games <br/>
              And Let&apos;s Start <br/>
              <span style={{ color: '#fbbf24' }}>A Games Together</span>
            </h1>
            <p className="hero-subtitle">
              A place to top up games fast, safe, reliable, legal.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="#games" style={{
                backgroundColor: 'var(--primary-color)',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(230, 0, 0, 0.3)'
              }}>
                Browse Games
              </Link>
            </div>
          </div>
        </div>
        
        {/* Gradient fade to blend with white background below */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px',
          background: 'linear-gradient(to top, var(--bg-dark), transparent)',
          zIndex: 2
        }} />
      </section>

      {/* Flash Sale Section */}
      {flashSales && flashSales.length > 0 && (
      <section style={{ padding: '3rem 0 1rem 0', backgroundColor: 'var(--bg-dark)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', borderLeft: '4px solid #ef4444', paddingLeft: '1rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ef4444', animation: 'pulse 1s infinite', display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
                  <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                </svg>
              </span>
              Flash Sale
            </h2>
            <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
              Waktu Terbatas!
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }} className="hide-scrollbar">
            {flashSales.map((item: any, idx) => (
              <Link href={`/topup/${item.games.slug}`} key={idx} style={{ 
                minWidth: '220px', 
                backgroundColor: 'var(--card-bg)', 
                borderRadius: '12px', 
                border: '1px solid #ef4444',
                padding: '1rem',
                position: 'relative', 
                flexShrink: 0, 
                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.1)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.games.image_url} alt={item.games.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ color: 'var(--text-white)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>{item.games.name}</h3>
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem', margin: 0 }}>{item.name}</p>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                  <div style={{ textDecoration: 'line-through', color: 'var(--text-gray)', fontSize: '0.8rem' }}>
                    Rp {item.price.toLocaleString('id-ID')}
                  </div>
                  <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Rp {item.discount_price.toLocaleString('id-ID')}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', color: 'white', padding: '4px 10px', borderTopRightRadius: '11px', borderBottomLeftRadius: '11px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ animation: 'pulse 1s infinite', display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '14px', height: '14px' }}>
                      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <FlashSaleTimer endDate={item.icon_url} />
                </div>
                {(() => {
                  let stock = null;
                  try {
                    if (item.icon_url && item.icon_url.startsWith('{')) {
                      const p = JSON.parse(item.icon_url);
                      if (p.stock !== undefined && p.stock !== '' && p.stock > 0) stock = p.stock;
                    }
                  } catch(e) {}
                  if (stock !== null) {
                    return (
                      <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fbbf24', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
                        Sisa {stock}
                      </div>
                    );
                  }
                  return null;
                })()}
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Game Grid Section */}
      <section id="games" style={{ padding: '4rem 0', backgroundColor: 'transparent' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem' }}>Top Up All Games</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: '2rem', paddingLeft: '1.2rem' }}>Choose the game you want to top up</p>
          
          <div className="game-grid">
            {games && games.map((game, index) => {
              
              return (
              <Link href={`/topup/${game.slug}`} key={game.id} className="game-card">
                <div className="img-container">
                  <img src={game.image_url || "https://i.pinimg.com/originals/a0/0a/63/a00a63ba39d10b777a4a90b4d0cd5c2d.webp"} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--text-white)', margin: 0, fontWeight: 600 }}>{game.name}</h3>
                </div>
                
              </Link>
              )
            })}
          </div>
        </div>
      </section>

      
      {/* Features Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'transparent' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem' }}>Fitur Spesial</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: '2rem', paddingLeft: '1.2rem' }}>Nikmati fitur eksklusif gratis dari KuroShop untuk memaksimalkan pengalaman gaming-mu</p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {services && services.length > 0 ? services.map((item, i) => (
              <Link href={item.href || '#'} key={i} className="game-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <img src={item.title.toLowerCase().includes('kalkulator') ? 'https://i.postimg.cc/BbrCRCfy/aamon-noble-crest-ml-mobile-legends-by-monxiomon-dg259v6-pre.webp' : (item.img_url || 'https://via.placeholder.com/400x200?text=Service')} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover', objectPosition: 'top' }} />
                  {item.badge && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: item.badge === 'Populer' ? 'var(--primary-color)' : item.badge === 'Fitur Baru' ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.badge}</span>
                  )}
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-white)' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>{item.description}</p>
                  <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px', textAlign: 'center', borderRadius: '8px', fontWeight: 'bold' }}>
                    Pilih Layanan
                  </div>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-gray)', padding: '2rem' }}>Belum ada layanan tersedia.</div>
            )}
          </div>
        </div>
      </section>

      
      {/* Testimonials */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-dark)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Apa Kata <span style={{ color: 'var(--primary-color)' }}>Mereka?</span></h2>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {latestReviews && latestReviews.length > 0 ? latestReviews.map((review, idx) => {
              const diffTime = Math.abs(new Date().getTime() - new Date(review.created_at).getTime());
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
              let timeText = 'Baru saja';
              if (diffDays > 0) timeText = `${diffDays} hari yang lalu`;
              else if (diffHours > 0) timeText = `${diffHours} jam yang lalu`;

              return (
              <div key={idx} style={{
                backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)', position: 'relative',
                minWidth: '300px', flexShrink: 0
              }}>
                <div style={{ position: 'absolute', top: '-15px', right: '20px', backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px', borderRadius: '50%' }}>
                   &#10077;
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ color: '#fbbf24', fontSize: '1.2rem' }}>
                    {"★".repeat(review.rating)}
                  </div>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>{timeText}</span>
                </div>
                <p style={{ color: 'var(--text-gray)', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  &quot;{review.comment || 'Puas sekali belanja di sini!'}&quot;
                </p>
                <div style={{ fontWeight: 'bold', color: 'var(--text-white)' }}>
                  - {review.user_name}
                </div>
              </div>
            )}) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-gray)', padding: '2rem' }}>
                Belum ada ulasan dari pelanggan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cara Top Up Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-dark)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-white)' }}>Cara Top Up di KuroShop</h2>
            <p style={{ color: 'var(--text-gray)', maxWidth: '600px', margin: '0 auto' }}>Hanya butuh beberapa detik untuk top up game favoritmu. Praktis, cepat, dan otomatis masuk ke akunmu!</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            {[
              { step: '1', title: 'Pilih Game', desc: 'Pilih game favorit yang ingin kamu top up dari daftar kami.' },
              { step: '2', title: 'Masukkan Data', desc: 'Isi User ID dan data akun game kamu dengan benar.' },
              { step: '3', title: 'Pilih Nominal', desc: 'Pilih jumlah diamond atau item yang kamu butuhkan.' },
              { step: '4', title: 'Pembayaran', desc: 'Selesaikan transaksi dan item otomatis masuk ke akunmu.' }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', boxShadow: '0 4px 10px rgba(230,0,0,0.3)' }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-white)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
