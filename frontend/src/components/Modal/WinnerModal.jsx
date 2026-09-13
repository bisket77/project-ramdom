// WinnerModal.jsx
// ----------------------------------------------------------------------------
// โมดัลเฉลิมฉลองผลรางวัลที่สุ่มได้ สไตล์ Modern Clinic & Wheel of Names
// - ยิง Confetti พลุเอฟเฟกต์เฉลิมฉลองอัตโนมัติ
// - แสดงชื่อผู้ชนะขนาดใหญ่ คมชัด สวยงาม ทันสมัย
// - รองรับทั้งการสุ่ม 1 ครั้ง และการสุ่มแบบชุด (Multi-spin)
// - มีปุ่ม "หมุนอีกครั้ง", "ลบชื่อนี้ออก" (แบบ Wheel of Names), และ "ปิด"
// ----------------------------------------------------------------------------

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function WinnerModal({
  isOpen,
  winner,
  multiResults = [],
  onClose,
  onSpinAgain,
  onRemoveWinner,
}) {
  // ยิง Confetti พลุกระดาษเมื่อเปิดโมดัล
  useEffect(() => {
    if (isOpen) {
      // ยิงพลุ 2 จังหวะซ้าย-ขวาแบบอลังการ
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 10000,
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen]);

  // ปิดเมื่อกดปุ่ม Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || (!winner && (!multiResults || multiResults.length === 0))) {
    return null;
  }

  const isMulti = multiResults && multiResults.length > 1;

  return (
    <div className="winner-modal-backdrop" onClick={onClose}>
      <div
        className="winner-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* ปุ่มปิดมุมบนขวา */}
        <button
          type="button"
          className="modal-close-icon-btn"
          onClick={onClose}
          aria-label="ปิด"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* ไอคอนถ้วยรางวัลยอดเยี่ยม */}
        <div className="trophy-badge">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
            <path d="M6 4h12v5a6 6 0 0 1-12 0V4Z"></path>
          </svg>
        </div>

        <div className="winner-header">
          <span className="celebrate-subtitle">
            {isMulti ? `ผลการสุ่มแบบชุด (${multiResults.length} ครั้ง)` : 'ยินดีด้วยกับผู้ชนะ!'}
          </span>
        </div>

        {/* แสดงผลผู้ชนะ */}
        {!isMulti ? (
          <div className="single-winner-box">
            <div
              className="winner-title-text"
              style={{ color: winner?.color || '#2563EB' }}
            >
              {winner?.label || 'ไม่มีชื่อ'}
            </div>
          </div>
        ) : (
          <div className="multi-winners-list">
            {multiResults.map((item, index) => (
              <div key={index} className="multi-winner-row">
                <span className="rank-badge">#{index + 1}</span>
                <span className="rank-name">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* ปุ่มควบคุม */}
        <div className="winner-modal-actions">
          {onRemoveWinner && !isMulti && (
            <button
              type="button"
              className="btn-action-remove"
              onClick={() => {
                onRemoveWinner(winner?.label);
                onClose();
              }}
              title="ลบชื่อนี้ออกจากวงล้อเพื่อไม่ให้สุ่มซ้ำ"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              <span>ลบชื่อนี้ออก</span>
            </button>
          )}

          {onSpinAgain && (
            <button
              type="button"
              className="btn-action-spin-again"
              onClick={() => {
                onClose();
                setTimeout(() => onSpinAgain(), 100);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>หมุนอีกครั้ง</span>
            </button>
          )}

          <button
            type="button"
            className="btn-action-close"
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>

      <style>{`
        .winner-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: winnerBackdrop 0.25s ease-out;
          padding: 1rem;
        }
        @keyframes winnerBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .winner-modal-card {
          position: relative;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          padding: 2.25rem 2rem;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
          text-align: center;
          animation: winnerCardPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @keyframes winnerCardPop {
          from { transform: scale(0.85) translateY(16px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .modal-close-icon-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #64748B;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .modal-close-icon-btn:hover {
          background: #F1F5F9;
          color: #0F172A;
          border-color: #CBD5E1;
        }
        .trophy-badge {
          width: 68px;
          height: 68px;
          background: #EFF6FF;
          border: 2px solid #DBEAFE;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.2);
          animation: trophyFloat 2.5s ease-in-out infinite;
        }
        @keyframes trophyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .celebrate-subtitle {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .single-winner-box {
          margin: 1.25rem 0 1.75rem 0;
          width: 100%;
          padding: 1.25rem 1rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
        }
        .winner-title-text {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          word-break: break-word;
          animation: winnerPulse 1.5s ease infinite alternate;
        }
        @keyframes winnerPulse {
          from { transform: scale(1); }
          to { transform: scale(1.02); }
        }
        .multi-winners-list {
          margin: 1.25rem 0 1.75rem 0;
          width: 100%;
          max-height: 220px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.25rem;
        }
        .multi-winner-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 0.65rem 1rem;
          border-radius: 12px;
          transition: background 0.15s ease;
        }
        .multi-winner-row:hover {
          background: #F1F5F9;
        }
        .rank-badge {
          background: #2563EB;
          color: #FFFFFF;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }
        .rank-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
        }
        .winner-modal-actions {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          gap: 0.65rem;
          justify-content: center;
        }
        .btn-action-spin-again {
          flex: 1;
          min-width: 140px;
          background: #2563EB;
          color: #FFFFFF;
          border: none;
          padding: 0.75rem 1.2rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px -2px rgba(37, 99, 235, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          transition: all 0.15s ease;
        }
        .btn-action-spin-again:hover {
          background: #1D4ED8;
          transform: translateY(-1px);
        }
        .btn-action-remove {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.15s ease;
        }
        .btn-action-remove:hover {
          background: #FEE2E2;
          border-color: #F87171;
        }
        .btn-action-close {
          background: #F8FAFC;
          color: #475569;
          border: 1px solid #CBD5E1;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-action-close:hover {
          background: #F1F5F9;
          color: #0F172A;
          border-color: #94A3B8;
        }
      `}</style>
    </div>
  );
}
