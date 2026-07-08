"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    transactions: 0,
    discountLoss: 0
  });
  
  const [chartData, setChartData] = useState<any[]>([
    { name: 'Senin', pendapatan: 0, potongan: 0 },
    { name: 'Selasa', pendapatan: 0, potongan: 0 },
    { name: 'Rabu', pendapatan: 0, potongan: 0 },
    { name: 'Kamis', pendapatan: 0, potongan: 0 },
    { name: 'Jumat', pendapatan: 0, potongan: 0 },
    { name: 'Sabtu', pendapatan: 0, potongan: 0 },
    { name: 'Minggu', pendapatan: 0, potongan: 0 },
  ]);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data, error } = await supabase.from('transactions').select('*');
      if (data && !error) {
        // Calculate Stats
        const totalRevenue = data.reduce((acc, curr) => {
          if (curr.status === 'Sukses' || curr.status === 'Berhasil' || curr.status === 'Dikirim') {
            return acc + curr.price;
          }
          return acc;
        }, 0);
        
        const totalTransactions = data.length;
        
        // Group by day for the chart (Simple implementation based on creation date day of week)
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const groupedData = [
          { name: 'Senin', pendapatan: 0, potongan: 0 },
          { name: 'Selasa', pendapatan: 0, potongan: 0 },
          { name: 'Rabu', pendapatan: 0, potongan: 0 },
          { name: 'Kamis', pendapatan: 0, potongan: 0 },
          { name: 'Jumat', pendapatan: 0, potongan: 0 },
          { name: 'Sabtu', pendapatan: 0, potongan: 0 },
          { name: 'Minggu', pendapatan: 0, potongan: 0 },
        ];
        
        data.forEach(trx => {
          if (trx.status === 'Sukses' || trx.status === 'Berhasil' || trx.status === 'Dikirim') {
            const d = new Date(trx.created_at);
            const dayName = dayNames[d.getDay()];
            const target = groupedData.find(g => g.name === dayName);
            if (target) {
              target.pendapatan += trx.price;
            }
          }
        });

        setStats({
          revenue: totalRevenue,
          transactions: totalTransactions,
          discountLoss: 0 // Mock for now or calculate if discount info exists
        });
        setChartData(groupedData);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-white)', fontWeight: 800 }}>Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Pendapatan (7 Hari)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            Rp {stats.revenue.toLocaleString('id-ID')}
          </div>
        </div>
        
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Potongan / Flash Sale</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            Rp {stats.discountLoss.toLocaleString('id-ID')}
          </div>
        </div>
        
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Transaksi</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.transactions} Pesanan
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'var(--text-white)', fontWeight: 700 }}>Grafik Pendapatan vs Potongan (7 Hari Terakhir)</h2>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPotongan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-gray)" tick={{ fill: 'var(--text-gray)' }} />
              <YAxis stroke="var(--text-gray)" tick={{ fill: 'var(--text-gray)' }} tickFormatter={(value) => `Rp ${value / 1000000}M`} />
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-dark)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--text-white)', fontWeight: 'bold' }}
                formatter={(value: any) => `Rp ${value.toLocaleString('id-ID')}`}
              />
              <Area type="monotone" dataKey="pendapatan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPendapatan)" />
              <Area type="monotone" dataKey="potongan" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorPotongan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
