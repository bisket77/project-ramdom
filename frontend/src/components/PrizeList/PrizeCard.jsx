// PrizeCard.jsx
// ----------------------------------------------------------------------------
// แสดงข้อมูลรางวัล 1 รายการในแผงจัดการ พร้อมปุ่มลบ
// ----------------------------------------------------------------------------

export default function PrizeCard({ prize, onDelete }) {
  return (
    <div className="prize-card">
      <span className="prize-swatch" style={{ background: prize.color }} />
      <div className="prize-info">
        <p className="prize-label">{prize.label}</p>
        <p className="prize-meta">น้ำหนักโอกาส: {prize.weight}</p>
      </div>
      <button
        className="btn btn-ghost prize-delete"
        onClick={() => onDelete(prize.id)}
        aria-label={`ลบรางวัล ${prize.label}`}
      >
        ลบ
      </button>

      <style>{`
        .prize-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          border-radius: 12px;
          background: var(--color-surface-raised);
        }
        .prize-swatch {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .prize-info { flex: 1; min-width: 0; }
        .prize-label {
          margin: 0;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .prize-meta {
          margin: 0;
          font-size: 0.8rem;
          color: var(--color-text-dim);
        }
        .prize-delete {
          padding: 0.35rem 0.75rem;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
