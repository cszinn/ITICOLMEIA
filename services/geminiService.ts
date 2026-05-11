
import { GoogleGenAI } from "@google/genai";
import { Hive, SensorLog } from '../types';

export const analyzeHiveHealth = async (hive: Hive, history: SensorLog[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const simpleHistory = history.slice(-12).map(h => ({
        time: h.timestamp.split('T')[1].substring(0, 5),
        t: h.temperature,
        h: h.humidity,
        w: h.total_weight
    }));

    const framesWeights = (hive.frames || []).map(f => `Favo ${f.position}: ${f.weight.toFixed(1)}g`).join(', ');

    const promptText = `
    Atue como um especialista em apicultura e IoT. Analise a saúde desta colmeia:
    
    Colmeia: ${hive.name}
    Status: ${hive.status}
    Temp Atual: ${hive.temperature.toFixed(1)}°C
    Umidade: ${hive.humidity.toFixed(0)}%
    Peso Total: ${(hive.total_weight / 1000).toFixed(2)}kg
    Detalhes dos Favos: ${framesWeights}

    Histórico Recente (Últimas 12 leituras):
    ${JSON.stringify(simpleHistory)}

    Responda em PT-BR de forma concisa e técnica:
    1. Avaliação rápida da saúde da colônia.
    2. Duas recomendações práticas imediatas para o apicultor.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: promptText }] }],
        });
        return response.text || "Análise indisponível no momento.";
    } catch (error: any) {
        console.error("Gemini Error:", error);
        return `Erro na análise de IA: ${error.message || "Erro de conexão"}`;
    }
};
