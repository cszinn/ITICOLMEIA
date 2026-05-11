
import React, { useState, useEffect } from 'react';
import { hiveService } from '../services/hiveService';
import { Hive } from '../types';
import { Cpu, Send, Code, Terminal, CheckCircle2, Info, Globe, Copy, BookOpen, Settings, Zap } from 'lucide-react';

const Simulator: React.FC = () => {
  const [hives, setHives] = useState<Hive[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const apiEndpoint = `${window.location.origin}/api/telemetry`;

  const [temp, setTemp] = useState<number>(34);
  const [humidity, setHumidity] = useState<number>(55);
  const [avgFrameWeight, setAvgFrameWeight] = useState<number>(2.5);
  const [lastLog, setLastLog] = useState<string>('');

  const [jsonInput, setJsonInput] = useState<string>('{\n  "COLMEIA": "COLMEIA8",\n  "FAVO1": 2.5,\n  "FAVO2": 3.1,\n  "FAVO3": 1.2\n}');
  const [jsonFeedback, setJsonFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const data = hiveService.getHives();
    setHives(data);
    if (data.length > 0) setSelectedHiveId(data[0].id);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fix: handleSimulate is now async to handle processJsonTelemetry Promise.
  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHiveId) return;
    
    // Fix: Replaced missing ingestData with manual payload creation and awaited processJsonTelemetry.
    const selectedHive = hives.find(h => h.id === selectedHiveId);
    const numFrames = selectedHive?.frames?.length || 5;
    const frameWeights = Array.from({ length: numFrames }, () => avgFrameWeight + (Math.random() * 0.4 - 0.2));
    
    const payload: any = {
      COLMEIA: selectedHiveId,
      TEMP: temp,
      UMID: humidity
    };
    frameWeights.forEach((w, i) => {
      payload[`FAVO${i + 1}`] = Number(w.toFixed(2));
    });

    const result = await hiveService.processJsonTelemetry(payload);
    if (result.success) {
        setLastLog(`[${new Date().toLocaleTimeString()}] ATUALIZADO: ${selectedHiveId}`);
    }
  };

  // Fix: handleJsonSubmit is now async and awaits processJsonTelemetry to fix Promise property access errors.
  const handleJsonSubmit = async () => {
    const result = await hiveService.processJsonTelemetry(jsonInput);
    if (result.success) {
      setJsonFeedback({ msg: result.message || 'Processado!', type: 'success' });
      setHives(hiveService.getHives());
      setTimeout(() => setJsonFeedback(null), 3000);
    } else {
      setJsonFeedback({ msg: result.message || 'Erro', type: 'error' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header e Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <Terminal size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Developer Hub</h1>
                <p className="text-slate-500 text-sm">Configure e teste sua integração IoT</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                API ONLINE NO VERCEL
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Integração */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Bloco 1: Endpoint Real */}
            <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Globe size={20} className="text-emerald-400" />
                        <h2 className="text-lg font-bold text-white">Endpoint de Produção</h2>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vercel Edge</span>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">URL do POST</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-sm text-emerald-400 truncate">
                                {apiEndpoint}
                            </div>
                            <button onClick={handleCopy} className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl transition-all relative group">
                                {copied ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Copy size={20} className="text-slate-300" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Headers Necessários</h4>
                            <p className="text-sm font-mono text-white">Content-Type: application/json</p>
                        </div>
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Método</h4>
                            <p className="text-sm font-bold text-white">POST</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bloco 2: JSON Ingestor Local */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Code size={20} className="text-amber-500" />
                        <h2 className="text-lg font-bold text-slate-800">Simulador de Payload</h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <textarea 
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-bold">
                            {jsonFeedback && (
                                <span className={jsonFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}>{jsonFeedback.msg}</span>
                            )}
                        </div>
                        <button onClick={handleJsonSubmit} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2 transition-all">
                            <Send size={16} /> Processar no Browser
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Coluna da Direita: Guia de Configuração */}
        <div className="space-y-6">
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={20} />
                    <h2 className="font-bold">Guia Vercel</h2>
                </div>
                <ul className="space-y-4 text-sm">
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                        <p>No Dashboard da Vercel, vá em <strong>Settings &gt; Environment Variables</strong>.</p>
                    </li>
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                        <p>Crie a variável <code>API_KEY</code> com sua chave do Google Gemini.</p>
                    </li>
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                        <p>Acesse <code>/api/telemetry</code> para confirmar que a rota está ativa.</p>
                    </li>
                </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Settings size={20} className="text-slate-400" />
                    <h2 className="font-bold text-slate-800">Dica do ESP32</h2>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl font-mono text-[10px] text-slate-600 leading-relaxed">
                    // Exemplo HTTP no Arduino<br/>
                    http.begin(client, "{apiEndpoint.substring(0, 20)}...");<br/>
                    http.addHeader("Content-Type", "application/json");<br/>
                    int code = http.POST(payload);
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Certifique-se de usar HTTPS e carregar o certificado Root CA no seu código para conexões seguras com o Vercel.
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2 text-amber-700">
                    <Zap size={18} />
                    <h3 className="font-bold">Aviso IA</h3>
                </div>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                    A IA (Gemini 3 Flash) analisará os dados recebidos pelo endpoint para gerar alertas automáticos de saúde das abelhas.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
