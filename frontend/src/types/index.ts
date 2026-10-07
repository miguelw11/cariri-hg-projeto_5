export type ProductionStatus = 'active' | 'closing' | 'closed';
export interface HourCount { hour: number; input: number; output: number }
export interface IdlePeriod { start: string; end: string }
export interface Production {
  id: string; name: string; shiftId: string; startedAt: string; endedAt?: string;
  status: ProductionStatus; input: number; output: number;
  hourly: HourCount[]; idlePeriods: IdlePeriod[];
}
export interface Reason { id: string; name: string; active: boolean }
export interface Shift { id: string; name: string; start: string; end: string }
export interface Discard {
  eventId: string; productionId: string; reasonId: string; quantity: number;
  createdAt: string; status: 'pending' | 'synced' | 'voided';
}
export interface Device {
  id: string; name: string; role: string; channel: 'Wi-Fi' | 'LoRa' | 'Local' | 'USB';
  state: 'online' | 'contingency' | 'offline'; lastSeen: string; pending: number;
}
export interface DemoState {
  version: 1; productions: Production[]; reasons: Reason[]; shifts: Shift[];
  idleLimitSeconds: number; seedDiscards: Discard[];
}
