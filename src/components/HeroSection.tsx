import { ChevronRight, Sparkles } from "lucide-react";

export const HeroSection = ({ onCtaClick }: { onCtaClick: () => void }) => {
  return (
    <div className="relative w-full h-[480px] rounded-b-[48px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(87,66,43,0.2)] isolate">
      {/* 背景图：建议选一张更有故事感的，比如夕阳下的背影，或者温暖的家庭聚会虚化图 */}
      <img
        src="https://images.pexels.com/photos/3363363/pexels-photo-3363363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        alt="Warm Memories"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* 渐变遮罩：从深咖色过渡到透明 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#3D2E22] via-[#3D2E22]/60 to-transparent opacity-90" />
      
      {/* 内容区域 */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex flex-col items-center text-center gap-5 text-white">
        
        {/* 小标签：Beyond the Tombstone (超越墓碑) */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Sparkles size={12} className="text-amber-200" />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-amber-100">
              Beyond the Tombstone
            </span>
        </div>

        {/* --- 核心文案更新 (Writer's Touch) --- */}
        <h1 className="text-4xl font-serif leading-tight text-[#FFF8F0]">
          To be remembered<br />
          <span className="text-amber-200/90 italic">is to live forever.</span>
        </h1>
        
        <p className="text-sm text-[#E6DCCF] leading-relaxed font-light max-w-[85%]">
          Death ends a life, not a relationship. Keep their stories, their voice, and their light alive here.
        </p>
        {/* ------------------------------------- */}
        
        <button 
          onClick={onCtaClick}
          className="mt-4 group relative px-8 py-3 rounded-full bg-[#F3EFE0] text-[#594A3C] text-sm font-semibold shadow-lg shadow-amber-900/20 overflow-hidden transition-transform active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2">
            Explore a VLinks <ChevronRight size={16} className="text-amber-700"/>
          </span>
        </button>
      </div>
    </div>
  );
};