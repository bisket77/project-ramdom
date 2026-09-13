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

  /** loadPrizes: โหลดรายการรางวัลจาก backend มาแสดงบนวงล้อ */
  const loadPrizes = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPrizes();
      if (data && data.length > 0) {
        setPrizes(data);
      }
    } catch (err) {
      console.warn('Backend not ready, using local prizes:', err.message);
      // ถ้าติดต่อ backend ไม่ได้ ให้คงข้อมูลตัวอย่างไว้ วงล้อจะได้ไม่หายเป็นหน้าจอดำ
      setPrizes((prev) =>
        prev.length > 0
          ? prev
          : [
              { id: '1', label: 'Ali', color: '#2563EB', weight: 1, sortOrder: 0, isActive: true },
              { id: '2', label: 'Beatriz', color: '#0D9488', weight: 1, sortOrder: 1, isActive: true },
              { id: '3', label: 'Charles', color: '#F59E0B', weight: 1, sortOrder: 2, isActive: true },
              { id: '4', label: 'Diya', color: '#7C3AED', weight: 1, sortOrder: 3, isActive: true },
              { id: '5', label: 'Eric', color: '#E11D48', weight: 1, sortOrder: 4, isActive: true },
              { id: '6', label: 'Fatima', color: '#059669', weight: 1, sortOrder: 5, isActive: true },
              { id: '7', label: 'Gabriel', color: '#EA580C', weight: 1, sortOrder: 6, isActive: true },
              { id: '8', label: 'Hanna', color: '#4F46E5', weight: 1, sortOrder: 7, isActive: true },
            ]
      );
    }
  }, []);

  /**
   * spin: เริ่มกระบวนการหมุน
   * 1. เรียก backend เพื่อสุ่มผล (ได้ winningIndex กลับมา)
   * 2. คำนวณองศาปลายทางให้ตรงกับช่องที่ชนะ พร้อมบวกรอบหมุนเพิ่มเพื่อความสวยงาม
   * 3. ตั้งค่า state เพื่อให้ CSS transition หมุนวงล้อไปยังองศานั้น
   */
  const spin = useCallback(
    async (playerName) => {
      if (isSpinning || prizes.length === 0) return;

      setIsSpinning(true);
      setResult(null);
      setError(null);

      try {
        const data = await spinWheel(playerName);
        const { prize, winningIndex, totalSegments } = data;

        const segmentAngle = 360 / totalSegments;
        // มุมกึ่งกลางของช่องที่ชนะ (นับจากจุดเริ่มต้นของวงล้อ)
        const targetSegmentCenter = winningIndex * segmentAngle + segmentAngle / 2;

        // ลูกศรชี้ตายตัวที่ด้านบน (0 องศา) ดังนั้นต้องหมุนวงล้อ "ย้อนกลับ" ให้ช่องที่ชนะ
        // มาอยู่ตรงลูกศรพอดี แล้วบวกรอบเต็มเพิ่มเข้าไปให้ดูมีจังหวะลุ้น
        const currentFullTurns = Math.floor(rotationRef.current / 360);
        const nextRotation =
          (currentFullTurns + EXTRA_FULL_SPINS) * 360 + (360 - targetSegmentCenter);

        rotationRef.current = nextRotation;
        setRotation(nextRotation);

        // รอให้แอนิเมชันหมุนจบก่อนค่อยแสดงผลลัพธ์ (sync กับ CSS transition duration)
        setTimeout(() => {
          setResult(prize);
          setIsSpinning(false);
        }, SPIN_DURATION_MS);
      } catch (err) {
        setError(err.message);
        setIsSpinning(false);
      }
    },
    [isSpinning, prizes.length]
  );

  return {
    prizes,
    setPrizes,
    rotation,
    isSpinning,
    result,
    error,
    loadPrizes,
    spin,
    spinDurationMs: SPIN_DURATION_MS,
  };
}
