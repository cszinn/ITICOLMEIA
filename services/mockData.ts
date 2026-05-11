
import { Hive, Alert, SensorLog } from '../types';

// Arrays vazios para iniciar o sistema zerado
export const INITIAL_HIVES: Hive[] = [];

export const MOCK_ALERTS: Alert[] = [];

// Gera histórico realista baseado nos dados atuais da colmeia
export const generateHistory = (hiveId: string, days = 1, baseTemp = 35, baseHum = 55, baseWeight = 20): SensorLog[] => {
  const history: SensorLog[] = [];
  const now = Date.now();
  
  // Define o número de pontos dependendo do intervalo
  const points = days === 1 ? 24 : days === 7 ? 56 : 30; 
  const interval = (days * 24 * 3600000) / points;

  for (let i = points; i >= 0; i--) {
    const timeOffset = i * interval;
    const date = new Date(now - timeOffset);
    const hour = date.getHours();
    
    // Simulação de ciclo circadiano (mais quente de dia, mais frio de noite)
    const dayFactor = Math.sin((hour - 6) * Math.PI / 12); // Pico às 12h-15h
    
    // Temperatura: base + variação diária + ruído aleatório
    const tempVariation = (dayFactor * 2) + (Math.random() * 0.5 - 0.25);
    const simulatedTemp = baseTemp + tempVariation;

    // Umidade: inversa à temperatura + ruído
    const humVariation = (-dayFactor * 10) + (Math.random() * 4 - 2);
    const simulatedHum = Math.max(20, Math.min(100, baseHum + humVariation));

    // Peso: Varia levemente ao longo do tempo (simulando produção ou consumo)
    const weightTrend = (points - i) * 0.02; // Leve ganho de peso ao longo do tempo
    const weightNoise = (Math.random() * 0.1 - 0.05);
    const simulatedWeight = baseWeight - weightTrend + weightNoise;

    history.push({
      timestamp: date.toISOString(),
      temperature: Number(simulatedTemp.toFixed(1)),
      humidity: Math.floor(simulatedHum),
      // Fix: Changed totalWeight to total_weight to match SensorLog interface
      total_weight: Number(simulatedWeight.toFixed(2)),
    });
  }
  return history;
};