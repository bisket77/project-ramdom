// EntriesPanel.jsx
// ----------------------------------------------------------------------------
// แผงกรอกข้อมูลสุ่มและแสดงผลลัพธ์ ดีไซน์สไตล์ Wheel of Names (Tabbed Layout)
// ใช้ SVG Icons ทั้งหมดแทนการใช้อิโมจิ เพื่อความคมชัด เป็นมืออาชีพ สไตล์ General Clinic
// ----------------------------------------------------------------------------

import { useState, useEffect, useRef } from 'react';
import ConfirmModal from '../Modal/ConfirmModal';

const PRESET_PALETTE = [
  '#2563EB', // Royal Blue
  '#0D9488', // Teal
  '#F59E0B', // Amber
  '#7C3AED', // Violet
  '#E11D48', // Rose
  '#059669', // Emerald
  '#EA580C', // Orange
  '#4F46E5', // Indigo
  '#0284C7', // Sky Blue
  '#DB2777', // Pink
];

export default function EntriesPanel({
  prizes,
  onImmediateUpdate,
  onSaveEntries,
  history,
  onClearHistory,
  spinCount,
  setSpinCount,
  onSpin,
  isSpinning,
}) {
  const [activeTab, setActiveTab] = useState('entries'); // 'entries' | 'results'
  const [text, setText] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const isFirstLoad = useRef(true);
  const debounceTimer = useRef(null);

  // โหลดรายการเริ่มต้นจาก prizes
  useEffect(() => {
    if (isFirstLoad.current && prizes && prizes.length > 0) {
      const labels = prizes.map((p) => p.label).join('\n');
      setText(labels);
      isFirstLoad.current = false;
    }
  }, [prizes]);

  // แยกรายการตามบรรทัด
  const entryLines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  /**
   * handleTextChange:
   * อัปเดตชื่อในวงล้อทันทีแบบ Real-time และ Debounce บันทึกลง Backend
   */
  function handleTextChange(newText) {
    setText(newText);

    const lines = newText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      const tempPrizes = lines.map((label, idx) => ({
        id: `temp-${idx}`,
        label,
        color: PRESET_PALETTE[idx % PRESET_PALETTE.length],
        weight: 1,
        sortOrder: idx,
        isActive: true,
      }));
      onImmediateUpdate(tempPrizes);
    }

    setSaveStatus('saving');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (lines.length > 0) {
        try {
          const items = lines.map((label) => ({ label }));
          await onSaveEntries(items);
          setSaveStatus('saved');
        } catch (err) {
          console.error('Auto-save error:', err);
          setSaveStatus('error');
        }
      }
    }, 400);
  }

  /** สลับลำดับสุ่ม (Shuffle) */
  function handleShuffle() {
    const shuffled = [...entryLines].sort(() => Math.random() - 0.5);
    const newText = shuffled.join('\n');
    handleTextChange(newText);
  }

  /** เรียงลำดับ ก-ฮ / A-Z (Sort) */
  function handleSort() {
    const sorted = [...entryLines].sort((a, b) => a.localeCompare(b, 'th'));
    const newText = sorted.join('\n');
    handleTextChange(newText);
  }
