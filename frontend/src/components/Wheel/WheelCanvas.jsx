// WheelCanvas.jsx
// ----------------------------------------------------------------------------
// Component: วาดวงล้อบน <canvas> สไตล์ General Clinic & Wheel of Names
// - เข็มชี้ผลลัพธ์ (Pointer) อยู่ที่ด้านขวามือ ชี้เข้าหาวงล้อ
// - สามารถคลิกตรงไหนก็ได้บนวงล้อ (หรือกดปุ่ม SPIN ตรงกลาง) เพื่อสุ่มทันที
// ----------------------------------------------------------------------------

import { useEffect, useRef } from 'react';

const SIZE = 420; // ขนาดของ canvas เป็นพิกเซล (กว้าง = สูง)

export default function WheelCanvas({
  prizes,
  rotation,
  isSpinning,
  spinDurationMs,
  onSpin,
}) {
  const canvasRef = useRef(null);

  // วาดวงล้อใหม่ทุกครั้งที่รายการรางวัลเปลี่ยน (ไม่เกี่ยวกับการหมุน)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;

    const ctx = canvas.getContext('2d');
    const center = SIZE / 2;
    const radius = SIZE / 2 - 8; // เว้นขอบไว้เล็กน้อยสำหรับเส้นขอบวงล้อ
    const segmentAngle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, SIZE, SIZE);

    prizes.forEach((prize, index) => {
      // เริ่มต้นที่ 0 radian (ด้านขวา 3 o'clock) เพื่อให้ตรงกับตำแหน่งลูกศรชี้ด้านขวา
      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      // วาดชิ้นพาย (segment) ของรางวัลนี้
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // วาดข้อความชื่อรางวัล โดยหมุนข้อความให้อยู่ในแนวรัศมีของช่องนั้น
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      // ปรับขนาด font ตามจำนวนช่อง ถ้าช่องเยอะให้เล็กลง
      const fontSize = prizes.length > 12 ? 12 : prizes.length > 8 ? 14 : 16;
      ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", "Prompt", "Kanit", sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 3;

      // ตัดข้อความถ้ายาวเกินไป
      let text = prize.label;
      if (text.length > 18) {
        text = text.substring(0, 16) + '...';
      }
      ctx.fillText(text, radius - 16, fontSize / 3);
      ctx.restore();
    });

    // วงกลมรอบนอกของ Hub ตรงกลาง
    ctx.beginPath();
    ctx.arc(center, center, 44, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();
  }, [prizes]);

  function handleWrapperClick() {
    if (!isSpinning && prizes.length > 0 && onSpin) {
      onSpin();
    }
  }

  return (
    <div
      className={`wheel-wrapper ${isSpinning ? 'is-spinning' : ''}`}
      onClick={handleWrapperClick}
      title={isSpinning ? 'กำลังหมุน...' : 'คลิกที่ส่วนใดก็ได้ของวงล้อ หรือกด Space เพื่อสุ่ม'}
      aria-label="วงล้อสุ่มรางวัล คลิกเพื่อสุ่ม"
      role="button"
      tabIndex={0}
    >
      {/* ลูกศรชี้ผลลัพธ์ อยู่ทางด้านขวามือ (3 o'clock) ชี้เข้าหาวงล้อตามแบบ Wheel of Names */}
      <div className="wheel-pointer" />

      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className={`wheel-canvas ${isSpinning ? 'is-spinning' : ''}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: `${spinDurationMs}ms`,
        }}
      />

      {/* ปุ่มกดสุ่มตรงกลางวงล้อ (Center Spin Button) */}
      <button
        type="button"
        className={`center-spin-btn ${isSpinning ? 'is-spinning' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          handleWrapperClick();
        }}
        disabled={isSpinning || prizes.length === 0}
        title="คลิกเพื่อหมุนวงล้อ"
      >
        <span className="spin-label">{isSpinning ? 'หมุน...' : 'SPIN'}</span>
      </button>

      <style>{`
        .wheel-wrapper {
          position: relative;
          width: ${SIZE}px;
          height: ${SIZE}px;
          margin: 0 auto;
          cursor: pointer;
          user-select: none;
          transition: transform 0.15s ease;
        }
        .wheel-wrapper:hover:not(.is-spinning) {
          transform: scale(1.01);
        }
        .wheel-wrapper.is-spinning {
          cursor: default;
        }
        .wheel-canvas {
          border-radius: 50%;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 0 0 8px #FFFFFF, 0 0 0 10px #E2E8F0;
          transition-property: transform;
          transition-timing-function: cubic-bezier(0.17, 0.67, 0.12, 0.99);
          background: #FFFFFF;
          display: block;
        }
        /* ลูกศรชี้ผลลัพธ์: อยู่ด้านขวา ชี้เข้าหาวงล้อ */
        .wheel-pointer {
          position: absolute;
          top: 50%;
          right: -12px;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 14px solid transparent;
          border-bottom: 14px solid transparent;
          border-right: 28px solid #EF4444;
          z-index: 15;
          filter: drop-shadow(-2px 0 4px rgba(0, 0, 0, 0.25));
          pointer-events: none;
        }
        /* ปุ่มสุ่มใจกลางวงล้อ */
        .center-spin-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 74px;
          height: 74px;
          border-radius: 50%;
          background: #2563EB;
          border: 4px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
          color: #FFFFFF;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          user-select: none;
        }
        .center-spin-btn:hover:not(:disabled) {
          transform: translate(-50%, -50%) scale(1.08);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
          background: #1D4ED8;
        }
        .center-spin-btn:active:not(:disabled) {
          transform: translate(-50%, -50%) scale(0.96);
        }
        .center-spin-btn:disabled {
          cursor: not-allowed;
          opacity: 0.9;
        }
        .center-spin-btn.is-spinning {
          background: #0D9488;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4);
        }
        .spin-label {
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
