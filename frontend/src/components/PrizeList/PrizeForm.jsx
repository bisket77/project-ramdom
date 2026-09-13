// PrizeForm.jsx
// ----------------------------------------------------------------------------
// ฟอร์มสำหรับเพิ่มรางวัลใหม่เข้าไปในวงล้อ
// ----------------------------------------------------------------------------

import { useState } from 'react';

const PRESET_COLORS = ['#FF3D81', '#2DE1C2', '#FFD23F', '#7C5CFF', '#3DDC97', '#FF6B6B'];

export default function PrizeForm({ onSubmit }) {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [weight, setWeight] = useState(1);

  /** handleSubmit: ตรวจสอบข้อมูลเบื้องต้นก่อนส่งให้ parent component บันทึกลง backend */
  function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim()) return;

    onSubmit({ label: label.trim(), color, weight: Number(weight) });
    setLabel('');
    setWeight(1);
  }

  return (
    <form onSubmit={handleSubmit} className="prize-form">
      <input
        type="text"
        placeholder="ชื่อรางวัล เช่น ส่วนลด 20%"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        maxLength={100}
      />

      <div className="prize-form-row">
        <div className="color-picker">
          {PRESET_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              className={`swatch-btn ${color === c ? 'is-selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`เลือกสี ${c}`}
            />
          ))}
        </div>

        <input
          type="number"
          min={1}
          max={20}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          title="น้ำหนักโอกาสสุ่ม (ยิ่งมากยิ่งมีโอกาสออกเยอะ)"
          style={{ width: '70px' }}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
        เพิ่มรางวัล
      </button>

      <style>{`
        .prize-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .prize-form-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .color-picker {
          display: flex;
          gap: 0.4rem;
        }
        .swatch-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
        }
        .swatch-btn.is-selected {
          border-color: var(--color-text);
        }
      `}</style>
    </form>
  );
}
