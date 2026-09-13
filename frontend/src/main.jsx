// main.jsx
// จุดเริ่มต้นของฝั่ง React: mount แอปเข้ากับ <div id="root"> ใน index.html

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
