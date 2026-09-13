// SpinButton.jsx
// ----------------------------------------------------------------------------
// ปุ่มกดหมุนวงล้อ ปิดการกดซ้ำระหว่างที่กำลังหมุนอยู่ (isSpinning)
// ----------------------------------------------------------------------------

export default function SpinButton({ onClick, isSpinning, disabled }) {
  return (
    <button
      className="btn btn-primary spin-button"
      onClick={onClick}
      disabled={isSpinning || disabled}
    >
      {isSpinning ? 'กำลังหมุน...' : 'หมุนวงล้อ'}
      <style>{`
        .spin-button {
          font-family: var(--font-display);
          font-size: 1.05rem;
          padding: 0.9rem 2.2rem;
        }
      `}</style>
    </button>
  );
}
