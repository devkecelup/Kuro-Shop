import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkStatus } from '@/lib/vipayment';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email tidak valid' }, { status: 400 });
    }

    // Ambil semua transaksi user
    const { data: trxData, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error || !trxData) {
      return NextResponse.json({ success: false, message: 'Gagal mengambil riwayat' }, { status: 500 });
    }

    // Update status transaksi yang masih Diproses atau Pending untuk game VIP
    const updatedData = await Promise.all(trxData.map(async (trx) => {
      const gameName = (trx.game_name || '').toLowerCase();
      const isManual = gameName.includes('roblox') || gameName.includes('joki');

      // Jika bukan manual, dan status masih belum final
      if (!isManual && (trx.status === 'Diproses' || trx.status === 'Pending')) {
        const vipRes = await checkStatus(trx.id);
        
        let updatedStatus = trx.status;
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

          if (updatedStatus !== trx.status) {
            await supabase.from('transactions').update({ status: updatedStatus }).eq('id', trx.id);
            return { ...trx, status: updatedStatus };
          }
        }
      }

      return trx;
    }));

    return NextResponse.json({
      success: true,
      data: updatedData
    });

  } catch (error: any) {
    console.error("Riwayat API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
