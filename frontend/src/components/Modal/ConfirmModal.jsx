// ConfirmModal.jsx
// ----------------------------------------------------------------------------
// โมดัลยืนยันการทำรายการแบบ Modern UI (แทนที่ window.confirm เดิมที่ดูล้าสมัย)
// ดีไซน์สไตล์คลินิก สะอาดตา คมชัด พร้อมไอคอนเตือนภัยและปุ่มแอกชันที่สวยงาม
// ----------------------------------------------------------------------------

import { useEffect } from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'ยืนยันการทำรายการ',
  message = 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  confirmType = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel,
}) {
  // รองรับการกดปุ่ม Escape เพื่อปิดโมดัล
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* ไอคอนเตือนภัย */}
        <div className={`modal-icon-wrapper ${confirmType}`}>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {confirmType === 'danger' ? (
              <>
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </>
            )}
          </svg>
        </div>

        {/* ข้อความยืนยัน */}
        <div className="modal-content">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-message">{message}</p>
        </div>

        {/* ปุ่มกดยืนยัน / ยกเลิก */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn-modal-confirm ${confirmType}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: backdropFade 0.2s ease-out;
          padding: 1rem;
        }
        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 1.75rem 1.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          text-align: center;
          animation: cardPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @keyframes cardPop {
          from { transform: scale(0.92) translateY(8px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .modal-icon-wrapper {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .modal-icon-wrapper.danger {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FEE2E2;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.12);
        }
        .modal-icon-wrapper.primary {
          background: #EFF6FF;
          color: #2563EB;
          border: 1px solid #DBEAFE;
        }
        .modal-content {
          margin-bottom: 1.5rem;
        }
        .modal-title {
          font-family: var(--font-display);
          font-size: 1.22rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.45rem 0;
          letter-spacing: -0.01em;
        }
        .modal-message {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
          line-height: 1.55;
        }
        .modal-actions {
          display: flex;
          width: 100%;
          gap: 0.75rem;
        }
        .btn-modal-cancel {
          flex: 1;
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          color: #475569;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-modal-cancel:hover {
          background: #F1F5F9;
          color: #0F172A;
          border-color: #94A3B8;
        }
        .btn-modal-confirm {
          flex: 1;
          border: none;
          color: #FFFFFF;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-modal-confirm.danger {
          background: #DC2626;
          box-shadow: 0 4px 14px -2px rgba(220, 38, 38, 0.4);
        }
        .btn-modal-confirm.danger:hover {
          background: #B91C1C;
          box-shadow: 0 6px 18px -2px rgba(220, 38, 38, 0.5);
          transform: translateY(-1px);
        }
        .btn-modal-confirm.primary {
          background: #2563EB;
          box-shadow: 0 4px 14px -2px rgba(37, 99, 235, 0.4);
        }
        .btn-modal-confirm.primary:hover {
          background: #1D4ED8;
        }
      `}</style>
    </div>
  );
}
