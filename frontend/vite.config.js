// vite.config.js
// ตั้งค่า Vite build tool: ใช้ปลั๊กอิน React และเปิด server ให้ฟังทุก network interface
// (จำเป็นเวลารันใน Docker container เพื่อให้เข้าถึงจากภายนอก container ได้)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
