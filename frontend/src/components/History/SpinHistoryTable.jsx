// SpinHistoryTable.jsx
// ----------------------------------------------------------------------------
// แสดงตารางประวัติการหมุนล่าสุด (ใหม่สุดอยู่บนสุด)
// ----------------------------------------------------------------------------

export default function SpinHistoryTable({ history }) {
  if (history.length === 0) {
    return <p className="history-empty">ยังไม่มีประวัติการหมุน — ลองหมุนวงล้อดูสิ!</p>;
  }

  return (
    <ul className="history-list">
      {history.map((item) => (
        <li key={item.id} className="history-item">
          <span
            className="history-dot"
            style={{ background: item.Prize?.color || '#FF3D81' }}
          />
          <span className="history-label">{item.prizeLabelSnapshot}</span>
          <span className="history-time">
            {new Date(item.createdAt).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </li>
      ))}

      <style>{`
        .history-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 260px;
          overflow-y: auto;
        }
        .history-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.9rem;
        }
        .history-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .history-label { flex: 1; }
        .history-time { color: var(--color-text-dim); font-size: 0.8rem; }
        .history-empty { color: var(--color-text-dim); font-size: 0.9rem; }
      `}</style>
    </ul>
  );
}
