"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Kalkulator() {
  const [activeTab, setActiveTab] = useState<'winrate' | 'magicwheel' | 'zodiac'>('winrate');

  // Win Rate State
  const [wrTotalMatch, setWrTotalMatch] = useState('');
  const [wrCurrentRate, setWrCurrentRate] = useState('');
  const [wrTargetRate, setWrTargetRate] = useState('');
  const [wrError, setWrError] = useState('');
  const [wrResult, setWrResult] = useState<{ currentWins: number; winsNeeded: number; finalMatch: number } | null>(null);

  // Wheel State
  const [mwPoint, setMwPoint] = useState(0);
  const [zdPoint, setZdPoint] = useState(0);

  const calculateWinRate = () => {
    setWrError('');
    setWrResult(null);

    const T = parseFloat(wrTotalMatch);
    const W = parseFloat(wrCurrentRate);
    const R = parseFloat(wrTargetRate);

    if (!T || T <= 0 || isNaN(W) || isNaN(R)) {
      setWrError('Isi semua kolom dengan angka yang valid.');
      return;
    }
    if (R <= W) {
      setWrError('Target win rate harus lebih besar dari win rate sekarang.');
      return;
    }
    if (R >= 100) {
      setWrError('Target win rate harus di bawah 100%.');
      return;
    }

    const currentWins = (W / 100) * T;
    const n = (R * T / 100 - currentWins) / (1 - R / 100);
    const winsNeeded = Math.ceil(n);

    setWrResult({
      currentWins: Math.round(currentWins),
      winsNeeded,
      finalMatch: T + winsNeeded
    });
  };

  const calcDiamond = (point: number, maxPoint: number, maxDiamond: number) => {
    const remainingFraction = (maxPoint - point) / maxPoint;
    return Math.round(maxDiamond * remainingFraction).toLocaleString('id-ID');
  };

  return (
    <div className="animate-fade-in container" style={{ padding: '4rem 1rem', maxWidth: '900px' }}>
      <nav style={{ marginBottom: '2rem', color: 'var(--text-gray)' }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Kalkulator Mobile Legends</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--primary-color)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Tools Gratis
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-white)' }}>
          Kalkulator Mobile Legends
        </h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>
          Tiga kalkulator yang sering dibutuhkan pemain ML — semua gratis, tanpa perlu login.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
        <button
          className={activeTab === 'winrate' ? 'btn-primary' : ''}
          style={{
            padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid var(--border-color)',
            backgroundColor: activeTab === 'winrate' ? 'var(--primary-color)' : 'var(--bg-card)',
            color: activeTab === 'winrate' ? '#ffffff' : 'var(--text-white)'
          }}
          onClick={() => setActiveTab('winrate')}
        >
          Win Rate
        </button>
        <button
          className={activeTab === 'magicwheel' ? 'btn-primary' : ''}
          style={{
            padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid var(--border-color)',
            backgroundColor: activeTab === 'magicwheel' ? 'var(--primary-color)' : 'var(--bg-card)',
            color: activeTab === 'magicwheel' ? '#ffffff' : 'var(--text-white)'
          }}
          onClick={() => setActiveTab('magicwheel')}
        >
          Magic Wheel
        </button>
        <button
          className={activeTab === 'zodiac' ? 'btn-primary' : ''}
          style={{
            padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid var(--border-color)',
            backgroundColor: activeTab === 'zodiac' ? 'var(--primary-color)' : 'var(--bg-card)',
            color: activeTab === 'zodiac' ? '#ffffff' : 'var(--text-white)'
          }}
          onClick={() => setActiveTab('zodiac')}
        >
          Zodiac
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        {activeTab === 'winrate' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-white)' }}>Kalkulator Win Rate</h3>
            <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
              Digunakan untuk menghitung total jumlah pertandingan yang harus diambil untuk mencapai target tingkat kemenangan yang diinginkan.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-white)' }}>Total Pertandingan Kamu Saat Ini</label>
                <input type="number" placeholder="Contoh: 500" value={wrTotalMatch} onChange={(e) => setWrTotalMatch(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-white)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-white)' }}>Total Win Rate Kamu Saat Ini (%)</label>
                <input type="number" placeholder="Contoh: 52" value={wrCurrentRate} onChange={(e) => setWrCurrentRate(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-white)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-white)' }}>Win Rate Total yang Kamu Inginkan (%)</label>
                <input type="number" placeholder="Contoh: 55" value={wrTargetRate} onChange={(e) => setWrTargetRate(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-white)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button className="btn-primary" onClick={calculateWinRate} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none' }}>Hitung</button>
              <Link href="/joki" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', display: 'inline-block', textAlign: 'center' }}>Pesan Joki</Link>
            </div>

            {wrError && <p style={{ color: 'var(--primary-color)', marginTop: '1rem' }}>{wrError}</p>}

            {wrResult && (
              <div style={{ marginTop: '2rem', backgroundColor: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-gray)' }}>Total Menang Sekarang</span>
                  <strong style={{ color: 'var(--text-white)' }}>{wrResult.currentWins}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-gray)' }}>Pertandingan Tambahan Dibutuhkan</span>
                  <strong style={{ color: 'var(--primary-color)' }}>{wrResult.winsNeeded} kali menang beruntun</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.8rem' }}>
                  <span style={{ color: 'var(--text-gray)' }}>Total Pertandingan Setelahnya</span>
                  <strong style={{ color: 'var(--text-white)' }}>{wrResult.finalMatch}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'magicwheel' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-white)' }}>Kalkulator Magic Wheel</h3>
            <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
              Digunakan untuk mengetahui total estimasi diamond yang dibutuhkan untuk mendapatkan skin Legends.
            </p>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-white)' }}>Geser sesuai dengan Titik Magic Wheel Kamu</label>
            <input type="range" min="0" max="200" value={mwPoint} onChange={(e) => setMwPoint(parseInt(e.target.value))}
              style={{ width: '100%', marginBottom: '2rem', cursor: 'pointer', accentColor: 'var(--primary-color)' }} />

            <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-white)' }}>
              Poin Bintang Kamu <strong>{mwPoint}</strong>
            </div>
            <div style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-white)' }}>
              Membutuhkan Maksimal <strong style={{ color: 'var(--primary-color)' }}>{calcDiamond(mwPoint, 200, 10800)}</strong> Diamond
            </div>

            <Link href="/topup/mlbb" className="btn-primary" style={{ display: 'block', width: '100%', padding: '16px', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center', border: 'none' }}>
              Top Up Diamond Sekarang!
            </Link>
          </div>
        )}

        {activeTab === 'zodiac' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-white)' }}>Kalkulator Zodiac</h3>
            <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
              Digunakan untuk mengetahui total estimasi diamond yang dibutuhkan untuk mendapatkan skin Zodiac.
            </p>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-white)' }}>Geser sesuai dengan Titik Zodiac Kamu</label>
            <input type="range" min="0" max="100" value={zdPoint} onChange={(e) => setZdPoint(parseInt(e.target.value))}
              style={{ width: '100%', marginBottom: '2rem', cursor: 'pointer', accentColor: 'var(--primary-color)' }} />

            <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-white)' }}>
              Poin Bintang Kamu <strong>{zdPoint}</strong>
            </div>
            <div style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-white)' }}>
              Membutuhkan Maksimal <strong style={{ color: 'var(--primary-color)' }}>{calcDiamond(zdPoint, 100, 1700)}</strong> Diamond
            </div>

            <Link href="/topup/mlbb" className="btn-primary" style={{ display: 'block', width: '100%', padding: '16px', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center', border: 'none' }}>
              Top Up Diamond Sekarang!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
