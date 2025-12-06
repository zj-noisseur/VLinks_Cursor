import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 引入所有页面
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Capsule from './pages/Capsule';
import Scan from './pages/Scan'; // 确保 Scan 页面已引入

// --- 内部组件：Splash Screen (极简文字版 - 无Logo) ---
const SplashScreen = () => {
  const [start, setStart] = useState(false);

  useEffect(() => {
    // 稍微延迟 100ms 启动动画，确保 DOM 已挂载
    const timer = setTimeout(() => setStart(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFBF7] overflow-hidden">
      
      {/* 1. 背景光效 (Cinematic Glow) */}
      <div className={`absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FFF8F0] to-[#FDFBF7] transition-opacity duration-1000 ${start ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* 中心光源 - 模拟日出或希望 */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px] transition-all duration-[2000ms] ease-out ${start ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />

      {/* 2. 核心动画容器 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pb-20">
          
          {/* 3. 品牌文字 (错落进场) */}
          <div className="text-center">
              <h1 
                className="font-serif text-5xl font-bold text-[#3D2E22] tracking-tight mb-4 overflow-hidden"
                style={{
                    opacity: start ? 1 : 0,
                    transform: start ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 1.2s ease-out 0.2s'
                }}
              >
                vlinks
              </h1>
              
              {/* Slogan with Lines */}
              <div 
                className="flex items-center justify-center gap-4"
                style={{
                    opacity: start ? 1 : 0,
                    transform: start ? 'scaleX(1)' : 'scaleX(0.8)',
                    transition: 'all 1.2s ease-out 0.6s'
                }}
              >
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400" />
                  <p className="text-[11px] text-[#8C7B68] uppercase tracking-[0.4em] font-medium whitespace-nowrap pl-1">
                    Beyond the Tombstone
                  </p>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400" />
              </div>
          </div>
      </div>
    </div>
  );
};

// --- 主程序 ---
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 3.5秒的展示时间
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // 如果正在加载，只显示 Splash Screen
  if (loading) {
    return <SplashScreen />;
  }

  // 加载完成后，显示路由
  return (
    <Router>
      <Routes>
        {/* 1. 公开区域 */}
        <Route path="/" element={<Landing />} />
        
        {/* 2. 认证区域 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* 3. 核心功能区 */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* 4. 扫描入口 (Scan Memory 核心功能) */}
        <Route path="/scan" element={<Scan />} />
        
        {/* 5. 胶囊详情页 */}
        <Route path="/capsule" element={<Capsule />} />
        <Route path="/capsule/:id" element={<Capsule />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;