
import React, { useEffect, useState } from 'react';
import { User, Alert } from '../types';
import { hiveService } from '../services/hiveService';
import { User as UserIcon, Mail, MapPin, Phone, ShieldCheck, AlertTriangle, X, Save, Camera } from 'lucide-react';

interface ProfileProps {
    user: User;
    onUpdateUser: (updatedUser: Partial<User>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ hives: 0, weight: 0 });
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });

  const formatWeight = (kg: number) => {
    return kg.toFixed(3);
  };

  useEffect(() => {
    const loadedHives = hiveService.getHives();
    // Fix: Using getAlerts method from hiveService to resolve reported error
    const loadedAlerts = hiveService.getAlerts();
    
    setAlerts(loadedAlerts.slice(0, 3)); // Top 3 recent alerts
    setStats({
        hives: loadedHives.length,
        // Converte o peso total de gramas para quilogramas
        weight: loadedHives.reduce((acc, h) => acc + h.total_weight, 0) / 1000
    });
  }, []);

  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '+55 (11) 99999-8888', // Default mock if empty
              location: user.location || '',
              bio: user.bio || 'Apicultor apaixonado pela preservação das abelhas e tecnologia.'
          });
      }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateUser(formData);
      setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
            
            <div className="px-8 pb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-end -mt-16 mb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl relative group">
                            <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden border-4 border-white">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={48} />
                                )}
                            </div>
                            <button className="absolute bottom-1 right-1 bg-amber-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div className="pb-2 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                            <p className="text-slate-500 font-medium">{formData.bio.split('.')[0] || 'Apicultor Profissional'}</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex justify-center">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 hover:text-amber-600 transition-colors flex items-center gap-2"
                        >
                            Editar Perfil
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="bg-white p-2 rounded-lg text-amber-500 shadow-sm"><Mail size={18} /></div>
                        <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm"><Phone size={18} /></div>
                        <span className="text-sm font-medium">{formData.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="bg-white p-2 rounded-lg text-emerald-500 shadow-sm"><MapPin size={18} /></div>
                        <span className="text-sm font-medium">{user.location}</span>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg">Resumo da Atividade</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-4xl font-extrabold text-slate-800">{stats.hives}</span>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">Colmeias Ativas</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                             <span className="text-4xl font-extrabold text-amber-500">{formatWeight(stats.weight)} kg</span>
                             <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">Produção Total</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                             <span className="text-4xl font-extrabold text-emerald-500">98%</span>
                             <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">Saúde do Apiário</span>
                        </div>
                    </div>
                </div>
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500"/>
                        Alertas Recentes
                    </h3>
                    <span className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline">VER TODOS</span>
                </div>
                <div className="space-y-3">
                    {alerts.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-4">Nenhum alerta recente.</p>
                    ) : (
                        alerts.map(alert => (
                            <div key={alert.id} className="p-3 bg-slate-50 rounded-xl flex gap-3 border-l-4 border-amber-400 hover:bg-amber-50/50 transition-colors">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{alert.message}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleDateString()} - {alert.hiveName}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <ShieldCheck size={18} className="text-emerald-600"/>
                    Assinatura e Plano
                </h3>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-emerald-900 text-lg">Plano Profissional</span>
                        <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-1 rounded-lg font-bold tracking-wide">ATIVO</span>
                    </div>
                    <p className="text-sm text-emerald-700/80 leading-relaxed">Acesso ilimitado a análises de IA, armazenamento histórico de 12 meses e suporte técnico prioritário.</p>
                </div>
                <div className="text-center pt-2">
                    <p className="text-xs text-slate-400">Próxima renovação automática: <span className="font-mono text-slate-600">15/12/2025</span></p>
                </div>
            </div>
       </div>

       {/* Edit Profile Modal */}
       {isEditing && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                   <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h3 className="font-bold text-slate-800 text-lg">Editar Perfil</h3>
                       <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
                           <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                required
                           />
                       </div>
                       
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                           <input 
                                type="email" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-slate-50 text-slate-500 cursor-not-allowed"
                                disabled
                                title="Entre em contato com o suporte para alterar o email"
                           />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-bold text-slate-700 mb-2">Telefone</label>
                               <input 
                                    type="text" 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-slate-700 mb-2">Localização</label>
                               <input 
                                    type="text" 
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                               />
                           </div>
                       </div>

                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Sobre (Bio)</label>
                           <textarea 
                                value={formData.bio}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all h-24 resize-none"
                           />
                       </div>
                   </form>

                   <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                       <button 
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                       >
                           Cancelar
                       </button>
                       <button 
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-transform active:scale-95"
                       >
                           <Save size={18} />
                           Salvar Alterações
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default Profile;
