const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const vipIdMatch = env.match(/VIP_API_ID=(.*)/);
const vipKeyMatch = env.match(/VIP_API_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';
const vipId = vipIdMatch ? vipIdMatch[1].trim() : '';
const vipKey = vipKeyMatch ? vipKeyMatch[1].trim() : '';

const supabase = createClient(url, key);

const GAME_MAPPING = {
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

const IMAGE_MAPPING = {
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

function generateVipSign(apiId, apiKey) {
  return crypto.createHash('md5').update(apiId + apiKey).digest('hex');
}

async function main() {
  const sign = generateVipSign(vipId, vipKey);
  
  const response = await fetch('https://vip-reseller.co.id/api/game-feature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      key: vipKey,
      sign: sign,
      type: 'services',
      filter_type: 'game',
      filter_value: ''
    })
  });
  
  const apiResponse = await response.json();
  if (!apiResponse.result || !apiResponse.data) {
    console.error('API VIP error:', apiResponse);
    return;
  }
  
  const items = apiResponse.data;
  const filteredItems = items.filter(item => {
    if (item.status !== 'available') return false;
    return Object.keys(GAME_MAPPING).includes(item.game.trim());
  });

  const gamesMap = new Map();
  filteredItems.forEach(item => {
    const originalName = item.game.trim();
    const mappedName = GAME_MAPPING[originalName] || originalName;
    if (!gamesMap.has(mappedName)) {
      gamesMap.set(mappedName, []);
    }
    gamesMap.get(mappedName).push(item);
  });

  let gamesAdded = 0;
  let itemsAdded = 0;

  for (const [gameName, gameItems] of gamesMap.entries()) {
    let gameId;
    const { data: existingGame } = await supabase
      .from('games')
      .select('id')
      .eq('name', gameName)
      .single();
      
    if (existingGame) {
      gameId = existingGame.id;
    } else {
      const gameImage = IMAGE_MAPPING[gameName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(gameName)}&background=random&color=fff&size=512&font-size=0.4&bold=true`;
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

    for (const item of gameItems) {
      const { data: existingItem } = await supabase
        .from('game_items')
        .select('id')
        .eq('provider_code', item.code)
        .single();

      const providerPrice = item.price.basic;
      const sellingPrice = Math.ceil(providerPrice * 1.10); 

      if (existingItem) {
        await supabase
          .from('game_items')
          .update({
            provider_price: providerPrice,
            server: item.server || null
          })
          .eq('id', existingItem.id);
      } else {
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

  console.log(`Berhasil sinkronisasi. ${gamesAdded} Game baru ditambahkan. ${itemsAdded} Produk baru ditambahkan.`);
}

main();
