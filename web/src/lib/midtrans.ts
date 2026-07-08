// @ts-ignore
import midtransClient from 'midtrans-client';

const isProduction = process.env.NODE_ENV === 'production';
const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || '';

export const snap = new midtransClient.Snap({
  isProduction: false, // Ubah ke true jika sudah live
  serverKey: serverKey,
  clientKey: clientKey
});

export const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: serverKey,
  clientKey: clientKey
});
