import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkStatus } from '@/lib/vipayment';

export async function POST(request: Request) {
  try {
    const { invoice } = await request.json();

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'Invoice tidak valid' }, { status: 400 });
    }

    // Ambil data transaksi dari Supabase
    const { data: trxData, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', invoice)
      .single();

    if (error || !trxData) {
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const gameName = (trxData.game_name || '').toLowerCase();
    const isManual = gameName.includes('roblox') || gameName.includes('joki');

    // Jika game manual (Roblox / Joki), kita langsung kembalikan status dari Supabase
    if (isManual) {
      return NextResponse.json({
        success: true,
        data: trxData
      });
    }

    // Jika topup via VIP API, coba fetch status terbarunya dari VIP API
    // Asumsi trxData.id adalah trxid dari VIP API jika sistem sudah terhubung penuh
    const vipRes = await checkStatus(trxData.id);
    
    // Biasanya VIP mengembalikan status seperti 'success', 'pending', 'error'
    // Kita map kembali ke format status kita jika API berhasil memberikan status
    let updatedStatus = trxData.status;

    if (vipRes && vipRes.result && vipRes.data && vipRes.data.length > 0) {
      const vipStatus = vipRes.data[0].status?.toLowerCase();
      if (vipStatus === 'success' || vipStatus === 'berhasil') {
        updatedStatus = 'Sukses';
      } else if (vipStatus === 'error' || vipStatus === 'gagal' || vipStatus === 'failed') {
        updatedStatus = 'Gagal';
      } else if (vipStatus === 'pending') {
        updatedStatus = 'Pending';
      } else if (vipStatus === 'processing') {
        updatedStatus = 'Diproses';
      }

      // Opsional: Update status di database agar sinkron
      if (updatedStatus !== trxData.status) {
        await supabase.from('transactions').update({ status: updatedStatus }).eq('id', trxData.id);
        trxData.status = updatedStatus;
      }
    }

    return NextResponse.json({
      success: true,
      data: trxData
    });

  } catch (error: any) {
    console.error("Cek Pesanan API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
