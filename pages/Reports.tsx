
import React from 'react';
import { hiveService } from '../services/hiveService';
import { Download, FileText, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  const handleExport = async (hiveId: string) => {
    const history = await hiveService.getHistory(hiveId);
    if (!history.length) {
        alert("Não há dados históricos disponíveis para exportação");
        return;
    }

    const headers = ['Data/Hora', 'Temperatura(C)', 'Umidade(%)', 'PesoTotal(kg)'];
    const rows = history.map(h => [
        h.timestamp,
        h.temperature,
        h.humidity,
        (h.total_weight / 1000).toFixed(3)
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(',') + "\n" + rows.join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dados_colmeia_${hiveId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hives = hiveService.getHives();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Relatórios de Dados</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hives.map(hive => (
            <div key={hive.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <FileText className="text-slate-400" size={24} />
                        <h3 className="font-bold text-slate-800">{hive.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 pl-9">Local: {hive.location} • ID: {hive.id}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded mb-6">
                        <Calendar size={16} />
                        <span>Dados das últimas 24h disponíveis</span>
                    </div>
                </div>

                <button 
                    onClick={() => handleExport(hive.id)}
                    className="w-full flex items-center justify-center space-x-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <Download size={18} />
                    <span>Exportar CSV</span>
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
