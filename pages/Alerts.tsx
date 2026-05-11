
import React, { useEffect, useState, useCallback } from 'react';
import { hiveService } from '../services/hiveService';
import { Hive } from '../types';
import { 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  RefreshCw,
  Info,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Alerts: React.FC = () => {
  const [hives, setHives] = useState<Hive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await hiveService.refreshData();
    setHives(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Lógica de Diagnóstico de Temperatura
  const getTempStatus = (t: number) => {
    if (t === 0) return { label: 'Sem Dados', color: 'slate', risk: '-', icon: <Activity size={16}/> };
    if (t < 32) return { 
      label: 'Temperatura abaixo do ideal', 
      status: 'ALERTA',
      color: 'rose', 
      risk: 'Risco para a cria / Desenvolvimento lento das larvas',
      suggestion: 'Verifique se a colônia está fraca ou se há frio excessivo.'
    };
    if (t >= 34 && t <= 36) return { 
      label: 'Temperatura normal', 
      status: 'IDEAL',
      color: 'emerald', 
      risk: 'Desenvolvimento correto das larvas / Rainha ativa',
      suggestion: 'Condições ótimas mantidas.'
    };
    if (t > 36 && t <= 38) return { 
      label: 'Temperatura acima do normal', 
      status: 'ALERTA',
      color: 'amber', 
      risk: 'Estresse térmico / Ventilação excessiva',
      suggestion: 'Aumente a disponibilidade de água e sombra.'
    };
    if (t > 38) return { 
      label: 'Risco térmico elevado', 
      status: 'CRÍTICO',
      color: 'rose', 
      risk: 'Mortalidade da cria / Possível abandono da colmeia',
      suggestion: 'Ação imediata: Melhore a ventilação e resfrie o ambiente.'
    };
    return { 
      label: 'Temperatura em transição', 
      status: 'OBSERVAÇÃO',
      color: 'slate', 
      risk: 'Fora da faixa de alta performance',
      suggestion: 'Monitore a estabilização.'
    };
  };

  // Lógica de Diagnóstico de Umidade
  const getHumStatus = (h: number) => {
    if (h === 0) return { label: 'Sem Dados', color: 'slate', risk: '-', icon: <Activity size={16}/> };
    if (h < 50) return { 
      label: 'Umidade baixa', 
      status: 'ALERTA',
      color: 'rose', 
      risk: 'Ressecamento da cria / Dificuldade no desenvolvimento',
      suggestion: 'Verifique fontes de água próximas.'
    };
    if (h >= 55 && h <= 65) return { 
      label: 'Umidade normal', 
      status: 'IDEAL',
      color: 'emerald', 
      risk: 'Boa incubação / Mel e pólen conservados',
      suggestion: 'Condições ideais de armazenamento.'
    };
    if (h > 70) return { 
      label: 'Umidade acima do ideal', 
      status: 'ALERTA',
      color: 'amber', 
      risk: 'Proliferação de fungos / Fermentação do mel',
      suggestion: 'Verifique infiltrações ou excesso de umidade externa.'
    };
    return { 
      label: 'Umidade em transição', 
      status: 'OBSERVAÇÃO',
      color: 'slate', 
      risk: 'Fora da faixa de equilíbrio',
      suggestion: 'Monitore as variações climáticas.'
    };
  };

  if (isLoading && hives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-4">
        <RefreshCw className="animate-spin text-amber-500" size={40} />
        <p className="font-bold">Gerando Diagnóstico...</p>
      </div>
    );
  }

  const issuesFound = hives.filter(h => 
    h.temperature < 32 || h.temperature > 36 || h.humidity < 55 || h.humidity > 65
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header do Diagnóstico */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-slate-900 text-white rounded-xl">
                <ShieldAlert size={24} />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Análise Biológica</h1>
          </div>
          <p className="text-slate-500 text-sm max-w-lg">
            Sistema de monitoramento baseado nos parâmetros vitais da <strong className="text-slate-800">Apis mellifera</strong>. 
            Avaliamos riscos de desenvolvimento e saúde da colônia em tempo real.
          </p>
        </div>

        <div className="flex gap-4">
            <div className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-center min-w-[140px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alertas Ativos</p>
                <p className={`text-3xl font-black ${issuesFound > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {issuesFound}
                </p>
            </div>
            <button onClick={loadData} className="p-4 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors">
                <RefreshCw size={24} className="text-slate-600" />
            </button>
        </div>
      </div>

      {/* Grid de Diagnósticos por Colmeia */}
      <div className="grid grid-cols-1 gap-6">
        {hives.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
             <Search size={48} className="mx-auto text-slate-200" />
             <p className="text-slate-400 font-medium">Nenhuma colmeia registrada para análise.</p>
             <Link to="/cadastrar" className="inline-block bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold">Cadastrar Agora</Link>
          </div>
        ) : (
          hives.map(hive => {
            const tempDiag = getTempStatus(hive.temperature);
            const humDiag = getHumStatus(hive.humidity);
            const hasIssue = tempDiag.status !== 'IDEAL' || humDiag.status !== 'IDEAL';

            return (
              <div key={hive.id} className={`bg-white rounded-3xl border-2 transition-all overflow-hidden ${hasIssue ? 'border-rose-100 shadow-lg shadow-rose-50' : 'border-slate-100 shadow-sm'}`}>
                {/* Cabeçalho do Card */}
                <div className={`px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b ${hasIssue ? 'bg-rose-50/30 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${hasIssue ? 'bg-rose-500' : 'bg-slate-800'}`}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{hive.name}</h3>
                            <p className="text-xs text-slate-500 font-mono">{hive.id} • {hive.location}</p>
                        </div>
                    </div>
                    <Link to={`/hive/${hive.id}`} className="text-xs font-black text-slate-400 hover:text-amber-600 uppercase tracking-widest flex items-center gap-2 group">
                        Ver Detalhes Técnicos <Activity size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Diagnóstico de Temperatura */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Thermometer className={`text-${tempDiag.color}-500`} size={20} />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">Parâmetro Térmico</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border bg-${tempDiag.color}-50 border-${tempDiag.color}-200 text-${tempDiag.color}-700`}>
                                {tempDiag.status}
                            </span>
                        </div>
                        <div className="flex items-end gap-3">
                            <h4 className="text-4xl font-black text-slate-800">{hive.temperature.toFixed(1)}°C</h4>
                            <p className={`text-sm font-bold text-${tempDiag.color}-600 mb-1`}>{tempDiag.label}</p>
                        </div>
                        <div className={`p-4 rounded-2xl bg-${tempDiag.color}-50/50 border border-${tempDiag.color}-100 space-y-2`}>
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={14} className={`text-${tempDiag.color}-500 mt-0.5 shrink-0`} />
                                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                    <span className="uppercase text-[9px] block text-slate-400 mb-0.5">Risco Identificado</span>
                                    {tempDiag.risk}
                                </p>
                            </div>
                            {tempDiag.suggestion && (
                                <div className="flex items-start gap-2 pt-2 border-t border-slate-200/50">
                                    <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                    <p className="text-[11px] italic text-slate-500">{tempDiag.suggestion}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Diagnóstico de Umidade */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Droplets className={`text-${humDiag.color}-500`} size={20} />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">Parâmetro de Umidade</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border bg-${humDiag.color}-50 border-${humDiag.color}-200 text-${humDiag.color}-700`}>
                                {humDiag.status}
                            </span>
                        </div>
                        <div className="flex items-end gap-3">
                            <h4 className="text-4xl font-black text-slate-800">{hive.humidity.toFixed(0)}%</h4>
                            <p className={`text-sm font-bold text-${humDiag.color}-600 mb-1`}>{humDiag.label}</p>
                        </div>
                        <div className={`p-4 rounded-2xl bg-${humDiag.color}-50/50 border border-${humDiag.color}-100 space-y-2`}>
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={14} className={`text-${humDiag.color}-500 mt-0.5 shrink-0`} />
                                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                    <span className="uppercase text-[9px] block text-slate-400 mb-0.5">Risco Identificado</span>
                                    {humDiag.risk}
                                </p>
                            </div>
                            {humDiag.suggestion && (
                                <div className="flex items-start gap-2 pt-2 border-t border-slate-200/50">
                                    <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                    <p className="text-[11px] italic text-slate-500">{humDiag.suggestion}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabela de Referência Biológica (Footer) - Atualizada para Amber/Light Theme */}
      <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-8 text-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
                <BookOpen size={20} />
              </div>
              <h3 className="font-black text-lg uppercase tracking-tight">Guia de Referência: Apis mellifera</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
              <div className="space-y-4">
                  <p className="font-black text-amber-600 uppercase tracking-widest border-b-2 border-amber-200 pb-2 flex items-center justify-between">
                    Temperatura
                    <Thermometer size={16} />
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                        <span className="font-medium text-slate-500">Ideal absoluto:</span> 
                        <span className="font-black text-emerald-600">34°C - 36°C</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                        <span className="font-medium text-slate-500">Alerta (Frio):</span> 
                        <span className="font-black text-rose-500">&lt; 32°C</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                        <span className="font-medium text-slate-500">Alerta (Calor):</span> 
                        <span className="font-black text-amber-600">&gt; 36°C</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                        <span className="font-medium text-slate-500">Crítico:</span> 
                        <span className="font-black text-rose-700">&gt; 38°C</span>
                    </div>
                  </div>
              </div>
              <div className="space-y-4">
                  <p className="font-black text-blue-500 uppercase tracking-widest border-b-2 border-blue-100 pb-2 flex items-center justify-between">
                    Umidade
                    <Droplets size={16} />
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                        <span className="font-medium text-slate-500">Ideal:</span> 
                        <span className="font-black text-emerald-600">55% - 65%</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                        <span className="font-medium text-slate-500">Alerta (Seco):</span> 
                        <span className="font-black text-rose-500">&lt; 50%</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                        <span className="font-medium text-slate-500">Alerta (Úmido):</span> 
                        <span className="font-black text-amber-600">&gt; 70%</span>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-xl text-[10px] text-blue-600 font-bold italic text-center">
                        Umidade acima de 70% favorece a proliferação de fungos e fermentação do mel.
                    </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Alerts;
