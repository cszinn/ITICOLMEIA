
export interface Frame {
  id?: number;
  hive_id: string;
  position: number;
  weight: number; // em kg (armazenado como numeric no banco)
  last_updated?: string;
  is_abnormal?: boolean; // campo calculado no frontend
}

export interface Hive {
  id: string; // Formato COLMEIA123
  name: string;
  location: string;
  temperature: number;
  humidity: number;
  total_weight: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  created_at: string;
  last_updated: string;
  frames?: Frame[];
}

export interface Alert {
  id: string;
  hiveId: string;
  hiveName: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
}

export interface SensorLog {
  timestamp: string;
  temperature: number;
  humidity: number;
  total_weight: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
}