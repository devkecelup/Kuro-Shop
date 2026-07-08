import crypto from 'crypto';

const VIP_API_ID = process.env.VIP_API_ID || '';
const VIP_API_KEY = process.env.VIP_API_KEY || '';
const VIP_BASE_URL = 'https://vip-reseller.co.id/api';

// Generate MD5 signature required by VIP Reseller API
function generateSign(): string {
  return crypto.createHash('md5').update(VIP_API_ID + VIP_API_KEY).digest('hex');
}

/**
 * Fetch Profile / Saldo dari VIP Reseller
 */
export async function getProfile() {
  const formData = new URLSearchParams();
  formData.append('key', VIP_API_KEY);
  formData.append('sign', generateSign());

  try {
    const res = await fetch(`${VIP_BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    return await res.json();
  } catch (error) {
    console.error("VIP Reseller Profile Error:", error);
    return { result: false, message: 'Gagal terhubung ke server VIP Reseller' };
  }
}

/**
 * Cek ID Game (Game Feature API)
 */
export async function checkGameId(gameCode: string, target1: string, target2: string = '') {
  const formData = new URLSearchParams();
  formData.append('key', VIP_API_KEY);
  formData.append('sign', generateSign());
  formData.append('type', 'get-nickname');
  formData.append('code', gameCode); // misal: 'mobile-legends'
  formData.append('target', target1);
  if (target2) formData.append('additional_target', target2);

  try {
    const res = await fetch(`${VIP_BASE_URL}/game-feature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    return await res.json();
  } catch (error) {
    console.error("VIP Reseller Check ID Error:", error);
    return { result: false, message: 'Gagal mengecek ID' };
  }
}

/**
 * Mendapatkan daftar harga produk
 */
export async function getServices(filterType: string = 'type', filterValue: string = 'game-feature') {
    const formData = new URLSearchParams();
    formData.append('key', VIP_API_KEY);
    formData.append('sign', generateSign());
    formData.append('type', 'services');
    if (filterType && filterValue) {
      formData.append('filter_type', filterType);
      formData.append('filter_value', filterValue);
    }
  
    try {
      const res = await fetch(`${VIP_BASE_URL}/game-feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      
      return await res.json();
    } catch (error) {
      console.error("VIP Reseller Get Services Error:", error);
      return { result: false, message: 'Gagal mengambil layanan' };
    }
}

/**
 * Cek Status Transaksi
 */
export async function checkStatus(trxId: string) {
  const formData = new URLSearchParams();
  formData.append('key', VIP_API_KEY);
  formData.append('sign', generateSign());
  formData.append('type', 'status');
  formData.append('trxid', trxId);

  try {
    const res = await fetch(`${VIP_BASE_URL}/game-feature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    return await res.json();
  } catch (error) {
    console.error("VIP Reseller Check Status Error:", error);
    return { result: false, message: 'Gagal mengecek status' };
  }
}

/**
 * Buat Pesanan Top Up
 */
export async function createOrder(serviceCode: string, target1: string, target2: string = '') {
  const formData = new URLSearchParams();
  formData.append('key', VIP_API_KEY);
  formData.append('sign', generateSign());
  formData.append('type', 'order');
  formData.append('service', serviceCode);
  formData.append('data_no', target1);
  if (target2) formData.append('data_zone', target2);

  try {
    const res = await fetch(`${VIP_BASE_URL}/game-feature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    return await res.json();
  } catch (error) {
    console.error("VIP Reseller Create Order Error:", error);
    return { result: false, message: 'Gagal membuat pesanan' };
  }
}


