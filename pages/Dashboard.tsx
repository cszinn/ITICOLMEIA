
import React, { useEffect, useState, useCallback } from 'react';
import { hiveService } from '../services/hiveService';
import { Hive } from '../types';
import { Hexagon, RefreshCw, Radio, PlusCircle, LayoutGrid, Scale, Grid3X3, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import HiveCard from '../components/HiveCard';

const Dashboard: React.FC = () => {
  const [hives, setHives] = useState<Hive[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const formatWeight = (kg: number) => {
    return kg.toFixed(3);
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    const data = await hiveService.refreshData();
    setHives(data);
    if (data.length > 0 && !selectedHiveId) {
      setSelectedHiveId(data[0].id);
    }
    setIsRefreshing(false);
    setInitialLoading(false);
  }, [selectedHiveId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 5000);
    window.addEventListener('storage', () => loadData(true));
    return () => {
        clearInterval(interval);
        window.removeEventListener('storage', () => loadData(true));
    };
  }, [loadData]);

  const selectedHive = hives.find(h => h.id === selectedHiveId) || hives[0];
  
  const totalWeightKg = hives.reduce((acc, h) => acc + (h.total_weight / 1000), 0);

  if (initialLoading && hives.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <RefreshCw size={48} className="text-amber-500 animate-spin" />
              <p className="text-slate-500 font-medium">Carregando dados do apiário...</p>
          </div>
      );
  }

  if (hives.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <div className="bg-amber-100 p-6 rounded-full">
                  <Hexagon size={64} className="text-amber-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">Nenhuma colmeia encontrada</h2>
              <p className="text-slate-500 max-w-xs">Certifique-se de que seu hardware está configurado para enviar dados via HTTP POST.</p>
              <Link to="/cadastrar" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                  <PlusCircle size={20} className="text-amber-400" /> Cadastrar Minha Colmeia
              </Link>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Apiário em Tempo Real</h1>
                <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1 border border-green-200">
                    <Radio size={10} className="animate-pulse" /> ONLINE
                </div>
            </div>
            <p className="text-slate-500 text-sm">Atualizações automáticas a cada 5s</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => loadData()}
                disabled={isRefreshing}
                className={`p-2 bg-white border border-slate-200 rounded-xl transition-all hover:bg-slate-50 ${isRefreshing ? 'opacity-50' : ''}`}
            >
                <RefreshCw size={20} className={`text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Colmeias Ativas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Grid3X3 size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Colmeias Ativas</p>
                <h3 className="text-2xl font-bold text-slate-800 tabular-nums">{hives.length}</h3>
            </div>
        </div>

        {/* Card: Massa Total */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-amber-200 hover:shadow-md transition-all">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Scale size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Massa Total</p>
                <h3 className="text-2xl font-bold text-slate-800 tabular-nums">
                    {formatWeight(totalWeightKg)} <span className="text-sm font-medium text-slate-400">kg</span>
                </h3>
            </div>
        </div>

        {/* Card: Status Global */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-emerald-200 hover:shadow-md transition-all">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Status Global</p>
                <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-emerald-600">Operacional</h3>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Hexagon size={18} className="text-amber-500 fill-amber-500/20" />
                    Produção por Pote (Capacidade: 10kg)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Sincronização do apiário em tempo real.</p>
            </div>
            <select 
                value={selectedHiveId} 
                onChange={(e) => setSelectedHiveId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-slate-700"
            >
                {hives.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
        </div>
        
        <div className="flex flex-wrap justify-center gap-12 py-10 overflow-x-auto pb-14 custom-scrollbar">
            {selectedHive?.frames?.length ? selectedHive.frames.map((frame: any) => {
                const weightInKg = frame.weight / 1000;
                const isAbnormal = weightInKg < 0.4;
                const fillPercentage = Math.max(1, Math.min(100, (weightInKg / 10) * 100));
                
                return (
                    <div key={frame.position} className="flex flex-col items-center group perspective-1000">
                        <div className="relative w-40 h-80 flex flex-col items-center">
                            <div className="w-24 h-6 bg-slate-800 rounded-lg shadow-md z-20 mb-[-4px]"></div>
                            <div className="w-20 h-4 bg-slate-700 rounded-b-md z-10 mb-[-2px]"></div>
                            
                            <div className={`flex-1 w-full rounded-[3rem] border-4 relative flex items-end overflow-hidden transition-all duration-500 shadow-xl ${isAbnormal ? 'border-rose-200 bg-rose-50/30' : 'border-amber-100 bg-slate-50/50'}`}>
                                 <div 
                                    className={`w-full transition-all duration-500 ease-out relative ${isAbnormal ? 'bg-gradient-to-t from-rose-600 to-rose-400' : 'bg-gradient-to-t from-amber-600 to-amber-400'}`}
                                    style={{ height: `${fillPercentage}%` }}
                                 >
                                     <div className="absolute top-2 left-4 w-1 h-3/4 bg-white/20 rounded-full"></div>
                                     <div className="absolute top-0 left-0 w-full h-1 bg-white/30"></div>
                                 </div>

                                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
                                    <div className={`px-4 py-2 rounded-2xl shadow-sm backdrop-blur-sm border transition-all duration-300 ${isAbnormal ? 'bg-white/90 border-rose-100 text-rose-700' : 'bg-white/80 border-amber-100 text-slate-800'}`}>
                                        <p className="text-xs font-black uppercase tracking-tighter text-center leading-none mb-1 opacity-60">Peso</p>
                                        <p className="text-base font-black text-center tabular-nums">{formatWeight(weightInKg)}kg</p>
                                    </div>
                                 </div>
                            </div>
                            <div className="w-32 h-4 bg-slate-200/50 blur-md rounded-full mt-2"></div>
                        </div>
                        <span className="text-xs font-black text-slate-400 mt-6 group-hover:text-amber-600 transition-colors uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Pote {frame.position}</span>
                    </div>
                );
            }) : (
                <div className="py-20 text-slate-400 text-sm italic">Dados de recipientes indisponíveis para esta colmeia</div>
            )}
        </div>
      </div>

      <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
              <LayoutGrid size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Resumo Geral das Colmeias</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hives.map(hive => (
                  <HiveCard key={hive.id} hive={hive} />
              ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
