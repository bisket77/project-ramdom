// Navbar.jsx
// ----------------------------------------------------------------------------
// แถบด้านบนของแอป ดีไซน์สไตล์ General Clinic ขาว สะอาดตา
// พร้อมไอคอนวงล้อหลากสีสัน (Wheel Icon) ตามแบบ wheelofnames
// และแสดงสถิติจำนวนครั้งการเข้าใช้งานระบบ:
// - นับยอดประจำวัน (รีเซ็ตทุกวันเวลาเที่ยงคืน)
// - บันทึกและสะสมประวัติลง Database ทุกวัน
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import * as api from '../../services/api';

export default function Navbar() {
  const [stats, setStats] = useState({ todayVisits: null, totalVisits: null });

  // บันทึกและดึงจำนวนการเข้าใช้งานเมื่อหน้าเว็บโหลด
  useEffect(() => {
    async function trackVisit() {
      try {
        const hasTracked = sessionStorage.getItem('app_visited');
        if (!hasTracked) {
          const res = await api.recordVisit(window.location.pathname);
          if (res) {
            setStats({
              todayVisits: res.todayVisits || 1,
              totalVisits: res.totalVisits || 1,
            });
          }
          sessionStorage.setItem('app_visited', 'true');
        } else {
          const res = await api.fetchVisitStats();
          if (res) {
            setStats({
              todayVisits: res.todayVisits || 0,
              totalVisits: res.totalVisits || 0,
            });
          }
        }
      } catch (err) {
        console.warn('Track visit error:', err.message);
      }
    }
    trackVisit();
  }, []);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-brand">
          <div className="logo-icon">
            <svg
              width="26"
              height="26"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 6 ชิ้นพายสีสันสดใสแบบ Wheel of Names */}
              <path d="M18 18L18 2A16 16 0 0 1 31.85 10L18 18Z" fill="#2563EB" />
              <path d="M18 18L31.85 10A16 16 0 0 1 31.85 26L18 18Z" fill="#10B981" />
              <path d="M18 18L31.85 26A16 16 0 0 1 18 34L18 18Z" fill="#F59E0B" />
              <path d="M18 18L18 34A16 16 0 0 1 4.15 26L18 18Z" fill="#EF4444" />
              <path d="M18 18L4.15 26A16 16 0 0 1 4.15 10L18 18Z" fill="#8B5CF6" />
              <path d="M18 18L4.15 10A16 16 0 0 1 18 2L18 18Z" fill="#06B6D4" />
              <circle cx="18" cy="18" r="6.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="navbar-logo">Lucky Spin</span>
            <span className="navbar-tag">ระบบสุ่มรางวัล & วงล้อเสี่ยงโชค</span>
          </div>
        </div>

        <div className="navbar-right">
          {/* ป้ายแสดงสถิติ: รีเซ็ตนับใหม่ทุกวัน + ยอดสะสมรวมใน Database */}
          {stats.todayVisits !== null && (
            <div
              className="navbar-visits"
              title={`สถิติการเข้าใช้งานระบบ\n• วันนี้: ${stats.todayVisits.toLocaleString()} ครั้ง (รีเซ็ตทุก 24 ชม.)\n• รวมทั้งหมด: ${stats.totalVisits.toLocaleString()} ครั้ง (บันทึกลง Database)`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span className="visits-text">
                วันนี้ <strong>{stats.todayVisits.toLocaleString()}</strong> ครั้ง
                <span className="visits-divider">|</span>
                ทั้งหมด <strong>{stats.totalVisits.toLocaleString()}</strong>
              </span>
            </div>
          )}

          <div className="navbar-status">
            <span className="status-indicator"></span>
            <span className="status-text">พร้อมใช้งาน</span>
          </div>
        </div>
      </div>

      <style>{`
        .navbar {
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-border);
          padding: 0.85rem 0;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .navbar-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-icon {
          width: 38px;
          height: 38px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .navbar-logo {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.22rem;
          color: var(--color-text);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .navbar-tag {
          color: var(--color-text-dim);
          font-size: 0.78rem;
          font-weight: 500;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .navbar-visits {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #EFF6FF;
          border: 1px solid #DBEAFE;
          padding: 0.28rem 0.85rem;
          border-radius: 999px;
          animation: badgeFadeIn 0.3s ease;
          cursor: help;
        }
        @keyframes badgeFadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .visits-text {
          font-size: 0.8rem;
          color: #1E40AF;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .visits-text strong {
          color: #1D4ED8;
          font-weight: 800;
        }
        .visits-divider {
          color: #93C5FD;
          margin: 0 0.15rem;
        }
        .navbar-status {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #F0FDF4;
          border: 1px solid #DCFCE7;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
        }
        .status-indicator {
          width: 7px;
          height: 7px;
          background: #16A34A;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
        }
        .status-text {
          font-size: 0.78rem;
          font-weight: 600;
          color: #15803D;
        }
        @media (max-width: 640px) {
          .navbar-tag {
            display: none;
          }
          .visits-text {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </header>
  );
}
