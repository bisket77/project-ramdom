// useWheelSpin.js
// ----------------------------------------------------------------------------
// Custom hook: รวม logic ทั้งหมดของการหมุนวงล้อไว้ในที่เดียว
// แยกออกจาก UI component เพื่อให้ทดสอบและอ่านง่ายขึ้น
//
// แนวคิดสำคัญ: ผลลัพธ์ของการสุ่ม "ตัดสินที่ backend เท่านั้น"
// หน้าที่ของ hook นี้คือรับผลลัพธ์มาแล้วคำนวณว่าต้อง "หมุนวงล้อไปกี่องศา"
// เพื่อให้ลูกศรชี้ไปตรงกับช่องที่ backend บอกว่าชนะพอดี
// ----------------------------------------------------------------------------

import { useState, useCallback, useRef } from 'react';
import { fetchPrizes, spinWheel } from '../services/api';

const EXTRA_FULL_SPINS = 6; // จำนวนรอบเต็มที่หมุนเพิ่ม เพื่อให้ดูมีจังหวะลุ้นก่อนหยุด
const SPIN_DURATION_MS = 4200;

export function useWheelSpin() {
  const [prizes, setPrizes] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null); // รางวัลล่าสุดที่ชนะ
  const [error, setError] = useState(null);
  const rotationRef = useRef(0); // เก็บค่าองศาปัจจุบันไว้ใช้คำนวณรอบถัดไป (ไม่ให้หมุนย้อนกลับ)

  /** loadPrizes: โหลดรายการรางวัลจาก backend มาแสดงบนวงล้อ หรือ fallback จาก localStorage */
  const loadPrizes = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPrizes();
      if (data && data.length > 0) {
        setPrizes(data);
        try {
          localStorage.setItem('lucky_spin_prizes', JSON.stringify(data));
        } catch (e) {}
        return;
      }
    } catch (err) {
      console.warn('Backend not ready, checking local storage:', err.message);
    }

    // ถ้าติดต่อ backend ไม่ได้ ให้ดึงจาก localStorage
    try {
      const saved = localStorage.getItem('lucky_spin_prizes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPrizes(parsed);
          return;
        }
      }
    } catch (e) {}

    // ข้อมูลเริ่มต้น 8 ชื่อ
    setPrizes([
      { id: '1', label: 'Ali', color: '#2563EB', weight: 1, sortOrder: 0, isActive: true },
      { id: '2', label: 'Beatriz', color: '#0D9488', weight: 1, sortOrder: 1, isActive: true },
      { id: '3', label: 'Charles', color: '#F59E0B', weight: 1, sortOrder: 2, isActive: true },
      { id: '4', label: 'Diya', color: '#7C3AED', weight: 1, sortOrder: 3, isActive: true },
      { id: '5', label: 'Eric', color: '#E11D48', weight: 1, sortOrder: 4, isActive: true },
      { id: '6', label: 'Fatima', color: '#059669', weight: 1, sortOrder: 5, isActive: true },
      { id: '7', label: 'Gabriel', color: '#EA580C', weight: 1, sortOrder: 6, isActive: true },
      { id: '8', label: 'Hanna', color: '#4F46E5', weight: 1, sortOrder: 7, isActive: true },
    ]);
  }, []);

  /**
   * spin: เริ่มกระบวนการหมุน
   * 1. เรียก backend เพื่อสุ่มผล (ถ้าติดต่อไม่ได้ ให้สุ่มใน client อัตโนมัติ)
   * 2. คำนวณองศาปลายทางให้ตรงกับช่องที่ชนะ พร้อมบวกรอบหมุนเพิ่ม
   * 3. หมุนวงล้อไปยังองศานั้น และแสดงผลลัพธ์
   */
  const spin = useCallback(
    async (playerName) => {
      if (isSpinning || prizes.length === 0) return null;

      setIsSpinning(true);
      setResult(null);
      setError(null);

      try {
        let prize, winningIndex, totalSegments;

        try {
          const data = await spinWheel(playerName);
          if (data && data.prize) {
            prize = data.prize;
            winningIndex = data.winningIndex;
            totalSegments = data.totalSegments || prizes.length;
          } else {
            throw new Error('Invalid backend response');
          }
        } catch (apiErr) {
          console.warn('Backend unavailable, spinning client-side:', apiErr.message);
          // Fallback: Randomize locally based on weights
          totalSegments = prizes.length;
          const totalWeight = prizes.reduce((sum, p) => sum + (Number(p.weight) || 1), 0);
          let randomVal = Math.random() * totalWeight;
          let chosenIndex = 0;
          for (let i = 0; i < prizes.length; i++) {
            randomVal -= (Number(prizes[i].weight) || 1);
            if (randomVal <= 0) {
              chosenIndex = i;
              break;
            }
          }
          winningIndex = chosenIndex;
          prize = prizes[chosenIndex];

          // Save to local history fallback
          try {
            const currentHistory = JSON.parse(localStorage.getItem('lucky_spin_history') || '[]');
            const newEntry = {
              id: Date.now(),
              Prize: prize,
              playerName: playerName || 'Guest',
              createdAt: new Date().toISOString(),
            };
            currentHistory.unshift(newEntry);
            localStorage.setItem('lucky_spin_history', JSON.stringify(currentHistory.slice(0, 100)));
          } catch (e) {}
        }

        const segmentAngle = 360 / totalSegments;
        const targetSegmentCenter = winningIndex * segmentAngle + segmentAngle / 2;
        const currentFullTurns = Math.floor(rotationRef.current / 360);
        const nextRotation =
          (currentFullTurns + EXTRA_FULL_SPINS) * 360 + (360 - targetSegmentCenter);

        rotationRef.current = nextRotation;
        setRotation(nextRotation);

        return new Promise((resolve) => {
          setTimeout(() => {
            setResult(prize);
            setIsSpinning(false);
            resolve(prize);
          }, SPIN_DURATION_MS);
        });
      } catch (err) {
        console.error('Spin error:', err);
        setIsSpinning(false);
        return null;
      }
    },
    [isSpinning, prizes]
  );

  return {
    prizes,
    setPrizes,
    rotation,
    isSpinning,
    result,
    setResult,
    error,
    loadPrizes,
    spin,
    spinDurationMs: SPIN_DURATION_MS,
  };
}
