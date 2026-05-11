
import React, { useState } from 'react';
import { hiveService } from '../services/hiveService';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Hexagon, User as UserIcon, AlertCircle, LayoutGrid } from 'lucide-react';

const RegisterHive: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: 'COLMEIA',
    name: '',
    location: '',
    num_frames: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validação Frontend do Regex
    if (!/^COLMEIA[0-9]+$/.test(formData.id)) {
        setError('O ID deve começar com "COLMEIA" seguido de números (ex: COLMEIA5)');
        setIsLoading(false);
        return;
    }

    const result = await hiveService.addHive(formData);
    if (result.success) {
        navigate('/');
    } else {
        setError(result.message || 'Erro ao cadastrar');
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Novo Registro</h1>
        <p className="text-slate-500 mt-2">Cadastre o ID do hardware antes de enviar telemetria.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
        <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                <Hexagon size={24} className="fill-white/20" />
             </div>
             <div>
                <h3 className="font-bold text-slate-800 text-lg">Definições da Colmeia</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fonte única de verdade: Supabase</p>
             </div>
        </div>

        {error && (
            <div className="mx-8 mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {/* ID Field */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        ID da Colmeia (Identificador Único)
                    </label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={formData.id}
                            onChange={(e) => setFormData({...formData, id: e.target.value.toUpperCase()})}
                            className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-mono text-sm shadow-sm text-slate-900"
                            placeholder="COLMEIA1"
                            required
                        />
                        <div className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">REGEX REQUERIDO</div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Padrão: <strong>COLMEIA</strong> seguido de um ou mais números.</p>
                </div>

                {/* Name Field */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Apelido/Nome</label>
                    <input 
                        type="text" 
                        placeholder="Ex: APIÁRIO NORTE - 01"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all shadow-sm text-slate-900"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* Frames Field */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <LayoutGrid size={16} className="text-amber-500" />
                            Número de Favos
                        </label>
                        <input 
                            type="number" 
                            min="1"
                            max="30"
                            value={formData.num_frames}
                            onChange={(e) => setFormData({...formData, num_frames: parseInt(e.target.value)})}
                            className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all shadow-sm"
                            required
                        />
                    </div>

                    {/* Location Field */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-amber-500" />
                            Localização
                        </label>
                        <input 
                            type="text" 
                            placeholder="Opcional"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-100">
                <button 
                    type="button" 
                    onClick={() => navigate('/')}
                    className="px-6 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-10 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 flex items-center gap-2.5 transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Cadastrando...' : <><Plus size={20} /> Salvar Colmeia</>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterHive;
