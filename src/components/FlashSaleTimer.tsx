'use client';
import { useState, useEffect } from 'react';

export default function FlashSaleTimer({ endDate }: { endDate?: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let targetDate;
      if (endDate) {
        let parsedDate = endDate;
        try {
          if (endDate.startsWith('{')) {
            const p = JSON.parse(endDate);
            if (p.endDate) parsedDate = p.endDate;
            else parsedDate = '';
          }
        } catch(e) {}
        
        if (parsedDate) {
          targetDate = new Date(parsedDate);
        } else {
          targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        }
      } else {
        targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      }
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return <>{timeLeft || 'Menghitung...'}</>;
}
