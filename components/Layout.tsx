
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BarChart2, LogOut, Menu, X, ChevronDown, ChevronUp, User as UserIcon, Box } from 'lucide-react';
import { hiveService } from '../services/hiveService';
import { Hive } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHivesOpen, setIsHivesOpen] = useState(true);
  const [hives, setHives] = useState<Hive[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Constrói a URL do Supabase Storage se a variável estiver disponível
  const supabaseUrl = process.env.SUPABASE_URL;
  const logoFilename = 'LOGOITICOLMEIA.jpeg';
  const logoUrl = supabaseUrl 
    ? `${supabaseUrl}/storage/v1/object/public/img/${logoFilename}`
    : `/img/${logoFilename}`;

  useEffect(() => {
    const loadHives = async () => {
        try {
            const data = await hiveService.refreshData();
            setHives(data);
        } catch (err) {
            console.error("Erro ao carregar colmeias:", err);
        }
    };
    loadHives();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        
        {/* Logo Section - Container increased and scale added */}
        <div className="p-8 pb-4 flex flex-col items-center">
             <div className="w-full h-32 flex items-center justify-center mb-4 overflow-visible">
                 <img 
                    src={logoUrl} 
                    alt="ITI Colmeia Logo" 
                    className="max-w-full max-h-full object-contain scale-125 transform transition-transform duration-300"
                    onError={(e) => {
                        // Tenta fallback local se falhar o Supabase e vice-versa
                        if (!e.currentTarget.src.includes(`/img/${logoFilename}`)) {
                            e.currentTarget.src = `/img/${logoFilename}`;
                        } else {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.text-fallback')) {
                                const textFallback = document.createElement('div');
                                textFallback.className = "text-amber-500 font-black text-2xl tracking-tighter text-fallback";
                                textFallback.innerText = "ITI COLMEIA";
                                parent.appendChild(textFallback);
                            }
                        }
                    }}
                 />
             </div>
        </div>

        <div 
            onClick={() => {
                navigate('/perfil');
                setIsMobileMenuOpen(false);
            }}
            className="px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors mx-2 rounded-xl"
        >
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white ring-2 ring-amber-400 ring-offset-2 overflow-hidden">
                {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <UserIcon size={24} />
                )}
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-sm">{user.name || "Apicultor"}</h3>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
            </div>
        </div>
        
        <div className="my-2 border-b border-slate-100 mx-6"></div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
            <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-6 py-3.5 rounded-lg transition-all font-medium ${
                  isActive('/')
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
            </Link>

            <div className="space-y-1">
                <button
                    onClick={() => setIsHivesOpen(!isHivesOpen)}
                    className={`w-full flex items-center justify-between px-6 py-3.5 rounded-lg transition-all font-medium text-slate-600 hover:bg-slate-50`}
                >
                    <div className="flex items-center space-x-3">
                        <Box size={20} />
                        <span>Minhas Colmeias</span>
                    </div>
                    {isHivesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {isHivesOpen && (
                    <div className="pl-12 space-y-1">
                        {hives.length > 0 ? hives.map(hive => (
                             <Link 
                                key={hive.id}
                                to={`/hive/${hive.id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block py-2 text-sm truncate pr-4 transition-colors ${isActive(`/hive/${hive.id}`) ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-amber-600'}`}
                             >
                                {hive.name}
                             </Link>
                        )) : (
                            <span className="block py-2 text-xs text-slate-400 italic">Nenhuma colmeia</span>
                        )}
                    </div>
                )}
            </div>

            <Link
                to="/cadastrar"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-6 py-3.5 rounded-lg transition-all font-medium ${
                  isActive('/cadastrar')
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <PlusCircle size={20} />
                <span>Cadastrar Colmeia</span>
            </Link>

            <Link
                to="/analises"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-6 py-3.5 rounded-lg transition-all font-medium ${
                  isActive('/analises')
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <BarChart2 size={20} />
                <span>Análises</span>
            </Link>

            <div className="mt-auto pt-8">
                <button
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLogout();
                    }}
                    className="w-full flex items-center space-x-3 px-6 py-3.5 rounded-lg transition-all font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center h-10">
                <img 
                    src={logoUrl} 
                    alt="ITI Colmeia" 
                    className="h-full object-contain scale-125 transform"
                />
           </div>
           <button
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
           >
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50 scrollbar-hide">
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
