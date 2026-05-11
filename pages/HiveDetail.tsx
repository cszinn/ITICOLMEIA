
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { hiveService } from '../services/hiveService';
import { Hive, SensorLog } from '../types';
import { analyzeHiveHealth } from '../services/geminiService';
import { ArrowLeft, Thermometer, Droplets, Scale, Sparkles, Bug, Trash2, RefreshCw, Radio, Hexagon, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const HiveDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hive, setHive] = useState<Hive | null>(null);
  const [history, setHistory] = useState<SensorLog[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [filterStart, setFilterStart] = useState<string>('');
  const [filterEnd, setFilterEnd] = useState<string>('');

  const formatWeight = (kg: number) => {
    return kg.toFixed(3);
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!id) return;
    try {
        const hives = await hiveService.refreshData();
        const currentHive = hives.find(h => h.id === id);
        
        if (currentHive) {
          setHive(currentHive);
          if (!filterStart && !filterEnd) {
            const hist = await hiveService.getHistory(id);
            setHistory(hist);
          }
        }
    } catch (err) {
        console.error("Erro detalhes:", err);
    } finally {
        if (!isSilent) setIsLoading(false);
    }
  }, [id, filterStart, filterEnd]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
        if (!filterStart && !filterEnd) loadData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData, filterStart, filterEnd]);

  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return tickItem;
    }
  };

  if (isLoading && !hive) return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="font-medium">Sincronizando dados...</p>
      </div>
  );

  if (!hive) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4">
        <Bug size={48} className="text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800">Colmeia não detectada</h2>
        <Link to="/" className="bg-slate-900 text-white px-6 py-2 rounded-xl">Voltar ao Painel</Link>
    </div>
  );

  const weightHistory = history.map(h => ({
      ...h,
      total_weight_kg: Number((h.total_weight / 1000).toFixed(3))
  }));

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{hive.name}</h1>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-lg border transition-colors shadow-sm ${
                    hive.status === 'offline' 
                    ? 'bg-rose-50 text-rose-600 border-rose-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                    <Radio size={10} className={`${hive.status !== 'offline' ? 'animate-pulse text-emerald-500' : 'text-rose-500'}`} />
                    {hive.status.toUpperCase()}
                </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-slate-500 text-xs font-medium">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{hive.id}</span>
                <span>{hive.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={async () => {
                    setIsAnalyzing(true);
                    const res = await analyzeHiveHealth(hive, history);
                    setAiAnalysis(res);
                    setIsAnalyzing(false);
                }}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 shadow-md shadow-amber-200"
            >
                <Sparkles size={16} className={isAnalyzing ? "animate-spin" : ""} />
                <span>Consultar IA</span>
            </button>
            <button 
                onClick={async () => {
                    if (window.confirm('Excluir esta colmeia permanentemente?')) {
                        await hiveService.deleteHive(hive.id);
                        navigate('/');
                    }
                }}
                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                title="Excluir Colmeia"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-rose-200 transition-all">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform"><Thermometer size={24}/></div>
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Temperatura Interna</p>
                <h3 className="text-2xl font-bold text-slate-800 tabular-nums">{hive.temperature.toFixed(1)}°C</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Droplets size={24}/></div>
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Umidade Interna</p>
                <h3 className="text-2xl font-bold text-slate-800 tabular-nums">{hive.humidity.toFixed(0)}%</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-amber-200 transition-all">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform"><Scale size={24}/></div>
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Massa Total Colmeia</p>
                <h3 className="text-2xl font-bold text-slate-800 tabular-nums">{formatWeight(hive.total_weight / 1000)}kg</h3>
            </div>
        </div>
      </div>

      {aiAnalysis && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-amber-500" size={20} />
                  <h3 className="font-bold text-amber-800">Análise da IA ITI Colmeia</h3>
              </div>
              <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
          </div>
      )}

      <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Hexagon size={18} className="text-amber-500 fill-amber-500/20" />
                Nível de Produção por Pote (Capacidade: 10kg)
            </h3>
            <p className="text-xs text-slate-400 mt-1">Dados individuais de armazenamento por recipiente.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-14 py-6 overflow-x-auto pb-16 custom-scrollbar">
            {hive.frames?.map((frame: any) => {
                const weightInKg = frame.weight / 1000;
                const isAbnormal = weightInKg < 0.4;
                const fillPercentage = Math.max(1, Math.min(100, (weightInKg / 10) * 100));
                
                return (
                    <div key={frame.position} className="flex flex-col items-center group">
                         <div className="relative w-40 h-80 flex flex-col items-center">
                            <div className="w-24 h-6 bg-slate-800 rounded-lg shadow-md z-20 mb-[-4px]"></div>
                            <div className="w-20 h-4 bg-slate-700 rounded-b-md z-10 mb-[-2px]"></div>
                            
                            <div className={`flex-1 w-full rounded-[3rem] border-4 relative flex items-end overflow-hidden transition-all duration-500 shadow-xl ${isAbnormal ? 'border-rose-200 bg-rose-50/30' : 'border-amber-100 bg-slate-50/50'}`}>
                                 <div 
                                    className={`w-full transition-all duration-1000 ease-out relative ${isAbnormal ? 'bg-gradient-to-t from-rose-600 to-rose-400' : 'bg-gradient-to-t from-amber-600 to-amber-400'}`}
                                    style={{ height: `${fillPercentage}%` }}
                                 >
                                     <div className="absolute top-2 left-4 w-1 h-3/4 bg-white/20 rounded-full"></div>
                                 </div>

                                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
                                    <div className={`px-4 py-2 rounded-2xl shadow-sm backdrop-blur-sm border transition-all duration-300 ${isAbnormal ? 'bg-white/90 border-rose-100 text-rose-700' : 'bg-white/80 border-amber-100 text-slate-800'}`}>
                                        <p className="text-[10px] font-black uppercase text-center opacity-60 mb-0.5">Peso</p>
                                        <p className="text-base font-black text-center tabular-nums">{formatWeight(weightInKg)}kg</p>
                                    </div>
                                 </div>
                            </div>
                        </div>
                        <span className="text-xs font-black text-slate-500 mt-6 uppercase tracking-widest bg-slate-50 px-5 py-2 rounded-lg border border-slate-200 shadow-sm">Pote {frame.position}</span>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Gráficos empilhados verticalmente */}
      <div className="flex flex-col gap-8">
          {/* Gráfico de Massa */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-500" /> Histórico de Massa
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <Clock size={12} /> TEMPO REAL
                </div>
              </div>
              <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightHistory} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                          <defs>
                              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={formatXAxis} 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickMargin={10}
                            label={{ value: 'Horário da Coleta', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            labelFormatter={(label) => new Date(label).toLocaleString()}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Area type="monotone" dataKey="total_weight_kg" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" name="Peso Total (kg)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Gráfico de Temperatura */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Thermometer size={16} className="text-rose-500" /> Histórico de Temperatura
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <Clock size={12} /> TEMPO REAL
                </div>
              </div>
              <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                          <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={formatXAxis} 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickMargin={10}
                            label={{ value: 'Horário da Coleta', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}°C`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            labelFormatter={(label) => new Date(label).toLocaleString()}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Area type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" name="Temperatura Interna (°C)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Gráfico de Umidade */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Droplets size={16} className="text-blue-500" /> Histórico de Umidade
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <Clock size={12} /> TEMPO REAL
                </div>
              </div>
              <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                          <defs>
                              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={formatXAxis} 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickMargin={10}
                            label={{ value: 'Horário da Coleta', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            labelFormatter={(label) => new Date(label).toLocaleString()}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Area type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" name="Umidade Interna (%)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HiveDetail;
