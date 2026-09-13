// HomePage.jsx
// ----------------------------------------------------------------------------
// หน้าหลักของแอป: วงล้อสุ่ม พร้อมปุ่ม SPIN ตรงกลาง
// และแผงด้านข้างแยกแท็บสไตล์ Wheel of Names & General Clinic
// - แสดงโมดัลเฉลิมฉลองผลรางวัลสุดโมเดิร์น (WinnerModal + Confetti)
// - โมดัลยืนยันล้างข้อมูลสุดคมชัดแทนที่ window.confirm (ConfirmModal)
// ----------------------------------------------------------------------------

import { useEffect, useState, useCallback, useRef } from 'react';
import { useWheelSpin } from '../hooks/useWheelSpin';
import WheelCanvas from '../components/Wheel/WheelCanvas';
import EntriesPanel from '../components/PrizeList/EntriesPanel';
import WinnerModal from '../components/Modal/WinnerModal';
import ConfirmModal from '../components/Modal/ConfirmModal';
import * as api from '../services/api';

export default function HomePage() {
  const { prizes, setPrizes, rotation, isSpinning, result, setResult, error, loadPrizes, spin, spinDurationMs } =
    useWheelSpin();
  const [history, setHistory] = useState([]);
  const [playerName] = useState('');
  const [spinCount, setSpinCount] = useState(1);
  const [multiResults, setMultiResults] = useState([]);
  const [isMultiSpinning, setIsMultiSpinning] = useState(false);

  // ควบคุมการแสดงโมดัล
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  /** refreshHistory: ดึงประวัติล่าสุดจาก backend มาแสดงในแผงด้านข้าง */
  const refreshHistory = useCallback(async () => {
    try {
      const data = await api.fetchSpinHistory(50);
      setHistory(data || []);
    } catch (err) {
      console.error('Fetch history error:', err.message);
    }
  }, []);

  // โหลดข้อมูลรางวัลและประวัติครั้งแรกที่หน้าเว็บเปิดขึ้นมา
  useEffect(() => {
    loadPrizes();
    refreshHistory();
  }, [loadPrizes, refreshHistory]);

  // เมื่อหมุนเสร็จและได้ผลลัพธ์แล้ว ให้ดึงประวัติใหม่และเปิด WinnerModal ทันที
  useEffect(() => {
    if (result) {
      refreshHistory();
      setIsWinnerModalOpen(true);
    }
  }, [result, refreshHistory]);

  /** handleSaveEntries: บันทึกรายการใหม่แบบ bulk replace เข้า backend */
  async function handleSaveEntries(items) {
    await api.bulkReplacePrizes(items);
    await loadPrizes();
  }

  /** handleRequestClearHistory: เปิดโมดัลยืนยันล้างข้อมูลแบบทันสมัย */
  function handleRequestClearHistory() {
    setIsConfirmClearOpen(true);
  }

  /** handleConfirmedClearHistory: ดำเนินการล้างประวัติจริงหลังกดยืนยันในโมดัล */
  async function handleConfirmedClearHistory() {
    setIsConfirmClearOpen(false);
    try {
      await api.clearSpinHistory();
    } catch (err) {
      console.error('Clear history error:', err);
    } finally {
      setHistory([]);
      setMultiResults([]);
      setResult(null);
    }
  }

  /** handleRemoveWinner: ลบชื่อผู้ชนะออกจากวงล้อ */
  async function handleRemoveWinner(winnerLabel) {
    if (!winnerLabel) return;
    const updated = prizes.filter((p) => p.label !== winnerLabel);
    setPrizes(updated);
    try {
      await api.bulkReplacePrizes(updated.map((p) => ({ label: p.label })));
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * handleStartSpin:
   * เริ่มการสุ่มตามจำนวนครั้ง
   */
  async function handleStartSpin() {
    if (isSpinning || isMultiSpinning || prizes.length === 0) return;

    setIsWinnerModalOpen(false);

    if (spinCount <= 1) {
      setMultiResults([]);
      await spin(playerName);
    } else {
      setIsMultiSpinning(true);
      setMultiResults([]);

      try {
        const spinPromise = spin(playerName);

        const additionalPromises = [];
        for (let i = 1; i < spinCount; i++) {
          additionalPromises.push(api.spinWheel(playerName));
        }

        const additionalResults = await Promise.all(additionalPromises);
        await spinPromise;

        const allRes = [
          result?.label,
          ...additionalResults.map((r) => r.prize.label),
        ].filter(Boolean);

        setMultiResults(allRes);
        await refreshHistory();
        setIsWinnerModalOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsMultiSpinning(false);
      }
    }
  }

  // Ref สำหรับ handleStartSpin ป้องกัน stale closure ใน keydown event listener
  const handleStartSpinRef = useRef(handleStartSpin);
  handleStartSpinRef.current = handleStartSpin;

  /**
   * คีย์ลัด Space:
   * เมื่อไม่ได้พิมพ์อยู่ใน input หรือ textarea การกด Space จะกดสุ่มวงล้อทันที
   */
  useEffect(() => {
    function handleKeyDown(e) {
      const tagName = e.target.tagName?.toLowerCase();
      const isEditable = e.target.isContentEditable || tagName === 'input' || tagName === 'textarea';

      if (e.code === 'Space' && !isEditable && !isWinnerModalOpen && !isConfirmClearOpen) {
        e.preventDefault();
        handleStartSpinRef.current();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWinnerModalOpen, isConfirmClearOpen]);

  return (
    <main className="container home-layout">
      {/* ฝั่งซ้าย: วงล้อสุ่ม และผลลัพธ์ */}
      <section className="wheel-section">
        <div className="wheel-header">
          <h1 className="wheel-title">วงล้อสุ่มผลลัพธ์</h1>
          <p className="wheel-subtitle">
            คลิกที่วงล้อ หรือกด <kbd className="space-badge">Space</kbd> เพื่อเริ่มสุ่ม
          </p>
        </div>

        <WheelCanvas
          prizes={prizes}
          rotation={rotation}
          isSpinning={isSpinning || isMultiSpinning}
          spinDurationMs={spinDurationMs}
          onSpin={handleStartSpin}
        />

        {/* การ์ดแสดงผลรางวัลล่าสุดใต้ล้อแบบโมเดิร์น */}
        {result && (
          <div className="modern-result-card" onClick={() => setIsWinnerModalOpen(true)}>
            <div className="result-card-inner">
              <div className="result-trophy-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                  <path d="M6 4h12v5a6 6 0 0 1-12 0V4Z"></path>
                </svg>
              </div>
              <div className="result-text-col">
                <span className="result-label-mini">ผู้ชนะล่าสุด</span>
                <span className="result-winner-name" style={{ color: result.color || '#2563EB' }}>
                  {result.label}
                </span>
              </div>
            </div>
            <button type="button" className="view-detail-link" title="เปิดดูผลการสุ่มแบบเต็ม">
              ดูผลลัพธ์ →
            </button>
          </div>
        )}

        {multiResults && multiResults.length > 0 && (
          <div className="modern-multi-results-card">
            <div className="multi-header-row">
              <span className="multi-title-label">ผลการสุ่มแบบชุด ({multiResults.length} ครั้ง):</span>
              <button
                type="button"
                className="multi-view-btn"
                onClick={() => setIsWinnerModalOpen(true)}
              >
                ดูรายละเอียดแบบเต็ม
              </button>
            </div>
            <div className="multi-chips-grid">
              {multiResults.map((res, i) => (
                <div key={i} className="multi-winner-chip">
                  <span className="chip-rank">#{i + 1}</span>
                  <span className="chip-name">{res}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error-banner">{error}</p>}
      </section>

      {/* ฝั่งขวา: แผงควบคุมสไตล์ Wheel of Names (แท็บ วงล้อ 1 และ ผลลัพธ์) */}
      <aside className="side-panel">
        <EntriesPanel
          prizes={prizes}
          onImmediateUpdate={setPrizes}
          onSaveEntries={handleSaveEntries}
          history={history}
          onClearHistory={handleRequestClearHistory}
          spinCount={spinCount}
          setSpinCount={setSpinCount}
          onSpin={handleStartSpin}
          isSpinning={isSpinning || isMultiSpinning}
        />
      </aside>

      {/* โมดัลเฉลิมฉลองผลรางวัลสุดโมเดิร์น (Winner Celebration Modal) */}
      <WinnerModal
        isOpen={isWinnerModalOpen}
        winner={result}
        multiResults={multiResults}
        onClose={() => setIsWinnerModalOpen(false)}
        onSpinAgain={handleStartSpin}
        onRemoveWinner={handleRemoveWinner}
      />

      {/* โมดัลยืนยันการล้างประวัติ (Modern Confirm Modal) */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="ยืนยันการล้างประวัติผลการสุ่ม"
        message="คุณต้องการล้างประวัติผลการสุ่มทั้งหมดใช่หรือไม่? ข้อมูลประวัติในระบบจะถูกลบออกอย่างถาวรและไม่สามารถกู้คืนได้"
        confirmText="ล้างข้อมูลทั้งหมด"
        cancelText="ยกเลิก"
        confirmType="danger"
        onConfirm={handleConfirmedClearHistory}
        onCancel={() => setIsConfirmClearOpen(false)}
      />

      <style>{`
        .home-layout {
          display: grid;
          grid-template-columns: 1fr 410px;
          gap: 2rem;
          padding-top: 2rem;
          padding-bottom: 3rem;
          align-items: start;
        }
        .wheel-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          background: #FFFFFF;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.75rem 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .wheel-header {
          text-align: center;
        }
        .wheel-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 0.35rem;
          letter-spacing: -0.01em;
        }
        .wheel-subtitle {
          font-size: 0.88rem;
          color: var(--color-text-dim);
          margin: 0;
          line-height: 1.5;
        }
        .space-badge {
          background: #F1F5F9;
          color: #475569;
          border: 1px solid #CBD5E1;
          padding: 0.12rem 0.45rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-family: inherit;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        /* Modern Result Card Under Wheel */
        .modern-result-card {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%);
          border: 1.5px solid #BFDBFE;
          border-radius: 14px;
          padding: 0.85rem 1.2rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.1);
        }
        .modern-result-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px -2px rgba(37, 99, 235, 0.18);
          border-color: #93C5FD;
        }
        .result-card-inner {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .result-trophy-icon {
          width: 42px;
          height: 42px;
          background: #FFFFFF;
          border: 1px solid #DBEAFE;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
        }
        .result-text-col {
          display: flex;
          flex-direction: column;
        }
        .result-label-mini {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .result-winner-name {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .view-detail-link {
          background: transparent;
          border: none;
          color: #2563EB;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
        }
        .view-detail-link:hover {
          background: #DBEAFE;
        }

        /* Modern Multi Results Card */
        .modern-multi-results-card {
          width: 100%;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 1rem;
        }
        .multi-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.65rem;
        }
        .multi-title-label {
          font-size: 0.84rem;
          font-weight: 700;
          color: #334155;
        }
        .multi-view-btn {
          background: transparent;
          border: none;
          color: #2563EB;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }
        .multi-view-btn:hover {
          text-decoration: underline;
        }
        .multi-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .multi-winner-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          padding: 0.35rem 0.7rem;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .chip-rank {
          background: #EFF6FF;
          color: #2563EB;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }
        .chip-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: #0F172A;
        }

        .error-banner {
          color: var(--color-danger);
          font-size: 0.85rem;
          margin: 0;
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
        }
        .side-panel {
          width: 100%;
        }
        @media (max-width: 1080px) {
          .home-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
