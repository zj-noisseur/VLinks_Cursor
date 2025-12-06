import { useNavigate } from "react-router-dom";
// 引入所有需要的图标
import { QrCode, Plus, ArrowRight, Sparkles, BookOpen, Mic, Users, Feather } from "lucide-react";
import { HeroSection } from "../components/HeroSection";
import { FeatureCard } from "../components/FeatureCard";

const Landing = () => {
  const navigate = useNavigate();

  return (
    // 全局背景色：暖白/蛋壳色 (#F9F6F0)
    <div className="min-h-screen flex justify-center bg-[#F9F6F0] text-[#4A3F35] font-sans selection:bg-amber-100">
      
      {/* 手机尺寸限制容器 */}
      <div className="w-full max-w-[430px] min-h-screen relative flex flex-col pb-12 bg-[#F9F6F0]">
        
        {/* 顶部氛围光效 (Top Glow) */}
        <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[500px] bg-orange-100/40 blur-[80px] rounded-full pointer-events-none z-0" />

        {/* HEADER */}
        <header className="fixed top-0 w-full max-w-[430px] z-50 px-6 py-6 flex justify-between items-center bg-gradient-to-b from-[#3D2E22]/20 to-transparent pointer-events-none">
            {/* Logo: 小写衬线体，现代且优雅 */}
            <span className="text-white font-serif text-2xl font-bold tracking-tight drop-shadow-md pointer-events-auto">
                VLinks
            </span>
            <button 
                onClick={() => navigate("/login")}
                className="pointer-events-auto px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-medium text-white hover:bg-white/20 transition shadow-lg"
            >
                Log In
            </button>
        </header>

        {/* HERO SECTION */}
        <HeroSection onCtaClick={() => navigate("/capsule/demo")} />

        {/* 悬浮操作栏 (Floating Action Card) */}
        <div className="px-6 -mt-10 relative z-20">
            <div className="bg-white p-2.5 rounded-[32px] shadow-[0_20px_40px_-12px_rgba(156,163,175,0.15)] border border-white/60 flex items-center justify-between backdrop-blur-xl">
                {/* 左边：扫码 */}
                <button 
                    onClick={() => navigate("/scan")}
                    className="flex-1 py-4 flex flex-col items-center gap-2 rounded-[24px] hover:bg-[#F7F5F0] transition group"
                >
                    <QrCode size={22} className="text-[#8C7B68] group-hover:text-[#B59878] transition-colors" strokeWidth={1.5}/>
                    <span className="text-[10px] font-semibold text-[#8C7B68] uppercase tracking-wider">Scan Memory</span>
                </button>
                
                {/* 分割线 */}
                <div className="w-px h-10 bg-[#EFEBE0]"></div>
                
                {/* 右边：新建 (Create Link) */}
                <button 
                    onClick={() => navigate("/onboarding")}
                    className="flex-1 py-4 flex flex-col items-center gap-2 rounded-[24px] hover:bg-[#F7F5F0] transition group"
                >
                    <Plus size={24} className="text-[#8C7B68] group-hover:text-[#B59878] transition-colors" strokeWidth={1.5}/>
                    <span className="text-[10px] font-semibold text-[#8C7B68] uppercase tracking-wider">Start Memorial</span>
                </button>
            </div>
        </div>

        {/* 特性介绍 (Features) - 诗意文案版 */}
        <div className="px-6 mt-12 space-y-8 relative z-10">
            <div className="text-center space-y-2">
                <h2 className="font-serif text-2xl text-[#3D2E22]">The warmth of a legacy</h2>
                <p className="text-xs text-[#8C7B68]">Stories shouldn't fade when the stone is set.</p>
            </div>
            
            <div className="space-y-4">
                <FeatureCard 
                    icon={Mic}
                    title="The Echo of a Life"
                    desc="Preserve not just the dates, but the laughter, the wisdom, and the voice that once filled the room."
                />
                <FeatureCard 
                    icon={Users}
                    title="A Collective Memory"
                    desc="Memory is a mosaic. Let family and friends piece together the fragments of a life well-lived."
                />
            </div>
        </div>

        {/* 灵感板块 (Inspiration / Coco Philosophy) */}
        <div className="mt-14 pl-6 mb-8">
            <div className="flex items-center justify-between pr-6 mb-5">
                 <h2 className="font-serif text-xl text-[#3D2E22]">Inspiration</h2>
                 <span className="text-[10px] text-[#B59878] uppercase tracking-widest">Read & Explore</span>
            </div>
           
            {/* 横向滚动容器 */}
            <div className="flex gap-4 overflow-x-auto pb-8 pr-6 snap-x scrollbar-hide">
                
                {/* 卡片 1: Coco 哲学 (深色卡片，视觉重心) */}
                <div 
                    className="min-w-[280px] snap-center p-5 rounded-[24px] bg-[#3D2E22] text-[#F9F6F0] relative overflow-hidden group cursor-pointer shadow-lg shadow-amber-900/10"
                    onClick={() => console.log("Open Article")}
                >
                    {/* 装饰光圈 */}
                    <div className="absolute top-[-50%] right-[-50%] w-[200px] h-[200px] bg-amber-500/20 rounded-full blur-[40px]" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-amber-200/80">
                                <Sparkles size={14} />
                                <span className="text-[10px] uppercase tracking-widest font-semibold">Our Philosophy</span>
                            </div>
                            <h3 className="font-serif text-xl leading-snug text-amber-50">
                                "The final death is only when we are forgotten."
                            </h3>
                        </div>
                        
                        <div>
                            <p className="text-xs text-stone-300 leading-relaxed line-clamp-3 mb-4 font-light">
                                Inspired by the movie <i>Coco</i>, we believe that as long as stories are told, our loved ones never truly leave us.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-amber-200">
                                <span>Read the story</span>
                                <ArrowRight size={12} />
                            </div>
                        </div>
                    </div>
                </div>

                 {/* 卡片 2: 实用指南 (浅色卡片) */}
                 <div className="min-w-[240px] snap-center p-5 rounded-[24px] bg-white border border-stone-100 flex flex-col justify-between cursor-pointer hover:border-amber-100 transition shadow-sm">
                    <div>
                        <div className="w-8 h-8 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#8C7B68] mb-4">
                            <BookOpen size={16} />
                        </div>
                        <h3 className="font-serif text-md text-[#3D2E22] mb-2">Curating a Life</h3>
                        <p className="text-xs text-[#8C7B68] leading-relaxed">
                            What photos should you choose? A guide to capturing the essence of a person.
                        </p>
                    </div>
                    <div className="mt-4 text-[10px] text-[#B59878] font-bold uppercase tracking-wide">
                        Read Guide
                    </div>
                </div>

                {/* 卡片 3: 示例入口 (软性植入) */}
                 <div 
                    onClick={() => navigate("/capsule/demo")}
                    className="min-w-[140px] snap-center p-5 rounded-[24px] bg-[#F5F2EB] border border-transparent flex flex-col justify-center items-center text-center gap-3 cursor-pointer"
                 >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8C7B68] shadow-sm">
                        <Feather size={18} />
                    </div>
                    <p className="text-xs font-serif text-[#3D2E22] leading-tight">Share your thoughts</p>
                </div>

            </div>
        </div>
        
        {/* Footer Slogan */}
        <div className="px-6 pb-6 text-center opacity-60">
             <p className="font-serif text-[10px] italic text-[#8C7B68]">"Remember me, though I have to say goodbye..."</p>
        </div>

      </div>
    </div>
  );
};

export default Landing;