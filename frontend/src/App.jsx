// App.jsx
// จุดประกอบหลักของแอป: วาง Navbar ไว้ด้านบน แล้วตามด้วยหน้าหลัก (HomePage)

import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <>
      <Navbar />
      <HomePage />
    </>
  );
}