//ข้อมูลตัวอย่าง
  /** โหลดเทมเพลตตัวอย่าง */
  function handleLoadTemplate(type) {
    let items = [];
    if (type === 'names') {
      items = ['Ali', 'Beatriz', 'Charles', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'Hanna',];
    } else if (type === 'pets_tasks') {
      items = ['การบ้าน', 'แมว', 'หมา', 'อ่านหนังสือ', 'ล้างจาน'];
    }
    const newText = items.join('\n');
    handleTextChange(newText);
  }

  const [isConfirmClearEntriesOpen, setIsConfirmClearEntriesOpen] = useState(false);

  /** ล้างรายการทั้งหมดใน Textarea */
  function handleClearEntries() {
    setIsConfirmClearEntriesOpen(true);
  }

  function handleConfirmedClearEntries() {
    setIsConfirmClearEntriesOpen(false);
    handleTextChange('');
  }

  return (
    <div className="wheelofnames-panel card">
      {/* 1. แท็บด้านบน: วงล้อ 1 (รายการ) และ ผลลัพธ์ (พร้อม Badge นับจำนวน) */}
      <div className="tab-navigation">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          <span>วงล้อ 1</span>
          <span className="tab-badge">{entryLines.length}</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <span>ผลลัพธ์</span>
          <span className="tab-badge results-badge">{history?.length || 0}</span>
        </button>
      </div>

      {/* 2. เนื้อหาตามแท็บที่เลือก */}
      {activeTab === 'entries' ? (
        <div className="tab-content entries-content">
          {/* Action Toolbar (สลับลำดับ, เรียงลำดับ, เพิ่มตัวอย่าง) — ใช้ SVG แทนอิโมจิ */}
          <div className="toolbar-row">
            <button
              type="button"
              className="action-btn"
              onClick={handleShuffle}
              title="สลับตำแหน่งรายการแบบสุ่ม"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
              <span>สลับลำดับ</span>
            </button>

            <button
              type="button"
              className="action-btn"
              onClick={handleSort}
              title="เรียงตามตัวอักษร ก-ฮ / A-Z"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 16 4 4 4-4"></path>
                <path d="M7 20V4"></path>
                <path d="m21 8-4-4-4 4"></path>
                <path d="M17 4v16"></path>
              </svg>
              <span>เรียงลำดับ</span>
            </button>

            <button
              type="button"
              className="action-btn secondary"
              onClick={() => handleLoadTemplate('names')}
              title="โหลดชื่อตัวอย่าง Ali, Beatriz, Charles..."
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <path d="M9 14l2 2 4-4"></path>
              </svg>
              <span>ชื่อตัวอย่าง</span>
            </button>
          </div>

          {/* ช่อง Textarea ป้อนข้อมูลรายชื่อ */}
          <div className="textarea-container">
            <textarea
              className="wheel-textarea"
              placeholder={`พิมพ์ชื่อหรือรายการแยกแต่ละบรรทัด เช่น:\nAli\nBeatriz\nCharles\nDiya\nEric\nFatima\nGabriel\nHanna`}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={12}
              spellCheck={false}
            />
            <div className="sync-status">
              {saveStatus === 'saving' ? (
                <span className="status-saving">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="spinning-svg">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : (
                <span className="status-saved">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  ซิงค์อัตโนมัติ
                </span>
              )}
            </div>
          </div>

          {/* การควบคุมการสุ่มด้านล่าง */}
          <div className="panel-bottom-controls">
            <div className="spin-options-bar">
              <div className="spin-count-info">
                <span>จำนวนการสุ่ม:</span>
              </div>
              <div className="spin-counter">
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => setSpinCount((c) => Math.max(1, c - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={spinCount}
                  onChange={(e) =>
                    setSpinCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
                  }
                  className="counter-input"
                />
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => setSpinCount((c) => Math.min(50, c + 1))}
                >
                  +
                </button>
                <button
                  type="button"
                  className="reset-mini-btn"
                  onClick={() => setSpinCount(1)}
                  title="รีเซ็ตเป็น 1 ครั้ง"
                >
                  รีเซ็ต
                </button>
              </div>
            </div>

            <div className="bottom-action-buttons">
              {onSpin && (
                <button
                  type="button"
                  className="primary-spin-action-btn"
                  onClick={onSpin}
                  disabled={isSpinning || entryLines.length === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
                  </svg>
                  <span>{isSpinning ? 'กำลังหมุน...' : `หมุนวงล้อ (${spinCount} ครั้ง)`}</span>
                </button>
              )}

              <button
                type="button"
                className="clear-all-entries-btn"
                onClick={handleClearEntries}
                title="ล้างรายชื่อทั้งหมดในช่องนี้"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                <span>ล้างรายชื่อ</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results Tab: ผลลัพธ์และประวัติการสุ่ม */
        <div className="tab-content results-content">
          <div className="results-header-bar">
            <div className="results-title-group">
              <span className="results-title">ประวัติการสุ่ม</span>
              <span className="results-count-pill">{history?.length || 0} รายการ</span>
            </div>

            {history && history.length > 0 && (
              <button
                type="button"
                className="clear-history-action-btn"
                onClick={onClearHistory}
                title="ล้างประวัติผลการสุ่มทั้งหมดทันที"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>ล้างข้อมูล</span>
              </button>
            )}
          </div>

          <div className="results-body">
            {history && history.length > 0 ? (
              <div className="results-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th style={{ width: '55px' }}>ลำดับ</th>
                      <th>ผลลัพธ์</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>เวลา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={h.id || i}>
                        <td className="col-idx">#{i + 1}</td>
                        <td className="col-result">
                          <span
                            className="result-badge"
                            style={{
                              backgroundColor: `${h.Prize?.color || '#2563EB'}14`,
                              color: h.Prize?.color || '#2563EB',
                              borderColor: `${h.Prize?.color || '#2563EB'}40`,
                            }}
                          >
                            {h.prizeLabelSnapshot}
                          </span>
                        </td>
                        <td className="col-time">
                          {new Date(h.createdAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="results-empty">
                <div className="empty-icon">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <div className="empty-title">ยังไม่มีประวัติการสุ่ม</div>
                <p className="empty-text">
                  หมุนวงล้อเพื่อดูผลลัพธ์การสุ่มที่บันทึกไว้ที่นี่
                </p>
                <button
                  type="button"
                  className="switch-back-btn"
                  onClick={() => setActiveTab('entries')}
                >
                  ← กลับไปยังช่องกรอกข้อมูล
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* โมดัลยืนยันการล้างรายชื่อ */}
      <ConfirmModal
        isOpen={isConfirmClearEntriesOpen}
        title="ยืนยันการล้างรายชื่อ"
        message="คุณต้องการล้างรายชื่อทั้งหมดในช่องนี้ใช่หรือไม่? หลังจากล้างข้อมูลวงล้อจะว่างเปล่า"
        confirmText="ล้างรายชื่อ"
        cancelText="ยกเลิก"
        confirmType="danger"
        onConfirm={handleConfirmedClearEntries}
        onCancel={() => setIsConfirmClearEntriesOpen(false)}
      />

      <style>{`
        .wheelofnames-panel {
          padding: 0;
          background: #FFFFFF;
          border: 1px solid var(--color-border);
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 520px;
        }

        /* 1. แท็บสไตล์ Wheel of Names */
        .tab-navigation {
          display: flex;
          background: #F8FAFC;
          border-bottom: 1px solid var(--color-border);
          padding: 0.35rem 0.5rem 0 0.5rem;
          gap: 0.25rem;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.1rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #64748B;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.92rem;
          cursor: pointer;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          transition: all 0.15s ease;
        }
        .tab-btn:hover {
          color: #1E293B;
          background: #F1F5F9;
        }
        .tab-btn.active {
          background: #FFFFFF;
          color: #2563EB;
          border-bottom: 2px solid #2563EB;
          box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.03);
        }
        .tab-badge {
          background: #E2E8F0;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
        }
        .tab-btn.active .tab-badge {
          background: #EFF6FF;
          color: #2563EB;
        }
        .results-badge {
          background: #EFF6FF;
          color: #2563EB;
        }

        /* 2. เนื้อหาในแต่ละแท็บ */
        .tab-content {
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 0.85rem;
        }

        /* Toolbar Row (สลับลำดับ, เรียงลำดับ, ตัวอย่าง) */
        .toolbar-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          align-items: center;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #2563EB;
          color: #FFFFFF;
          border: none;
          border-radius: 7px;
          padding: 0.45rem 0.8rem;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
        }
        .action-btn:hover {
          background: #1D4ED8;
          transform: translateY(-1px);
        }
        .action-btn.secondary {
          background: #F1F5F9;
          color: #334155;
          border: 1px solid #CBD5E1;
          box-shadow: none;
        }
        .action-btn.secondary:hover {
          background: #E2E8F0;
          color: #0F172A;
        }

        /* Textarea Container */
        .textarea-container {
          position: relative;
          flex: 1;
          display: flex;
        }
        .wheel-textarea {
          width: 100%;
          min-height: 240px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 0.85rem;
          font-family: inherit;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #0F172A;
          resize: vertical;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .wheel-textarea:focus {
          outline: none;
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .sync-status {
          position: absolute;
          bottom: 10px;
          right: 12px;
          font-size: 0.72rem;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid #E2E8F0;
          padding: 0.2rem 0.55rem;
          border-radius: 5px;
          pointer-events: none;
        }
        .status-saving {
          color: #D97706;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .status-saved {
          color: #15803D;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .spinning-svg {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* การควบคุมด้านล่าง */
        .panel-bottom-controls {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .spin-options-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 0.45rem 0.75rem;
        }
        .spin-count-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: #475569;
          font-weight: 500;
        }
        .space-key-chip {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #2563EB;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }
        .spin-counter {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .counter-btn {
          width: 26px;
          height: 26px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #1E293B;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .counter-btn:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }
        .counter-input {
          width: 44px;
          height: 26px;
          text-align: center;
          padding: 0.15rem;
          font-size: 0.85rem;
          font-weight: 700;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          color: #0F172A;
        }
        .reset-mini-btn {
          background: transparent;
          border: 1px solid #CBD5E1;
          color: #64748B;
          border-radius: 6px;
          padding: 0.2rem 0.45rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .reset-mini-btn:hover {
          background: #F1F5F9;
          color: #0F172A;
        }

        .bottom-action-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .primary-spin-action-btn {
          flex: 1;
          background: #2563EB;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          padding: 0.65rem 1rem;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .primary-spin-action-btn:hover:not(:disabled) {
          background: #1D4ED8;
          transform: translateY(-1px);
        }
        .primary-spin-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .clear-all-entries-btn {
          background: transparent;
          border: 1px solid #CBD5E1;
          color: #64748B;
          border-radius: 8px;
          padding: 0.65rem 0.85rem;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .clear-all-entries-btn:hover {
          background: #F8FAFC;
          color: #DC2626;
          border-color: #FECACA;
        }

        /* Results Tab Styling */
        .results-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid #F1F5F9;
        }
        .results-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .results-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
        }
        .results-count-pill {
          background: #EFF6FF;
          color: #2563EB;
          border: 1px solid #DBEAFE;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.1rem 0.5rem;
          border-radius: 999px;
        }
        .clear-history-action-btn {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          border-radius: 6px;
          padding: 0.35rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .clear-history-action-btn:hover {
          background: #FEE2E2;
          border-color: #F87171;
          color: #B91C1C;
        }
        .results-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .results-table-wrap {
          max-height: 420px;
          overflow-y: auto;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.86rem;
        }
        .history-table thead {
          position: sticky;
          top: 0;
          background: #F8FAFC;
          z-index: 2;
        }
        .history-table th {
          padding: 0.55rem 0.5rem;
          text-align: left;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 600;
          border-bottom: 1px solid #E2E8F0;
        }
        .history-table td {
          padding: 0.55rem 0.5rem;
          border-bottom: 1px solid #F1F5F9;
        }
        .history-table tbody tr:hover {
          background: #F8FAFC;
        }
        .col-idx {
          color: #94A3B8;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .col-time {
          font-size: 0.78rem;
          color: #94A3B8;
          text-align: right;
        }
        .result-badge {
          display: inline-block;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.82rem;
          border: 1px solid;
        }
        .results-empty {
          margin: auto;
          text-align: center;
          padding: 3rem 1.5rem;
        }
        .empty-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 0.65rem;
        }
        .empty-title {
          font-weight: 700;
          color: #334155;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .empty-text {
          font-size: 0.84rem;
          color: #64748B;
          margin: 0 0 1rem 0;
        }
        .switch-back-btn {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #2563EB;
          font-weight: 600;
          font-size: 0.82rem;
          padding: 0.4rem 0.85rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .switch-back-btn:hover {
          background: #DBEAFE;
        }
      `}</style>
    </div>
  );
}
