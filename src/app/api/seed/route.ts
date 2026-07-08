import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GAMES, GAME_ORDER } from '@/lib/gamesData';

export async function GET() {
  try {
    // 1. Clear existing games and items to prevent duplicates
    await supabase.from('game_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    await supabase.from('games').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    let gamesInserted = 0;
    let itemsInserted = 0;

    // 2. Iterate through GAME_ORDER
    for (const key of GAME_ORDER) {
      const g = (GAMES as any)[key];
      if (!g) continue;

      // Insert Game
      const { data: gameData, error: gameError } = await supabase.from('games').insert([{
        internal_id: key,
        name: g.name,
        category: g.cat,
        image_url: g.logoUrl,
        developer: '' // Not available in GAMES object
      }]).select();

      if (gameError || !gameData) {
        console.error("Error inserting game", key, gameError);
        continue;
      }
      const gameId = gameData[0].id;
      gamesInserted++;

      // Insert Items
      // Some games use categories, some use a flat nominals array
      if (g.categories) {
        for (const cat of g.categories) {
          const itemsToInsert = cat.items.map((item: any) => {
            const price = item.price;
            let name = item.label || "";
            if (!name && item.base) {
              name = `${item.base + item.bonus} ${g.unit} (${item.base}+${item.bonus})`;
            }
            return {
              game_id: gameId,
              name: name,
              price: price,
              category: cat.label,
              icon_url: cat.icon || g.nominalIcon || null,
              is_flash_sale: item.tag === 'Promo' || item.tag === 'Disc 5%' || item.tag === 'Disc 17%',
              discount_price: item.old ? item.price : null,
              is_active: true
            };
          });

          if (itemsToInsert.length > 0) {
            const { error: itemError } = await supabase.from('game_items').insert(itemsToInsert);
            if (!itemError) itemsInserted += itemsToInsert.length;
          }
        }
      } else if (g.nominals) {
        const itemsToInsert = g.nominals.map((item: any) => {
          const price = item.price;
          let name = item.label || "";
          if (!name && item.base) {
            name = `${item.base + item.bonus} ${g.unit} (${item.base}+${item.bonus})`;
          }
          return {
            game_id: gameId,
            name: name,
            price: price,
            category: 'Top Up',
            icon_url: g.nominalIcon || null,
            is_flash_sale: item.tag === 'Promo',
            discount_price: item.old ? item.price : null,
            is_active: true
          };
        });

        if (itemsToInsert.length > 0) {
          const { error: itemError } = await supabase.from('game_items').insert(itemsToInsert);
          if (!itemError) itemsInserted += itemsToInsert.length;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Seeded ${gamesInserted} games and ${itemsInserted} items.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
