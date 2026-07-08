import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#111111',
      padding: '4rem 0',
      marginTop: '4rem'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="https://i.postimg.cc/HkqPVjpH/Untitled-05-Juli-2026-pukul-22-44-39.png" 
              alt="Mascot Logo" 
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              KuroShop
            </span>
          </Link>
          <p style={{ color: '#a3a3a3', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Platform top up game terpercaya dengan proses otomatis, cepat, dan aman untuk seluruh game favoritmu.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <a href="https://wa.me/6282394305062" target="_blank" rel="noopener noreferrer">
              <img src="https://i.postimg.cc/g252RJvV/WHATSAPP-LOGO.png" width="24" height="24" alt="WA" />
            </a>
            <a href="https://t.me/KuroShopID" target="_blank" rel="noopener noreferrer">
              <img src="https://i.postimg.cc/dVXVd188/TELEGRAM-LOGO.png" width="24" height="24" alt="TG" />
            </a>
            <a href="https://discord.gg/KuroShop" target="_blank" rel="noopener noreferrer">
              <img src="https://i.postimg.cc/nh5h7zvV/DISCORD-LOGO.png" width="24" height="24" alt="DC" />
            </a>
          </div>
        </div>

        {/* Layanan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontWeight: 'bold', color: '#ffffff' }}>Layanan</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Top Up Game</Link>
            <Link href="/joki" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Joki Rank</Link>
            <Link href="/apk" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Langganan</Link>
            <Link href="/leaderboard" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Leaderboard</Link>
            <Link href="/cek-pesanan" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Cek Pesanan</Link>
          </div>
        </div>

        {/* Informasi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontWeight: 'bold', color: '#ffffff' }}>Informasi</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/tentang" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Tentang KuroShop</Link>
            <Link href="/syarat-ketentuan" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Syarat & Ketentuan</Link>
            <Link href="/kebijakan-privasi" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Kebijakan Privasi</Link>
            <Link href="/faq" style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Hubungi Kami (FAQ)</Link>
          </div>
        </div>
      </div>
      <div className="container" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #333333', textAlign: 'center', color: '#777777', fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} KuroShop. All rights reserved.
      </div>
    </footer>
  );
}
