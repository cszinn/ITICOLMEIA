
import { Hive, Alert, SensorLog, Frame } from '../types';

class HiveService {
  private hives: Hive[] = [];

  constructor() {
    this.refreshData();
  }

  private async safeJson(res: Response) {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await res.json();
    }
    const text = await res.text();
    throw new Error(`Resposta inesperada do servidor (Código ${res.status}): ${text.substring(0, 100)}...`);
  }

  async refreshData(): Promise<Hive[]> {
    try {
      const res = await fetch('/api/hives', { 
        method: 'GET',
        cache: 'no-store'
      });
      
      if (!res.ok) {
          console.warn(`Erro ao buscar colmeias: ${res.status}`);
          return this.hives;
      }
      
      const data = await this.safeJson(res);
      if (!Array.isArray(data)) return [];
      
      this.hives = data.map((h: any) => ({
        id: h.id,
        name: h.name,
        location: h.location || 'Local não definido',
        temperature: Number(h.temperature) || 0,
        humidity: Number(h.humidity) || 0,
        total_weight: Number(h.total_weight) || 0,
        last_updated: h.last_updated || h.created_at,
        created_at: h.created_at,
        status: h.status || 'offline',
        frames: (h.frames || []).map((f: any) => ({
            ...f,
            weight: Number(f.weight)
        })).sort((a: any, b: any) => a.position - b.position)
      }));

      return this.hives;
    } catch (e: any) {
      console.error("Fetch error:", e);
      return this.hives;
    }
  }

  getHives(): Hive[] {
    return [...this.hives];
  }

  getAlerts(): Alert[] {
    return [];
  }

  async getHistory(hiveId: string, start?: string, end?: string): Promise<SensorLog[]> {
    try {
      let url = `/api/history?hive_id=${hiveId}`;
      if (start) url += `&start=${encodeURIComponent(start)}`;
      if (end) url += `&end=${encodeURIComponent(end)}`;
      
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await this.safeJson(res);
      return Array.isArray(data) ? data.map(d => ({
          timestamp: d.timestamp,
          temperature: Number(d.temperature),
          humidity: Number(d.humidity),
          total_weight: Number(d.total_weight)
      })) : [];
    } catch (e) {
      return [];
    }
  }

  async processJsonTelemetry(jsonInput: any) {
    try {
      const payload = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await this.safeJson(res).catch(err => ({ error: err.message }));
      
      if (res.status === 404) {
          return { success: false, message: 'AVISO: Colmeia não cadastrada no sistema. Registre-a primeiro.' };
      }

      if (res.ok) {
        await this.refreshData();
        window.dispatchEvent(new Event('storage'));
        return { success: true, message: 'Dados sincronizados com sucesso!' };
      }

      return { success: false, message: result.error || 'Erro desconhecido na telemetria' };
    } catch (e: any) {
      return { success: false, message: `Erro: ${e.message}` };
    }
  }

  async deleteHive(id: string) {
    try {
        const res = await fetch(`/api/hives?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            await this.refreshData();
            window.dispatchEvent(new Event('storage'));
            return { success: true, message: 'Colmeia excluída.' };
        }
        return { success: false, message: 'Erro ao excluir.' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
  }

  async addHive(formData: any) {
    try {
      const res = await fetch('/api/hives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: formData.id,
            name: formData.name,
            location: formData.location,
            num_frames: formData.num_frames || 5
        })
      });
      
      const result = await this.safeJson(res).catch(err => ({ error: err.message }));
      
      if (res.ok) {
          await this.refreshData();
          window.dispatchEvent(new Event('storage'));
          return { success: true, message: 'Colmeia cadastrada com sucesso!' };
      }
      return { success: false, message: result.error || 'Erro ao cadastrar.' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
  }
}

export const hiveService = new HiveService();
