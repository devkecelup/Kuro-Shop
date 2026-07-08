import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--primary-color)', margin: 0, lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-white)' }}>Oops! Halaman Tidak Ditemukan</h2>
      <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px' }}>
        Sepertinya Anda tersesat di dimensi lain. Halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada.
      </p>
      <Link href="/" style={{
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff',
        padding: '12px 30px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        textDecoration: 'none',
        boxShadow: '0 4px 15px rgba(230, 0, 0, 0.3)'
      }}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
