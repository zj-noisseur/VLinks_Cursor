import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, User, Heart, ChevronRight, Mail, Shield, 
  MapPin, ChevronDown, Sparkles, RefreshCw, Calendar, 
  Hourglass, LockKeyhole 
} from 'lucide-react';

// --- 1. 类型定义 ---
type OnboardingStep = 1 | 2 | 3 | 4 | 5;

// 日期结构改为对象，适配高级三段式选择器
interface DateObject {
  day: string;
  month: string;
  year: string;
}

interface FormData {
  creatingFor: 'myself' | 'loved-one' | null;
  name: string;
  relationship: string;
  dob: DateObject;
  passed: DateObject;
  country: string;
  overview: string;
  tags: string[];
  adminName: string;
  adminRelationship: string;
  adminEmail: string;
  verificationSent: boolean;
  approved: boolean;
}

// --- 2. 静态数据 (Writer's & Psychologist's Database) ---
const suggestedTags = [
  'Adventurous', 'Family-first', 'Soft-spoken', 'Foodie',
  'Creative', 'Kind', 'Hardworking', 'Generous',
];

const countries = ["Singapore", "Malaysia", "United States", "United Kingdom", "China", "Other"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// 心理学引导语库 (Thought Starters) - 帮助用户克服写作焦虑
const prompts = {
  myself: [
    "What is a motto or phrase you live by?",
    "Describe your perfect Sunday morning.",
    "What is the one dish you can cook better than anyone?",
    "What song instantly puts you in a good mood?",
    "The most adventurous thing I've ever done is...",
    "What do you hope your grandchildren will say about you?",
  ],
  lovedOne: [
    "What was their signature catchphrase or joke?",
    "What comfort food did they always make for the family?",
    "What song brings them back to you instantly?",
    "Describe their laugh in three words.",
    "What was a small kindness they showed to a stranger?",
    "The place they felt most at peace was...",
  ]
};

// --- 3. 内部组件：自定义下拉菜单 (Custom Dropdown) ---
// 彻底解决原生 Select 丑陋的问题，支持图标，完全可控的 UI
const CustomDropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  icon: Icon,
  placeholder = "Select..."
}: { 
  label?: string, 
  value: string, 
  options: string[], 
  onChange: (val: string) => void,
  icon?: any,
  placeholder?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部自动关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative w-full" ref={dropdownRef}>
      {label && <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-4 rounded-2xl bg-white border text-left flex items-center justify-between transition-all shadow-sm group ${
          isOpen 
            ? 'border-amber-400 ring-4 ring-amber-100/50 z-20 relative' 
            : 'border-[#EBE5DA] hover:border-amber-200'
        }`}
      >
        <span className={`text-sm ${value ? 'text-[#3D2E22]' : 'text-stone-400'}`}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-2 text-[#D4C5B0]">
           {Icon && <Icon size={18} />}
           <ChevronDown 
             size={16} 
             className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} 
           />
        </div>
      </button>

      {/* 悬浮菜单 */}
      {isOpen && (
        <div className="absolute top-[110%] left-0 right-0 bg-white rounded-2xl border border-[#EBE5DA] shadow-xl shadow-stone-200/50 z-50 overflow-hidden animate-fade-in-up max-h-[240px] overflow-y-auto">
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className="px-4 py-3 flex items-center justify-between hover:bg-[#FFF8EE] cursor-pointer transition-colors group border-b border-stone-50 last:border-0"
            >
              <span className={`text-sm ${value === opt ? 'font-bold text-[#3D2E22]' : 'text-[#594A3C]'}`}>
                {opt}
              </span>
              {value === opt && <Check size={16} className="text-amber-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 4. 内部组件：高级日期组合 (Date Group) ---
// 替代原生 date picker，提供 Day/Month/Year 三段式选择，彻底避开蓝色日历
const DateGroup = ({ label, value, onChange }: { label: string, value: DateObject, onChange: (newVal: DateObject) => void }) => {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">{label}</label>
            <div className="flex gap-2">
                {/* Day Input */}
                <input 
                    type="number" 
                    placeholder="DD"
                    value={value.day}
                    onChange={(e) => onChange({ ...value, day: e.target.value })}
                    className="w-[28%] px-3 py-4 rounded-2xl bg-white border border-[#EBE5DA] text-center text-[#3D2E22] focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 shadow-sm transition-all placeholder:text-stone-300 text-sm"
                />
                
                {/* Month Dropdown (复用 CustomDropdown 逻辑) */}
                <div className="flex-1 relative">
                    <CustomDropdown 
                        value={value.month} 
                        options={months} 
                        onChange={(m) => onChange({ ...value, month: m })}
                        placeholder="Month"
                    />
                </div>

                {/* Year Input */}
                <input 
                    type="number" 
                    placeholder="YYYY"
                    value={value.year}
                    onChange={(e) => onChange({ ...value, year: e.target.value })}
                    className="w-[32%] px-3 py-4 rounded-2xl bg-white border border-[#EBE5DA] text-center text-[#3D2E22] focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 shadow-sm transition-all placeholder:text-stone-300 text-sm"
                />
            </div>
        </div>
    );
}

// --- 5. 主组件 (Onboarding) ---
export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0); // 控制灵感索引
  
  const [formData, setFormData] = useState<FormData>({
    creatingFor: null,
    name: '',
    relationship: '',
    dob: { day: '', month: '', year: '' },
    passed: { day: '', month: '', year: '' },
    country: 'Singapore',
    overview: '',
    tags: [],
    adminName: '',
    adminRelationship: '',
    adminEmail: '',
    verificationSent: false,
    approved: false,
  });

  // 导航逻辑修正：如果当前在第一步，点击返回将回到 Dashboard 而不是 Homepage
  const handleNext = () => { if (step < 5) setStep((step + 1) as OnboardingStep); };
  const handleBack = () => { 
    if (step > 1) {
      setStep((step - 1) as OnboardingStep);
    } else {
      // 逻辑修正：退出 Onboarding 流程，回到控制台
      navigate('/dashboard'); 
    }
  };
  
  // 标签逻辑
  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  // 灵感轮播逻辑
  const nextPrompt = () => {
    const list = formData.creatingFor === 'myself' ? prompts.myself : prompts.lovedOne;
    setCurrentPromptIndex((prev) => (prev + 1) % list.length);
  };

  // 使用灵感逻辑
  const usePrompt = () => {
    const list = formData.creatingFor === 'myself' ? prompts.myself : prompts.lovedOne;
    const promptText = list[currentPromptIndex];
    const newText = formData.overview ? `${formData.overview}\n\n${promptText} ` : `${promptText} `;
    setFormData({ ...formData, overview: newText });
  };

  const sendVerification = () => { setFormData((prev) => ({ ...prev, verificationSent: true })); handleNext(); };
  const simulateApproval = () => { setFormData((prev) => ({ ...prev, approved: true })); };
  const progressPercentage = (step / 5) * 100;

  return (
    <div className="min-h-screen flex justify-center bg-[#FDFBF7] font-sans text-[#4A3F35]">
      {/* 手机容器 */}
      <div className="w-full max-w-[430px] min-h-screen relative flex flex-col bg-[#FDFBF7] overflow-hidden shadow-2xl shadow-stone-200">
        
        {/* 背景光晕 (氛围感) */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-[80px] pointer-events-none" />

        {/* Header: 导航栏与进度条 */}
        <header className="relative z-20 px-6 pt-8 pb-4 bg-[#FDFBF7]/80 backdrop-blur-md sticky top-0">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleBack} className="w-10 h-10 rounded-full bg-white border border-[#EBE5DA] flex items-center justify-center text-[#8C7B68] hover:bg-[#F5F2EB] transition shadow-sm">
              <ArrowLeft size={20} />
            </button>
            <span className="text-xs font-bold text-[#D97706] tracking-widest uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                Step {step} / 5
            </span>
          </div>
          {/* 连续的进度条 */}
          <div className="h-1.5 w-full bg-[#EBE5DA] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] transition-all duration-500 ease-out rounded-full" style={{ width: `${progressPercentage}%` }} />
          </div>
        </header>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto relative z-10 pb-10 scrollbar-hide">
          
          {/* --- Step 1: Selection --- */}
          {step === 1 && (
            <div className="px-7 py-4 space-y-8 animate-fade-in-up">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl text-[#3D2E22] leading-tight">
                  Who is this <br/><span className="text-[#D97706]">digital vault</span> for?
                </h1>
                <p className="text-sm text-[#8C7B68] font-light">We'll customize the experience based on your choice.</p>
              </div>

              <div className="space-y-4">
                <button onClick={() => { setFormData({ ...formData, creatingFor: 'myself' }); handleNext(); }}
                  className={`group w-full p-5 rounded-[24px] border-2 text-left transition-all duration-300 relative overflow-hidden ${formData.creatingFor === 'myself' ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-white bg-white hover:border-amber-200 shadow-sm'}`}
                >
                  <div className="relative z-10 flex gap-4 items-start">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.creatingFor === 'myself' ? 'bg-amber-100 text-amber-600' : 'bg-[#F5F2EB] text-[#8C7B68]'}`}><User size={24} /></div>
                     <div><h3 className="font-serif text-lg text-[#3D2E22] mb-1">Myself</h3><p className="text-xs text-[#8C7B68] leading-relaxed">Prepare your legacy ahead of time. Write your own story.</p></div>
                  </div>
                </button>

                <button onClick={() => { setFormData({ ...formData, creatingFor: 'loved-one' }); handleNext(); }}
                  className={`group w-full p-5 rounded-[24px] border-2 text-left transition-all duration-300 relative overflow-hidden ${formData.creatingFor === 'loved-one' ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-white bg-white hover:border-amber-200 shadow-sm'}`}
                >
                  <div className="relative z-10 flex gap-4 items-start">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.creatingFor === 'loved-one' ? 'bg-rose-100 text-rose-500' : 'bg-[#F5F2EB] text-[#8C7B68]'}`}><Heart size={24} /></div>
                     <div><h3 className="font-serif text-lg text-[#3D2E22] mb-1">A Loved One</h3><p className="text-xs text-[#8C7B68] leading-relaxed">Honor their memory. Create a home for their stories.</p></div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* --- Step 2: Basic Details (Writer's Copy & Custom UI) --- */}
          {step === 2 && (
            <div className="px-7 py-4 space-y-8 animate-fade-in-up">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl text-[#3D2E22] leading-tight">
                    {formData.creatingFor === 'myself' ? "The Title of the Story" : "Whose memory are we holding?"}
                </h1>
                <p className="text-sm text-[#8C7B68] font-light leading-relaxed pr-4">
                    {formData.creatingFor === 'myself' 
                      ? "Every great life has a name. Let's begin writing yours." 
                      : "Let's start with the name that you hold most dear."}
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white border border-[#EBE5DA] text-[#3D2E22] focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 transition-all shadow-sm" placeholder="e.g. Lim Ah Kow" />
                </div>

                {formData.creatingFor === 'loved-one' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">Relationship to you</label>
                    <input type="text" value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white border border-[#EBE5DA] text-[#3D2E22] focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 transition-all shadow-sm" placeholder="e.g. Grandfather" />
                  </div>
                )}

                {/* 替换原生日期选择器 - 使用自定义 DateGroup */}
                <DateGroup label="Date of Birth" value={formData.dob} onChange={(val) => setFormData({ ...formData, dob: val })} />

                {formData.creatingFor === 'loved-one' && (
                    <DateGroup label="Date of Passing" value={formData.passed} onChange={(val) => setFormData({ ...formData, passed: val })} />
                )}

                {/* 替换原生下拉菜单 - 使用自定义 CustomDropdown */}
                <CustomDropdown 
                    label="Resting Place / Location"
                    value={formData.country}
                    options={countries}
                    onChange={(val) => setFormData({ ...formData, country: val })}
                    icon={MapPin}
                />
              </div>

              <button onClick={handleNext} disabled={!formData.name} className="w-full py-4 mt-4 rounded-2xl bg-[#3D2E22] text-white font-semibold shadow-lg shadow-[#3D2E22]/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                Continue <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* --- Step 3: Overview (Psychologically Guided) --- */}
          {step === 3 && (
            <div className="px-7 py-4 space-y-6 animate-fade-in-up">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl text-[#3D2E22]">
                    {formData.creatingFor === 'myself' ? 'Your Narrative' : 'The Essence of a Life'}
                </h1>
                <p className="text-sm text-[#8C7B68] font-light leading-relaxed">
                    {formData.creatingFor === 'myself'
                      ? "You don't need to write a biography. Just capture the small moments and values that define you."
                      : "Focus on the little things—the way they laughed, their favorite song, or the advice they always gave."}
                </p>
              </div>

              {/* 灵感触发器 (The Spark) */}
              <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                  <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                          <div className="mt-0.5 min-w-[20px]">
                              <Sparkles size={16} className="text-amber-500 fill-amber-500/20" />
                          </div>
                          <div className="space-y-2">
                              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Thought Starter</p>
                              <p className="text-sm text-[#594A3C] font-medium italic">
                                  "{formData.creatingFor === 'myself' ? prompts.myself[currentPromptIndex] : prompts.lovedOne[currentPromptIndex]}"
                              </p>
                          </div>
                      </div>
                      <button onClick={nextPrompt} className="p-1.5 rounded-full hover:bg-amber-200/50 text-amber-600 transition-colors" title="Next idea">
                          <RefreshCw size={14} />
                      </button>
                  </div>
                  <button onClick={usePrompt} className="mt-3 text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 ml-8 hover:underline decoration-amber-400/50 underline-offset-2 transition-all">
                      Use this prompt to start writing →
                  </button>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">
                    {formData.creatingFor === 'myself' ? 'My Life Summary' : 'Life Summary'}
                 </label>
                 <textarea value={formData.overview} onChange={(e) => setFormData({ ...formData, overview: e.target.value })} className="w-full px-5 py-5 border border-[#EBE5DA] rounded-[24px] focus:ring-4 focus:ring-amber-100/50 focus:border-amber-400 outline-none resize-none bg-white shadow-sm text-[#3D2E22] leading-relaxed" rows={6} 
                 placeholder={formData.creatingFor === 'myself' ? "Start typing freely..." : "He was a man of quiet strength..."} />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">{formData.creatingFor === 'myself' ? 'My Traits' : 'Their Traits'}</label>
                <div className="flex flex-wrap gap-2.5">
                  {suggestedTags.map((tag) => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border ${formData.tags.includes(tag) ? 'bg-amber-400 border-amber-400 text-[#3D2E22] shadow-md shadow-amber-200 scale-105' : 'bg-white border-[#EBE5DA] text-[#8C7B68] hover:border-amber-200 hover:bg-[#FDFBF7]'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleNext} className="w-full py-4 mt-6 rounded-2xl bg-[#3D2E22] text-white font-semibold shadow-lg shadow-[#3D2E22]/20 hover:scale-[1.01] active:scale-[0.98] transition-all">Next</button>
            </div>
          )}

          {/* --- Step 4: Admin Assignment --- */}
          {step === 4 && !formData.verificationSent && (
            <div className="px-7 py-4 space-y-6 animate-fade-in-up">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl text-[#3D2E22]">Key Keeper</h1>
                <p className="text-sm text-[#8C7B68]">Assign a trusted family member as the primary admin.</p>
              </div>

              <div className="bg-[#FFF8EE] border border-amber-100 rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600"><Shield size={20} /></div>
                <p className="text-xs text-[#8C7B68] leading-relaxed">This person will approve photos from visitors and ensure the capsule remains a safe space.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">Admin Name</label>
                  <input type="text" value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white border border-[#EBE5DA] text-[#3D2E22] focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 shadow-sm" placeholder="Full Name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">Relationship</label>
                  <input type="text" value={formData.adminRelationship} onChange={(e) => setFormData({ ...formData, adminRelationship: e.target.value })} className="w-full px-4 py-4 rounded-2xl bg-white border border-[#EBE5DA] text-[#3D2E22] focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 shadow-sm" placeholder="e.g. Spouse" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#594A3C] ml-1 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <input type="email" value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} className="w-full pl-4 pr-10 py-4 rounded-2xl bg-white border border-[#EBE5DA] text-[#3D2E22] focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 shadow-sm" placeholder="admin@email.com" />
                    <Mail size={18} className="absolute right-4 top-4 text-[#D4C5B0] group-focus-within:text-amber-500 transition-colors" />
                  </div>
                </div>
              </div>

              <button onClick={sendVerification} disabled={!formData.adminName || !formData.adminEmail} className="w-full py-4 mt-4 rounded-2xl bg-[#3D2E22] text-white font-semibold shadow-lg shadow-[#3D2E22]/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50">Send Verification Request</button>
            </div>
          )}

          {/* --- Step 5: Waiting (Ceremonial Design) --- */}
          {step === 5 && !formData.approved && (
            <div className="px-7 py-12 flex flex-col items-center text-center animate-fade-in">
              <div className="relative mb-10 group">
                  <div className="absolute inset-0 bg-amber-200/40 blur-2xl rounded-full animate-pulse" />
                  <div className="relative w-28 h-28 rounded-full bg-gradient-to-b from-[#FFF8EE] to-[#F5E6D3] flex items-center justify-center border-[6px] border-white shadow-[0_20px_40px_-10px_rgba(217,119,6,0.2)]">
                    <Hourglass size={48} className="text-[#D97706] opacity-80" strokeWidth={1.5} />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-amber-50">
                       <Mail size={14} className="text-amber-500" />
                    </div>
                  </div>
              </div>
              <h1 className="font-serif text-3xl text-[#3D2E22] mb-3 leading-tight">Awaiting the Keeper</h1>
              <p className="text-sm text-[#8C7B68] leading-relaxed mb-8 max-w-[85%] font-light">
                We've passed the key to <span className="font-semibold text-[#594A3C]">{formData.adminEmail}</span>. <br/><br/>
                As soon as they accept, this memorial will be unlocked for the world to see.
              </p>
              <div className="w-full space-y-3">
                <button onClick={() => navigate('/capsule')} className="w-full py-4 rounded-2xl bg-[#3D2E22] text-white font-semibold shadow-xl shadow-[#3D2E22]/15 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <LockKeyhole size={16} className="opacity-70" />
                  Preview While Waiting
                </button>
                <button onClick={simulateApproval} className="w-full py-4 rounded-2xl bg-transparent border border-[#EBE5DA] text-[#8C7B68] font-medium hover:bg-white hover:border-amber-200 transition-colors text-xs">Tap to Simulate Approval (Demo)</button>
              </div>
            </div>
          )}

          {/* --- Step 5: Approved (Ceremonial Design) --- */}
          {step === 5 && formData.approved && (
            <div className="px-7 py-12 flex flex-col items-center text-center animate-fade-in-up">
               <div className="relative mb-10">
                  <div className="absolute inset-0 bg-amber-400/30 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center border-[6px] border-[#FFF8EE] shadow-[0_20px_50px_-12px_rgba(245,158,11,0.5)]">
                    <Sparkles size={48} className="text-white animate-bounce-slow" strokeWidth={1.5} />
                  </div>
              </div>
              <h1 className="font-serif text-3xl text-[#3D2E22] mb-3">The vlink is Alive</h1>
              <p className="text-sm text-[#8C7B68] leading-relaxed mb-10 max-w-[90%] font-light">
                The story of <span className="font-medium text-[#D97706]">{formData.name}</span> has found its eternal home. <br/>
                It is now safe, shared, and ready to be remembered.
              </p>
              <button onClick={() => navigate('/capsule')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold shadow-xl shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Enter Life Capsule <ChevronRight size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}