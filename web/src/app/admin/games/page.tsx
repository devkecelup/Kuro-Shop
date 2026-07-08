"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminGames() {
  const [games, setGames] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  useEffect(() => {
    fetchGamesAndItems();
  }, []);

  const fetchGamesAndItems = async () => {
    const { data: gamesData } = await supabase.from('games').select('*');
    const { data: itemsData } = await supabase.from('game_items').select('*');

    if (gamesData && itemsData) {
      const combined = gamesData.map(game => ({
        ...game,
        items: itemsData.filter(item => item.game_id === game.id)
      }));
      setGames(combined);
      if (combined.length > 0 && !selectedGameId) setSelectedGameId(combined[0].id);
    }
  };

  const selectedGame = games.find(g => g.id === selectedGameId);

  const handleEditItem = (item: any) => {
    let flash_sale_end = '';
    let flash_sale_stock = 0;
    try {
      if (item.icon_url && item.icon_url.startsWith('{')) {
        const parsed = JSON.parse(item.icon_url);
        flash_sale_end = parsed.endDate || '';
        flash_sale_stock = parsed.stock || 0;
      } else {
        flash_sale_end = item.icon_url || '';
      }
    } catch (e) {
      flash_sale_end = item.icon_url || '';
    }

    setCurrentItem({ 
      ...item, 
      is_flash_sale: item.is_flash_sale || false, 
      discount_price: item.discount_price || item.price,
      provider_code: item.provider_code || '',
      provider_price: item.provider_price || 0,
      category: item.category || '',
      flash_sale_end,
      flash_sale_stock
    });
    setIsEditingItem(true);
  };

  const handleAddItem = () => {
    setCurrentItem({
      name: '',
      price: 0,
      is_flash_sale: false,
      discount_price: 0,
      provider_code: '',
      provider_price: 0,
      category: selectedGame?.name || '',
      flash_sale_end: '',
      flash_sale_stock: 0
    });
    setIsEditingItem(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGame && currentItem) {
      const icon_url = JSON.stringify({ endDate: currentItem.flash_sale_end, stock: currentItem.flash_sale_stock });

      if (currentItem.id) {
        // UPDATE EXISTING ITEM
        const { data, error } = await supabase.from('game_items').update({
          name: currentItem.name,
          price: currentItem.price,
          is_flash_sale: currentItem.is_flash_sale,
          discount_price: currentItem.discount_price,
          provider_code: currentItem.provider_code,
          provider_price: currentItem.provider_price,
          category: currentItem.category,
          icon_url: icon_url
        }).eq('id', currentItem.id).select();

        if (!error && data) {
          const updatedGames = games.map(game => {
            if (game.id === selectedGame.id) {
              return {
                ...game,
                items: game.items.map((item: any) => item.id === currentItem.id ? data[0] : item)
              };
            }
            return game;
          });
          setGames(updatedGames);
        } else {
          console.error(error);
        }
      } else {
        // INSERT NEW ITEM
        const { data, error } = await supabase.from('game_items').insert({
          game_id: selectedGame.id,
          name: currentItem.name,
          price: currentItem.price,
          is_flash_sale: currentItem.is_flash_sale,
          discount_price: currentItem.discount_price,
          provider_code: currentItem.provider_code,
          provider_price: currentItem.provider_price,
          category: currentItem.category,
          icon_url: icon_url
        }).select();

        if (!error && data) {
          const updatedGames = games.map(game => {
            if (game.id === selectedGame.id) {
              return {
                ...game,
                items: [...game.items, data[0]]
              };
            }
            return game;
          });
          setGames(updatedGames);
        } else {
          console.error(error);
          alert('Gagal menambah item. Pastikan semua field sudah benar.');
        }
      }
      setIsEditingItem(false);
      setCurrentItem(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-white)', fontWeight: 800 }}>Kelola Game & Harga</h1>
      
      {/* Game Selector */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {games.map(game => (
          <button 
            key={game.id}
            onClick={() => setSelectedGameId(game.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: selectedGameId === game.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
              backgroundColor: selectedGameId === game.id ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)',
              color: selectedGameId === game.id ? 'var(--primary-color)' : 'var(--text-gray)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: 'bold'
            }}
          >
            {game.name}
          </button>
        ))}
      </div>

      {/* Edit/Add Item Form */}
      {isEditingItem && currentItem && (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-white)' }}>{currentItem.id ? `Edit Item: ${currentItem.name}` : 'Tambah Item Baru'}</h2>
          <form onSubmit={handleSaveItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)', fontWeight: 500 }}>Nama Item / Jumlah Diamond</label>
              <input 
                type="text" 
                value={currentItem.name} 
                onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
                required
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)', fontWeight: 500 }}>Kategori Item (Penting agar muncul di topup page!)</label>
              <input 
                type="text" 
                value={currentItem.category} 
                onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
                placeholder="Misal: Voucher Roblox"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)', fontWeight: 500 }}>Harga Asli (Rp)</label>
              <input 
                type="number" 
                value={currentItem.price} 
                onChange={(e) => setCurrentItem({...currentItem, price: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
              />
            </div>
            
            <div style={{ gridColumn: '1 / -1', padding: '1.5rem', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ color: 'var(--text-white)', marginBottom: '1rem', fontSize: '1.1rem' }}>Data Supplier (VIP Reseller)</h3>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)', fontWeight: 500 }}>Kode SKU Provider</label>
                <input 
                  type="text" 
                  value={currentItem.provider_code} 
                  onChange={(e) => setCurrentItem({...currentItem, provider_code: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
                  placeholder="Misal: ML-86"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)', fontWeight: 500 }}>Harga Beli Supplier (Rp)</label>
                <input 
                  type="number" 
                  value={currentItem.provider_price} 
                  onChange={(e) => setCurrentItem({...currentItem, provider_price: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                 <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: '#065f46', fontWeight: 500 }}>Potensi Keuntungan (Margin):</span>
                   <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                     Rp {((currentItem.is_flash_sale ? currentItem.discount_price : currentItem.price) - (currentItem.provider_price || 0)).toLocaleString('id-ID')}
                   </span>
                 </div>
              </div>
            </div>
            
            <div style={{ gridColumn: '1 / -1', padding: '1.5rem', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-white)', cursor: 'pointer', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={currentItem.is_flash_sale}
                  onChange={(e) => setCurrentItem({...currentItem, is_flash_sale: e.target.checked})}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}
                />
                Jadikan Item Flash Sale / Diskon!
              </label>
              
              {currentItem.is_flash_sale && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)', fontWeight: 500 }}>Harga Setelah Diskon (Rp)</label>
                    <input 
                      type="number" 
                      value={currentItem.discount_price} 
                      onChange={(e) => setCurrentItem({...currentItem, discount_price: parseInt(e.target.value) || 0})}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--primary-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)', fontWeight: 500 }}>Batas Stok Flash Sale</label>
                    <input 
                      type="number" 
                      value={currentItem.flash_sale_stock} 
                      onChange={(e) => setCurrentItem({...currentItem, flash_sale_stock: parseInt(e.target.value) || 0})}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--primary-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
                    />
                    <small style={{ color: '#10b981', display: 'block', marginTop: '4px' }}>*Isi 0 jika tanpa batas.</small>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-gray)', fontWeight: 500 }}>Batas Waktu Flash Sale (Target Berakhir)</label>
                  <input 
                    type="datetime-local" 
                    value={currentItem.flash_sale_end ? new Date(new Date(currentItem.flash_sale_end).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentItem({...currentItem, flash_sale_end: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-white)' }}
                  />
                  <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '8px' }}>
                    *Kosongkan untuk otomatis berakhir hari ini jam 23:59.
                  </p>
                </div>
              </div>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" style={{ backgroundColor: '#10b981', color: 'var(--bg-card)', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan Perubahan</button>
              <button type="button" onClick={() => setIsEditingItem(false)} style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-gray)', padding: '10px 20px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--text-white)', fontWeight: 700 }}>Daftar Harga: {selectedGame?.name}</h2>
          <button onClick={handleAddItem} style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Tambah Item</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Nama Item</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Harga Normal</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Harga Supplier</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Margin</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem' }}>Harga Flash Sale</th>
              <th style={{ padding: '1rem', color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {selectedGame?.items.map((item: any, index: number) => (
              <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem', color: 'var(--text-white)', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-gray)' }}>Rp {item.price.toLocaleString('id-ID')}</td>
                <td style={{ padding: '1rem', color: 'var(--text-gray)' }}>Rp {(item.provider_price || 0).toLocaleString('id-ID')}</td>
                <td style={{ padding: '1rem', color: '#10b981', fontWeight: 'bold' }}>
                  Rp {((item.is_flash_sale && item.discount_price ? item.discount_price : item.price) - (item.provider_price || 0)).toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '1rem' }}>
                  {item.is_flash_sale ? (
                    <span style={{ backgroundColor: 'rgba(230, 0, 0, 0.2)', color: 'var(--primary-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Flash Sale</span>
                  ) : (
                    <span style={{ color: 'var(--text-gray)', fontSize: '0.8rem', fontWeight: 500 }}>Normal</span>
                  )}
                </td>
                <td style={{ padding: '1rem', color: '#10b981', fontWeight: 'bold' }}>
                  {item.is_flash_sale && item.discount_price ? `Rp ${item.discount_price.toLocaleString('id-ID')}` : '-'}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEditItem(item)} style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit Harga</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
