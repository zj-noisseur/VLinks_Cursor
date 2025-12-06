import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useState } from "react"
import { supabase } from "../lib/supabaseClient"

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // 逻辑修正：登录成功后跳转到 Dashboard (控制台)
    //navigate('/dashboard');
    if (!email.trim() || !password.trim()) {
        alert("Please enter your email and password");
        return;
    }

    setLoading(true);
    setError("");

    try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email, 
            password
        });

        if (signInError) throw signInError;

        navigate('/dashboard');
    } catch (e: any){
        alert(e?.message || "Login failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#F9F6F0] font-sans text-[#4A3F35]">
      {/* 手机容器 */}
      <div className="w-full max-w-[430px] min-h-screen relative flex flex-col px-6 bg-[#F9F6F0] overflow-hidden">
        
        {/* 背景装饰光球 */}
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-amber-100/50 rounded-full blur-[60px]" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-orange-100/40 rounded-full blur-[50px]" />

        {/* Header: 返回按钮 */}
        <header className="relative z-10 pt-8 pb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white border border-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
        </header>

        {/* 主内容 */}
        <main className="relative z-10 flex-1 flex flex-col justify-center pb-20">
            
            {/* 品牌区域 */}
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3D2E22] text-amber-50 mb-4 shadow-xl shadow-amber-900/10">
                    {/* vlinks 简写 Logo */}
                    <span className="font-serif text-xl font-bold">vl</span>
                </div>
                <h1 className="font-serif text-3xl text-[#3D2E22] mb-2">Welcome Back</h1>
                <p className="text-xs text-[#8C7B68]">Sign in to safeguard your memories.</p>
            </div>

            {/* 表单 */}
            <form onSubmit={handleLogin} className="space-y-5">
                
                {/* 邮箱 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8C7B68] ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-3.5 text-[#B59878] group-focus-within:text-[#3D2E22] transition-colors">
                            <Mail size={18} />
                        </div>
                        <input 
                            type="email" 
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-[#E6DCCF] text-[#3D2E22] placeholder:text-stone-300 text-sm focus:outline-none focus:border-[#B59878] focus:ring-1 focus:ring-[#B59878] transition-all shadow-sm"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* 密码 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8C7B68] ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-3.5 text-[#B59878] group-focus-within:text-[#3D2E22] transition-colors">
                            <Lock size={18} />
                        </div>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-[#E6DCCF] text-[#3D2E22] placeholder:text-stone-300 text-sm focus:outline-none focus:border-[#B59878] focus:ring-1 focus:ring-[#B59878] transition-all shadow-sm"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="button" className="text-[11px] font-medium text-[#B59878] hover:text-[#8C7B68]">Forgot Password?</button>
                    </div>
                </div>

                {/* 登录按钮 */}
                <button 
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-[#3D2E22] text-[#FFF8F0] font-medium text-sm shadow-xl shadow-[#3D2E22]/10 active:scale-[0.98] transition-all mt-4"
                >
                    {loading ? "Logging in..." : "Log In"}
                    
                </button>

            </form>

            {/* 第三方登录 */}
            <div className="mt-8">
                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E6DCCF]"></div>
                    </div>
                    <span className="relative px-3 bg-[#F9F6F0] text-[10px] text-[#8C7B68] uppercase tracking-wider">Or continue with</span>
                </div>

                <button className="w-full py-3.5 rounded-2xl bg-white border border-[#E6DCCF] text-[#4A3F35] font-medium text-sm flex items-center justify-center gap-2 hover:bg-stone-50 transition shadow-sm">
                    {/* Google SVG */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" color="#4285F4" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" color="#34A853" />
                        <path fill="currentColor" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z" color="#FBBC05" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z" color="#EA4335" />
                    </svg>
                    Google
                </button>
            </div>

            <div className="mt-8 text-center">
                 <p className="text-xs text-[#8C7B68]">
                    Don't have a capsule yet? <button onClick={() => navigate("/signup")} className="font-semibold text-[#3D2E22] underline">Create one</button>
                 </p>
            </div>

        </main>
      </div>
    </div>
  );
};

export default Login;