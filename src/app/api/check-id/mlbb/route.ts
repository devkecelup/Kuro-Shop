import { NextResponse } from 'next/server';
import { checkGameId } from '@/lib/vipayment';

export async function POST(request: Request) {
  try {
    const { userid, zoneid } = await request.json();

    if (!userid || !zoneid) {
      return NextResponse.json({ success: false, message: 'userid dan zoneid dibutuhkan' }, { status: 400 });
    }

    const vipResult = await checkGameId('mobile-legends', userid, zoneid);

    if (vipResult.result === true && vipResult.data) {
      return NextResponse.json({ 
        success: true, 
        username: vipResult.data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: vipResult.message || 'ID tidak ditemukan atau server VIP sedang gangguan' 
      });
    }
  } catch (error: any) {
    console.error('Error checking MLBB ID:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengecek ID' }, { status: 500 });
  }
}
