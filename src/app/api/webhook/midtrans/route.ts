import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { createOrder } from '@/lib/vipayment';

const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Verifikasi Signature Key Midtrans
    const hash = crypto.createHash('sha512')
      .update(data.order_id + data.status_code + data.gross_amount + serverKey)
      .digest('hex');

    if (hash !== data.signature_key) {
      return NextResponse.json({ success: false, message: 'Invalid signature key' }, { status: 403 });
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;
    const orderId = data.order_id; // Ini adalah trxId kita (contoh: TRX-123456)

    let updateStatus = 'Pending';

    if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
            updateStatus = 'Pending'; // Butuh manual verification di Midtrans
        } else if (fraudStatus == 'accept') {
            updateStatus = 'Diproses'; // Sukses dibayar
        }
    } else if (transactionStatus == 'settlement') {
        updateStatus = 'Diproses'; // Sukses dibayar (untuk tipe payment lain spt QRIS/VA)
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        updateStatus = 'Dibatalkan';
    } else if (transactionStatus == 'pending') {
        updateStatus = 'Pending';
    }

    // 2. Update status transaksi di database
    if (updateStatus !== 'Pending') {
      await supabase.from('transactions').update({ status: updateStatus }).eq('id', orderId);
      
      // 3. Jika "Diproses" (Sudah dibayar), eksekusi API VIPayment untuk Top Up
      if (updateStatus === 'Diproses') {
        const providerCode = data.custom_field1;
        const target1 = data.custom_field2;
        const target2 = data.custom_field3 || '';

        if (providerCode && target1) {
          // MENCEGAH ORDER ASLI DI MODE DEVELOPMENT/SANDBOX
          let result = { result: true, message: 'Simulasi sukses' };
          
          if (process.env.NODE_ENV === 'production') {
             // Jika sudah live, baru panggil VIP beneran
             result = await createOrder(providerCode, target1, target2);
          } else {
             console.log("SIMULASI: Memalsukan respon sukses VIPayment agar saldo aman.");
          }
          
          if (result.result) {
            // Jika berhasil order ke VIP, update status transaksi ke "Sukses"
            await supabase.from('transactions').update({ status: 'Sukses' }).eq('id', orderId);
          } else {
            // Gagal order ke supplier
            await supabase.from('transactions').update({ status: 'Pending' }).eq('id', orderId);
            console.error("Gagal order VIPayment:", result.message);
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });

  } catch (error: unknown) {
    console.error('Midtrans Webhook Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
