
import React from 'react';
import { Hive } from '../types';
import { Thermometer, Droplets, Scale, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HiveCardProps {
  hive: Hive;
}

const HiveCard: React.FC<HiveCardProps> = ({ hive }) => {
  const statusColors = {
    healthy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    critical: 'bg-rose-100 text-rose-800 border-rose-200',
    offline: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  const statusDot = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
    offline: 'bg-rose-500'
  };

  const statusText = {
      healthy: 'SAUDÁVEL',
      warning: 'ATENÇÃO',
      critical: 'CRÍTICO',
      offline: 'OFFLINE'
  };

  const formatWeight = (kg: number) => {
    return kg.toFixed(3);
  };

  return (
    <Link to={`/hive/${hive.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md hover:border-amber-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
              {hive.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">{hive.id}</p>
            <p className="text-sm text-slate-500">{hive.location}</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusColors[hive.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[hive.status]}`} />
            {statusText[hive.status]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
            {/* Fix: Corrected typo from Thermomter to Thermometer */}
            <Thermometer size={18} className="text-rose-500 mb-1" />
            <span className="text-lg font-semibold text-slate-700">{hive.temperature.toFixed(1)}°C</span>
            <span className="text-xs text-slate-400">Temp</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
            <Droplets size={18} className="text-blue-500 mb-1" />
            <span className="text-lg font-semibold text-slate-700">{hive.humidity.toFixed(0)}%</span>
            <span className="text-xs text-slate-400">Umidade</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
            <Scale size={18} className="text-amber-600 mb-1" />
            <span className="text-lg font-semibold text-slate-700">{formatWeight(hive.total_weight / 1000)}kg</span>
            <span className="text-xs text-slate-400">Peso</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Atualizado: {new Date(hive.last_updated).toLocaleTimeString()}</span>
            <span className="flex items-center text-amber-600 font-medium group-hover:underline">
                Ver Detalhes <Activity size={12} className="ml-1" />
            </span>
        </div>
      </div>
    </Link>
  );
};

export default HiveCard;
