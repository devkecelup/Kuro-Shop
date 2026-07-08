import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      gameName, 
      itemName, 
      providerCode,
      price, 
      qty,
      customerDetails, 
      formFields 
    } = body;
    
    // Ambil target1 dan target2 (jika ada) dari formFields
    const targets = Object.values(formFields);
    const target1 = targets[0] as string || '';
    const target2 = targets.length > 1 ? (targets[1] as string || '') : '';

    // 1. Generate Transaction ID
    const trxId = 'TRX-' + Math.floor(100000 + Math.random() * 900000);

    // 2. Save Pending Transaction to Supabase
    // Menyimpan detail formFields ke note atau field lain jika ada (misal kolom target_id di tabel)
    // Di sini asumsinya kita simpan formFields sebagai JSON string ke dalam kolom (jika ada kolom target_id/note)
    // Atau bisa dimasukkan ke item_name sementara.
    const { error } = await supabase.from('transactions').insert({
      id: trxId,
      user_email: customerDetails?.email || 'guest@example.com',
      game_name: gameName,
      item_name: `${itemName} (Qty: ${qty}) - Target: ${Object.values(formFields).join(' ')}`,
      price: price,
      status: 'Pending'
    });

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ success: false, message: 'Gagal menyimpan transaksi' }, { status: 500 });
    }

    // 3. Create Snap Transaction in Midtrans
    const parameter = {
      transaction_details: {
        order_id: trxId,
        gross_amount: price
      },
      item_details: [{
        id: itemName,
        price: Math.floor(price / qty),
        quantity: qty,
        name: `${gameName} - ${itemName}`.substring(0, 50) // Midtrans max length is 50
      }],
      customer_details: {
        first_name: customerDetails?.first_name || 'Pelanggan',
        email: customerDetails?.email || 'guest@example.com',
        phone: customerDetails?.phone || '08000000000'
      },
      custom_field1: providerCode,
      custom_field2: target1,
      custom_field3: target2
    };

    const transaction = await snap.createTransaction(parameter);

    // 4. Return the Snap Token
    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      trxId: trxId
    });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
