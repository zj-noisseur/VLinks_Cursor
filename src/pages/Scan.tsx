import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, Search, Loader2, Zap } from 'lucide-react';
//import { mockScan } from '../lib/api'; // 暂时用 Mock，等你表建好后换 getCapsule

export default function Scan() {
  const navigate = useNavigate();
  //const [isScanning, setIsScanning] = useState(true); // 模拟摄像头激活状态
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 模拟摄像头权限请求动画
  useEffect(() => {
    const timer = setTimeout(() => {
      // 实际项目中这里会调用 navigator.mediaDevices.getUserMedia
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError('');

    try {
      // 调用 API (这里先用 Mock，输入 'lim' 或 'demo' 会成功)
      const capsule = await mockScan(code);
      
      if (capsule) {
        // 找到胶囊 -> 跳转到详情页
        navigate(`/capsule/${capsule.id}`);
      } else {
        setError('Memory not found. Please check the code.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden flex flex-col">
      
      {/* 1. 模拟摄像头背景 (Camera Feed Simulation) */}
      <div className="absolute inset-0 z-0">
          {/* 这里放一个模糊的动态背景，模拟摄像头还没对焦的样子 */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 to-black opacity-80" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse" />
          
          {/* 扫描线动画 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-[scan_3s_linear_infinite]" />
      </div>

      {/* 2. 顶部导航 (悬浮) */}
      <header className="relative z-20 px-6 pt-8 pb-4 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Memory Lens</span>
        <div className="w-10" /> {/* 占位 */}
      </header>

      {/* 3. 扫描取景框 (The Viewfinder) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          
          <div className="relative w-64 h-64 border-2 border-white/30 rounded-[32px] flex items-center justify-center overflow-hidden">
              {/* 四角装饰 */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-xl" />
              
              {/* 中心提示 */}
              <div className="text-center space-y-2 opacity-80">
                  <ScanLine size={32} className="text-white mx-auto animate-pulse" />
                  <p className="text-xs text-white/70 font-light">Point at vlinks QR Code</p>
              </div>
          </div>

          {/* 错误提示 */}
          {error && (
              <div className="mt-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-xs backdrop-blur-md animate-fade-in-up">
                  {error}
              </div>
          )}

      </div>

      {/* 4. 手动输入区域 (Bottom Sheet Style) */}
      <div className="relative z-20 bg-[#FDFBF7] rounded-t-[32px] p-8 pb-12 shadow-2xl animate-slide-up">
          <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6" />
          
          <h2 className="font-serif text-2xl text-[#3D2E22] mb-2 text-center">Find a Memory</h2>
          <p className="text-xs text-[#8C7B68] text-center mb-6">Having trouble scanning? Enter the unique vlink ID.</p>

          <form onSubmit={handleSearch} className="relative">
              <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. lim-ah-kow" 
                  className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white border border-[#EBE5DA] text-[#3D2E22] text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 shadow-inner transition-all uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal"
              />
              <button 
                  type="submit"
                  disabled={!code || loading}
                  className="absolute right-2 top-2 w-10 h-10 bg-[#3D2E22] rounded-xl flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform active:scale-95"
              >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
          </form>
          
          <div className="mt-6 flex justify-center">
             <button onClick={() => setCode('demo')} className="text-[10px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                <Zap size={12} /> Try Demo: tap to fill "demo"
             </button>
          </div>
      </div>

      {/* CSS Animation for Scan Line */}
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-slide-up {
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}