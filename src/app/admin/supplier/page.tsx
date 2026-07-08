import { getProfile } from '@/lib/vipayment';
import SyncButton from './SyncButton';

export default async function SupplierDashboard() {
  // Fetch VIP Reseller Profile
  const profile = await getProfile();
  const isOnline = profile.result === true;
  const balance = profile.data?.balance || 0;
  
  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-white)' }}>
            VIP Reseller (Supplier)
          </h1>
          <p style={{ color: 'var(--text-gray)', fontWeight: 500 }}>Kelola saldo dan koneksi API ke VIP Reseller</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* API Status Card */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--text-gray)', fontSize: '1.1rem', fontWeight: 600 }}>Status API</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isOnline ? '#10b981' : '#ef4444' }}></div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isOnline ? '#10b981' : '#ef4444' }}>
              {isOnline ? 'Terhubung (Online)' : 'Offline / Error'}
            </span>
          </div>
          {!isOnline && (
            <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Pesan Error: {profile.message || 'Gagal terhubung. Pastikan API ID dan API KEY di .env.local sudah benar.'}
            </p>
          )}
        </div>

        {/* Balance Card */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--text-gray)', fontSize: '1.1rem', fontWeight: 600 }}>Saldo Tersedia</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            Rp {balance.toLocaleString('id-ID')}
          </p>
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <a 
              href="https://vip-reseller.co.id/deposit" 
              target="_blank" 
              rel="noreferrer"
              style={{ display: 'inline-block', backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center', width: '100%' }}
            >
              Isi Saldo
            </a>
          </div>
        </div>

      </div>

      <SyncButton />

      <div style={{ marginTop: '3rem', backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-white)', fontWeight: 700 }}>Panduan Supplier</h2>
        <ul style={{ color: 'var(--text-gray)', display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '20px' }}>
          <li>Pastikan saldo selalu cukup sebelum menerima orderan dari pembeli.</li>
          <li>Setiap ada pesanan masuk dari website, sistem akan otomatis memotong saldo ini untuk memproses pesanan di VIP Reseller.</li>
          <li>Untuk mengubah margin keuntungan (otak-atik harga), masuk ke menu <b>Produk</b> dan sesuaikan Harga Jual vs Harga Provider.</li>
        </ul>
      </div>

    </div>
  );
}
