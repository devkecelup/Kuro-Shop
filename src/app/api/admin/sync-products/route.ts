import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';
import { getServices } from '@/lib/vipayment';

const GAME_MAPPING: Record<string, string> = {
  'Mobile Legends A': 'Mobile Legends (Indonesia)',
  'Mobile Legends B': 'Mobile Legends (Promo ID)',
  'Mobile Legends (Malaysia)': 'Mobile Legends (Malaysia)',
  'Free Fire': 'Free Fire',
  'Free Fire Max': 'Free Fire Max',
  'PUBG Mobile (ID)': 'PUBG Mobile',
  'Valorant': 'Valorant',
  'Genshin Impact': 'Genshin Impact',
  'Call Of Duty Mobile (Indonesia)': 'Call of Duty Mobile',
  'Arena of Valor': 'Arena of Valor',
  'EA SPORTS FC Mobile': 'EA FC Mobile',
  'Point Blank (ID)': 'Point Blank',
  'Tower of Fantasy': 'Tower of Fantasy',
  'Honkai: Star Rail': 'Honkai: Star Rail',
  'Honor of Kings Global': 'Honor of Kings',
  'Metal Slug Awakening': 'Metal Slug Awakening',
  'Ragnarok Origin': 'Ragnarok Origin',
  'Sausage Man': 'Sausage Man',
  'Steam Wallet Code': 'Steam Wallet',
  'Voucher Garena Shell': 'Garena Shell',
  'Roblox': 'Roblox',
  'Brawl Stars': 'Brawl Stars',
  'Clash of Clans': 'Clash of Clans',
  'League of Legends: Wild Rift': 'Wild Rift',
  'Eggy Party': 'Eggy Party',
  'Blood Strike': 'Blood Strike',
  'Clash Royale': 'Clash Royale'
};

const IMAGE_MAPPING: Record<string, string> = {
  'Mobile Legends (Indonesia)': 'https://i.postimg.cc/mZhZpT5W/mlbb.jpg',
  'Mobile Legends (Promo ID)': 'https://i.postimg.cc/mZhZpT5W/mlbb.jpg',
  'Mobile Legends (Malaysia)': 'https://i.postimg.cc/mZhZpT5W/mlbb.jpg',
  'Free Fire': 'https://dl.dir.freefiremobile.com/common/web_event/hash/6d1c8f18471b48b59ad9e1c22bc8c5c4.jpg',
  'PUBG Mobile': 'https://cdn.midasbuy.com/images/apps/pubgm/1594627112002kE6n6.png',
  'Valorant': 'https://playvalorant.com/assets/video/ss/valorant-share.png',
  'Genshin Impact': 'https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/367ed1ffb790d9841c7b8e5db1a70495_5017282869062325946.png',
  'Roblox': 'https://i.pinimg.com/736x/87/b9/3b/87b93b827e69d760b8c66e2c34d38ba6.jpg',
  'Brawl Stars': 'https://i.pinimg.com/736x/91/9f/8e/919f8efc0fdf78f6534dc92ed71fce8c.jpg',
  'Clash of Clans': 'https://i.pinimg.com/736x/a0/fc/19/a0fc19a8ea8dcd5b1116f1a8e1e7dc65.jpg'
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data dari VIP Reseller
    const apiResponse = await getServices('type', 'game-feature');
    
    if (!apiResponse.result || !apiResponse.data) {
      return NextResponse.json({ success: false, message: 'Gagal mengambil data dari API VIP Reseller' }, { status: 500 });
    }

    const items = apiResponse.data;
    
    // Filter hanya game yang ada di mapping kita
    const filteredItems = items.filter((item: any) => {
      if (item.status !== 'available') return false;
      return Object.keys(GAME_MAPPING).includes(item.game.trim());
    });

    // Kelompokkan berdasarkan Game
    const gamesMap = new Map();
    filteredItems.forEach((item: any) => {
      const originalName = item.game.trim();
      const mappedName = GAME_MAPPING[originalName] || originalName;
      if (!gamesMap.has(mappedName)) {
        gamesMap.set(mappedName, []);
      }
      gamesMap.get(mappedName).push(item);
    });

    let gamesAdded = 0;
    let itemsAdded = 0;

    // Masukkan ke Database
    for (const [gameName, gameItems] of gamesMap.entries()) {
      // 1. Cek atau Buat Game di tabel `games`
      let gameId;
      const { data: existingGame } = await supabase
        .from('games')
        .select('id')
        .eq('name', gameName)
        .single();
        
      if (existingGame) {
        gameId = existingGame.id;
      } else {
        // Coba cari gambar dari mapping, kalau ga ada pake UI Avatars
        const gameImage = IMAGE_MAPPING[gameName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(gameName)}&background=random&color=fff&size=512&font-size=0.4&bold=true`;
        
        // Bikin slug sederhana dari nama game
        const slug = gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const { data: newGame, error: gameError } = await supabase
          .from('games')
          .insert({
            name: gameName,
            slug: slug,
            developer: 'Various',
            category: 'Mobile',
            image_url: gameImage
          })
          .select()
          .single();
          
        if (gameError || !newGame) {
          console.error('Error insert game', gameError);
          continue;
        }
        gameId = newGame.id;
        gamesAdded++;
      }

      // 2. Masukkan Items ke tabel `game_items`
      for (const item of gameItems) {
        // Cek apakah item (berdasarkan provider_code) sudah ada
        const { data: existingItem } = await supabase
          .from('game_items')
          .select('id')
          .eq('provider_code', item.code)
          .single();

        const providerPrice = item.price.basic;
        // Tambahkan margin awal +10%
        const sellingPrice = Math.ceil(providerPrice * 1.10); 

        if (existingItem) {
          // Update harga supplier (tanpa mengubah harga jual admin kalau sudah diedit)
          await supabase
            .from('game_items')
            .update({
              provider_price: providerPrice,
              server: item.server || null
            })
            .eq('id', existingItem.id);
        } else {
          // Insert item baru
          await supabase
            .from('game_items')
            .insert({
              game_id: gameId,
              name: item.name,
              price: sellingPrice,
              provider_code: item.code,
              provider_price: providerPrice,
              is_flash_sale: false,
              discount_price: 0,
              server: item.server || null
            });
          itemsAdded++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil sinkronisasi. ${gamesAdded} Game baru ditambahkan. ${itemsAdded} Produk baru ditambahkan.`,
      stats: { gamesAdded, itemsAdded }
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
