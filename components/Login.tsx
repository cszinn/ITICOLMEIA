
import React, { useState } from 'react';
import { User } from '../types';
import { ArrowRight, Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('fabio@institutoiti.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        onLogin({
            id: 'u1',
            name: 'Fábio ',
            email: email,
            location: 'São Paulo, Brasil'
        });
        setIsLoading(false);
    }, 800);
  };

  // Constrói a URL do Supabase Storage
  const supabaseUrl = process.env.SUPABASE_URL;
  const loginLogoFilename = 'LOGOITICOLMEIALOGIN.png';
  const loginLogoUrl = supabaseUrl 
    ? `${supabaseUrl}/storage/v1/object/public/img/${loginLogoFilename}`
    : `/img/${loginLogoFilename}`;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
            style={{ backgroundImage: 'url("https://www.irationline.com.br/imagens/noticias/202306090823.jpg")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/90 to-slate-900/90 mix-blend-multiply"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
            <div className="flex items-center gap-3">
                 <div className="h-48 flex items-center overflow-visible">
                    <img 
                        src={loginLogoUrl} 
                        alt="ITI Colmeia Logo" 
                        className="h-full object-contain filter drop-shadow-xl scale-125 transform"
                        onError={(e) => {
                            if (!e.currentTarget.src.includes(`/img/${loginLogoFilename}`)) {
                                e.currentTarget.src = `/img/${loginLogoFilename}`;
                            } else {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent && !parent.querySelector('.fallback-text')) {
                                    const fallbackText = document.createElement('span');
                                    fallbackText.className = "text-3xl font-bold tracking-wide text-white fallback-text";
                                    fallbackText.innerText = "ITI COLMEIA";
                                    parent.appendChild(fallbackText);
                                }
                            }
                        }}
                    />
                 </div>
            </div>

            <div className="space-y-6">
                <h1 className="text-5xl font-bold leading-tight">
                    Monitoramento inteligente para <span className="text-amber-400">apicultura moderna</span>.
                </h1>
                <p className="text-lg text-slate-300 max-w-md">
                    Acompanhe a saúde das suas colmeias, temperatura, umidade e produção de mel em tempo real através da nossa plataforma IoT.
                </p>
            </div>

            <div className="text-sm text-slate-400 font-medium">
                © 2025 ITI COLMEIA - Instituto ITI 
            </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full bg-white lg:bg-transparent p-8 lg:p-0 rounded-2xl shadow-xl lg:shadow-none">
            <div className="text-center lg:text-left mb-10">
                {/* Logo Mobile Only - container h increased */}
                <div className="lg:hidden flex justify-center mb-6 h-32 overflow-visible">
                    <img src={loginLogoUrl} alt="ITI Colmeia" className="h-full object-contain scale-110" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo, Fábio</h2>
                <p className="text-slate-500">Insira suas credenciais para acessar o painel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                            <Mail size={20} />
                        </div>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-semibold text-slate-700">Senha</label>
                        <a href="#" className="text-sm font-medium text-amber-600 hover:text-amber-700">Esqueceu a senha?</a>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Entrar no Sistema <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-slate-100 text-center text-sm text-slate-500">
                Não tem uma conta? <a href="#" className="font-bold text-slate-900 hover:text-amber-600 transition-colors">Solicitar acesso</a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
