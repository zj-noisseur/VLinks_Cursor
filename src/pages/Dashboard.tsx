import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, ArrowRight, Sparkles, QrCode, Feather, Home, BookOpen, UserCircle, Heart, Settings, LogOut, ShieldCheck, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const allCapsules = [
  {
    id: 'my-legacy',
    name: 'My Journey',
    years: 'Born 1995',
    photo: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'Drafting', 
    stats: 'Private',
    type: 'myself' 
  },
  {
    id: 'lim-ah-kow',
    name: 'Lim Ah Kow',
    years: '1930 – 2023',
    photo: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'Glowing', 
    stats: '128 hearts touched',
    type: 'loved-one' 
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false); // 控制菜单显示
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || '');
        // Get full_name from user metadata (stored during signup)
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
      }
    };

    fetchUserData();
  }, []);

  const ownCapsules = allCapsules.filter(c => c.type === 'myself');
  const lovedOnesCapsules = allCapsules.filter(c => c.type === 'loved-one');

  const handleQrClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Share Modal would open here"); 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#F5F0E6] font-sans text-[#5A4635]">
      
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative bg-[#FDFBF7] shadow-2xl overflow-hidden">
        
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }} />
        
        <div className="absolute top-[-120px] right-[-80px] w-[350px] h-[350px] bg-orange-100/60 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />
        <div className="absolute top-[100px] left-[-100px] w-[300px] h-[300px] bg-amber-100/50 rounded-full blur-[60px] pointer-events-none mix-blend-multiply" />

        {/* Header */}
        <header className="px-8 pt-14 pb-6 flex justify-between items-end relative z-20">
          <div>
            <p className="font-serif text-sm italic text-amber-700/80 mb-2">
              Welcome back, Keeper.
            </p>
            <h1 className="font-serif text-3xl text-[#3D2E22] leading-tight font-medium">
              Your Sanctuary
            </h1>
          </div>
          
          <div className="flex gap-3 relative">
              <button 
                onClick={() => navigate('/')}
                className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-[#E6DCCF] flex items-center justify-center text-[#8C7B68] shadow-sm hover:bg-[#F5F2EB] transition-colors"
                title="Back to Home"
              >
                 <Home size={20} />
              </button>
              
              {/* Profile Button / Account Menu Trigger */}
              <div 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className={`w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-[#E6DCCF] flex items-center justify-center text-[#8C7B68] shadow-sm hover:bg-[#F5F2EB] transition-colors cursor-pointer ${showAccountMenu ? 'ring-2 ring-amber-200' : ''}`}
              >
                 <User size={20} />
              </div>

              {/* Account Dropdown Menu */}
              {showAccountMenu && (
                <>
                    {/* 点击外部关闭 */}
                    <div className="fixed inset-0 z-10" onClick={() => setShowAccountMenu(false)} />
                    
                    <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-[#EBE5DA] z-20 overflow-hidden animate-fade-in-up origin-top-right">
                        <div className="p-4 border-b border-stone-100 bg-[#FDFBF7]">
                            <p className="text-xs font-bold text-[#3D2E22]">{userName}</p>
                            <p className="text-[10px] text-stone-500 truncate">{userEmail}</p>
                        </div>
                        <div className="py-2">
                            {/* 核心功能：传承规划 */}
                            <button className="w-full px-4 py-3 flex items-center gap-3 text-xs text-[#594A3C] hover:bg-[#FFF8EE] transition-colors group">
                                <ShieldCheck size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <span className="block font-medium">Legacy Contact</span>
                                    <span className="text-[9px] text-[#8C7B68]">Who takes over if you're gone?</span>
                                </div>
                            </button>
                            <button className="w-full px-4 py-3 flex items-center gap-3 text-xs text-[#594A3C] hover:bg-[#FFF8EE] transition-colors group">
                                <CreditCard size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <span className="block font-medium">Preservation Plan</span>
                                    <span className="text-[9px] text-[#8C7B68]">Ensure data lasts 100+ years</span>
                                </div>
                            </button>
                            <div className="h-px bg-stone-100 my-1 mx-4" />
                            <button className="w-full px-4 py-3 flex items-center gap-3 text-xs text-[#594A3C] hover:bg-[#FFF8EE] transition-colors">
                                <Settings size={16} className="text-[#8C7B68]" />
                                <span>Settings</span>
                            </button>
                        </div>
                        <div className="border-t border-stone-100 py-2 bg-stone-50">
                            <button 
                                onClick={handleLogout}
                                className="w-full px-4 py-2 flex items-center gap-3 text-xs text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                </>
              )}
          </div>
        </header>

        {/* Action Card */}
        <div className="px-7 mb-8 relative z-10">
           <button 
             onClick={() => navigate('/onboarding')}
             className="w-full relative overflow-hidden group rounded-[32px] p-1 bg-gradient-to-br from-[#8B5E3C] to-[#5D4037] shadow-xl shadow-amber-900/10 text-left transition-transform active:scale-[0.98]"
           >
              <div className="bg-[#3D2E22] rounded-[30px] p-6 h-full relative overflow-hidden">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
                      <Feather size={120} />
                  </div>
                  
                  <div className="relative z-10 flex justify-between items-center">
                     <div>
                        <h2 className="font-serif text-xl mb-1 text-[#FFF8EE] tracking-wide">Kindle a New Light</h2>
                        <p className="text-xs text-[#D4C5B0] font-light">Start a new story.</p>
                     </div>
                     <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 group-hover:bg-white/10 group-hover:text-white transition-colors">
                        <Plus size={20} />
                     </div>
                  </div>
              </div>
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto relative z-10 pb-10 px-7 space-y-10 scrollbar-hide">
           {/* Your Legacy */}
           <div>
               <div className="flex items-center gap-2 mb-4 px-1 opacity-80">
                   <UserCircle size={16} className="text-[#D97706]" />
                   <h3 className="font-serif text-lg text-[#3D2E22]">Your Legacy</h3>
               </div>
               <div className="space-y-4">
                  {ownCapsules.length > 0 ? (
                      ownCapsules.map((capsule) => (
                        <div key={capsule.id} onClick={() => navigate(`/capsule`)} className="bg-white/80 backdrop-blur-md p-4 rounded-[24px] border border-[#E6DCCF] shadow-sm flex gap-4 hover:border-amber-200 transition-all cursor-pointer group">
                            <img src={capsule.photo} alt={capsule.name} className="w-16 h-16 rounded-[18px] object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" />
                            <div className="flex-1 flex flex-col justify-center">
                                <h4 className="font-serif text-base text-[#3D2E22] mb-1">{capsule.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">{capsule.status}</span>
                                </div>
                            </div>
                            <div className="flex items-center pr-2">
                                <ArrowRight size={16} className="text-[#D4C5B0] group-hover:text-[#D97706] transition-colors" />
                            </div>
                        </div>
                      ))
                  ) : (
                      <button onClick={() => navigate('/onboarding')} className="w-full py-6 border-2 border-dashed border-[#E6DCCF] rounded-[24px] text-center hover:bg-white/50 transition-colors">
                          <p className="text-sm font-serif text-[#8C7B68] mb-1">Start writing your story</p>
                          <p className="text-[10px] text-[#B5A496]">Prepare it for the future</p>
                      </button>
                  )}
               </div>
           </div>

           {/* Lives You Honor */}
           <div>
               <div className="flex items-center gap-2 mb-4 px-1 opacity-80">
                   <Heart size={16} className="text-[#D97706]" />
                   <h3 className="font-serif text-lg text-[#3D2E22]">Lives You Honor</h3>
               </div>
               <div className="space-y-4">
                  {lovedOnesCapsules.length > 0 ? (
                      lovedOnesCapsules.map((capsule) => (
                        <div key={capsule.id} onClick={() => navigate(`/capsule`)} className="bg-white p-4 rounded-[28px] border border-[#EBE5DA] shadow-sm flex gap-5 hover:border-amber-200 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                            <img src={capsule.photo} alt={capsule.name} className="w-20 h-24 rounded-[20px] object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-500 shadow-sm" />
                            <div className="flex-1 py-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-serif text-lg text-[#3D2E22] leading-tight mb-1.5 group-hover:text-[#D97706] transition-colors">{capsule.name}</h4>
                                    <p className="text-xs text-[#8C7B68] font-medium">{capsule.years}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/50">
                                        <Sparkles size={10} className="fill-amber-500 text-amber-500 animate-pulse" />
                                        {capsule.status}
                                    </div>
                                    <span className="text-[10px] text-[#C4B5A5] font-medium">{capsule.stats}</span>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                                 <button onClick={handleQrClick} className="w-8 h-8 rounded-full bg-[#F9F6F0] flex items-center justify-center text-[#8C7B68] hover:bg-[#3D2E22] hover:text-white transition-colors shadow-sm">
                                    <QrCode size={14} />
                                 </button>
                            </div>
                        </div>
                      ))
                  ) : (
                      <div className="text-center py-10 border-2 border-dashed border-[#E6DCCF] rounded-[32px] bg-white/30">
                          <p className="text-sm font-serif text-[#8C7B68] mb-1">No memorials yet</p>
                          <p className="text-[10px] text-[#B5A496]">Kindle a light to honor a loved one</p>
                      </div>
                  )}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}