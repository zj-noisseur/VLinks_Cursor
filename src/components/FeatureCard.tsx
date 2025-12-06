import { LucideIcon } from "lucide-react";

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const FeatureCard = ({ icon: Icon, title, desc }: FeatureProps) => (
  <div className="flex gap-5 items-start p-5 rounded-[24px] bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm hover:bg-white/80 transition-all duration-300">
    <div className="w-10 h-10 rounded-2xl bg-[#F0EBE0] flex items-center justify-center shrink-0 text-[#8C7B68]">
      <Icon size={18} strokeWidth={1.5} />
    </div>
    <div>
      <h3 className="font-serif text-[#4A3F35] font-medium text-lg mb-1">{title}</h3>
      <p className="text-xs text-[#8C7B68] leading-relaxed font-light">{desc}</p>
    </div>
  </div>
);