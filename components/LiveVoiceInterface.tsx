import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, X, Sparkles, MessageSquareText } from 'lucide-react';
import { hiveService } from '../services/hiveService';

// Fix: Implemented manual encode function as required by Gemini Live API guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Fix: Implemented manual decode function as required by Gemini Live API guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const LiveVoiceInterface: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (inputStreamRef.current) inputStreamRef.current.getTracks().forEach(t => t.stop());
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    setIsConnecting(true);
    // Fix: Always initialize GoogleGenAI using the process.env.API_KEY object parameter
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Preparar dados das colmeias para o contexto da IA
    const hives = hiveService.getHives();
    const contextStr = hives.map(h => 
      `${h.name}: ${h.temperature}°C, ${h.humidity}%, ${h.total_weight}kg. Status: ${h.status}`
    ).join(' | ');

    try {
      // Fix: Following Gemini Live API guidelines for separate input/output contexts and sample rates
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `Você é o Assistente ITI Colmeia. Use estes dados reais das colmeias: ${contextStr}. 
          Responda de forma breve e prestativa em Português. 
          Se o usuário perguntar sobre o estado do apiário, use os dados fornecidos.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            // Iniciar streaming de áudio do microfone
            const source = inputCtx.createMediaStreamSource(stream);
                const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Fix: Properly formatting PCM audio blob using manual encoder and required mimeType (16kHz)
                    const l = inputData.length;
                    const int16 = new Int16Array(l);
                    for (let i = 0; i < l; i++) {
                        int16[i] = inputData[i] * 32768;
                    }
                    const pcmBlob = {
                        data: encode(new Uint8Array(int16.buffer)),
                        mimeType: 'audio/pcm;rate=16000',
                    };

                    // Fix: CRITICAL: Solely rely on sessionPromise resolves to send realtime input
                    sessionPromise.then(s => s.sendRealtimeInput({ 
                        media: pcmBlob 
                    }));
                };
                source.connect(processor);
                processor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
                // Fix: Implemented manual PCM decoding logic instead of native decodeAudioData as per Live API requirements
                const bytes = decode(audioData);
                const dataInt16 = new Int16Array(bytes.buffer);
                const frameCount = dataInt16.length;
                const buffer = outputAudioContextRef.current.createBuffer(1, frameCount, 24000);
                const channelData = buffer.getChannelData(0);
                for (let i = 0; i < frameCount; i++) {
                    channelData[i] = dataInt16[i] / 32768.0;
                }
                
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(outputAudioContextRef.current.destination);
                
                // Fix: Using a running timestamp (nextStartTime) for gapless audio playback
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current = nextStartTimeRef.current + buffer.duration;
            }
          },
          onerror: (e: any) => {
            console.error('Live API Error:', e);
            stopSession();
          },
          onclose: (e: any) => {
            console.log('Live API Closed:', e);
            setIsActive(false);
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="animate-pulse" />
            <h3 className="font-bold">Assistente de Voz Realtime</h3>
          </div>
          <button onClick={() => { stopSession(); onClose(); }} className="p-2 hover:bg-white/20 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center space-y-6">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${isActive ? 'border-amber-500 animate-pulse' : 'border-slate-100'}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300'}`}>
              {isActive ? <Volume2 size={48} /> : <MicOff size={48} />}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-800">
              {isConnecting ? "Conectando ao Gemini..." : isActive ? "Estou ouvindo..." : "Toque para conversar"}
            </h4>
            <p className="text-sm text-slate-500 px-4">
              Pergunte sobre o peso, temperatura ou saúde das suas colmeias em tempo real.
            </p>
          </div>

          {!isActive && !isConnecting && (
            <button 
              onClick={startSession}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all"
            >
              <Mic size={20} /> Iniciar Conversa
            </button>
          )}

          {isActive && (
            <button 
              onClick={stopSession}
              className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-rose-600 transition-all"
            >
              Encerrar
            </button>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tecnologia Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceInterface;