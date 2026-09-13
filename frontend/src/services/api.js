// api.js
// ----------------------------------------------------------------------------
// รวมฟังก์ชันเรียก backend API ทั้งหมดไว้ที่เดียว
// ทำให้ component ต่างๆ ไม่ต้องรู้รายละเอียดของ URL หรือ fetch โดยตรง
// BASE_URL อ่านจาก environment variable ที่ Vite inject ให้ตอน build
// (ตั้งค่าผ่าน VITE_API_URL ใน docker-compose.yml หรือ .env)
// ----------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * handleResponse
 * ฟังก์ชันกลางสำหรับแปลง response เป็น JSON และโยน error ถ้า request ไม่สำเร็จ
 */
async function handleResponse(response) {
  const body = await response.json();
  if (!response.ok || body.success === false) {
    throw new Error(body.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
  }
  return body.data;
}

/** ดึงรายการรางวัลทั้งหมดที่ใช้งานอยู่ (สำหรับแสดงบนวงล้อ) */
export async function fetchPrizes() {
  const res = await fetch(`${BASE_URL}/prizes`);
  return handleResponse(res);
}

/** เพิ่มรางวัลใหม่ */
export async function createPrize(prize) {
  const res = await fetch(`${BASE_URL}/prizes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prize),
  });
  return handleResponse(res);
}

/** บันทึกแทนที่รายการรางวัลทั้งหมด (Bulk Replace จาก Entries) */
export async function bulkReplacePrizes(items) {
  const res = await fetch(`${BASE_URL}/prizes/bulk`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return handleResponse(res);
}

/** แก้ไขรางวัลตาม id */
export async function updatePrize(id, updates) {
  const res = await fetch(`${BASE_URL}/prizes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

/** ลบรางวัลตาม id */
export async function deletePrize(id) {
  const res = await fetch(`${BASE_URL}/prizes/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

/** ขอให้ backend สุ่มผล 1 ครั้ง — คืนค่ารางวัลที่ชนะ + ตำแหน่งช่องบนวงล้อ */
export async function spinWheel(playerName) {
  const res = await fetch(`${BASE_URL}/wheel/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName }),
  });
  return handleResponse(res);
}

/** ดึงประวัติการหมุนล่าสุด */
export async function fetchSpinHistory(limit = 20) {
  const res = await fetch(`${BASE_URL}/wheel/history?limit=${limit}`);
  return handleResponse(res);
}

/** ล้างประวัติการหมุนทั้งหมด */
export async function clearSpinHistory() {
  const res = await fetch(`${BASE_URL}/wheel/history`, { method: 'DELETE' });
  return handleResponse(res);
}

/** บันทึกการเข้าใช้งานระบบ และคืนค่าจำนวนการเข้าใช้งานทั้งหมด */
export async function recordVisit(path = '/') {
  const res = await fetch(`${BASE_URL}/visits?path=${encodeURIComponent(path)}`, {
    method: 'POST',
  });
  return handleResponse(res);
}

/** ดึงสถิติจำนวนการเข้าใช้งานทั้งหมด */
export async function fetchVisitStats() {
  const res = await fetch(`${BASE_URL}/visits`);
  return handleResponse(res);
}

