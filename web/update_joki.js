const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

async function main() {
  const res = await fetch(`${url}/rest/v1/services?href=eq.%2Fjoki%2Fperbintang`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      title: 'Joki Mobile Legends',
      href: '/joki',
      description: 'Pilih jenis joki yang paling sesuai kebutuhanmu. Semua dikerjakan penjoki tersertifikasi dengan akun tetap aman.'
    })
  });
  
  if (!res.ok) {
    console.error('Error updating:', await res.text());
  } else {
    console.log('Updated successfully');
  }
}
main();
