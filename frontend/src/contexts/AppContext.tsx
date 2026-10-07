import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { DemoState, Discard, Production, Reason, Shift } from '../types';
import { createDemoState, demoDevices } from '../services/demo';
import { changePendingDiscard, readDiscards, saveDiscard } from '../services/storage';
import { hourOf } from '../utils/metrics';

const KEY = 'hg-industrial-demo-v1';
function load(): { data: DemoState; warning?: string } {
  try {
    const saved = localStorage.getItem(KEY);
    if (!saved) return { data: createDemoState() };
    const parsed = JSON.parse(saved) as DemoState;
    if (parsed.version !== 1 || !Array.isArray(parsed.productions) || !Array.isArray(parsed.reasons) || !Array.isArray(parsed.shifts) || !Array.isArray(parsed.seedDiscards)) throw new Error();
    return { data: parsed };
  } catch { return { data: createDemoState(), warning: 'Não foi possível restaurar a demonstração. O armazenamento de descartes será carregado separadamente.' }; }
}
interface ContextValue {
  data: DemoState; discards: Discard[]; localDiscards: Discard[]; storageReady: boolean; online: boolean;
  devices: ReturnType<typeof demoDevices>; active: Production | undefined;
  notice: { message: string; error: boolean } | null;
  notify: (message: string, error?: boolean) => void;
  start: (name: string, shiftId: string) => void;
  requestClose: () => void; cancelClose: () => void; close: () => void;
  simulate: () => void;
  record: (reasonId: string, quantity: number) => Promise<void>;
  undo: (eventId: string) => Promise<void>;
  saveReasons: (reasons: Reason[]) => void;
  saveShifts: (shifts: Shift[]) => void;
  saveLimit: (seconds: number) => void;
}
const Context = createContext<ContextValue | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load);
  const [data, setData] = useState(initial.data);
  const current = useRef(data);
  const [localDiscards, setLocalDiscards] = useState<Discard[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [notice, setNotice] = useState<ContextValue['notice']>(initial.warning ? { message: initial.warning, error: true } : null);
  const [devices] = useState(demoDevices);
  const notify = (message: string, error = false) => setNotice({ message, error });
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), notice.error ? 10000 : 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    let mounted = true;
    try { if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify(current.current)); }
    catch { notify('Não foi possível persistir a demonstração. Verifique o armazenamento do navegador.', true); }
    const refresh = () => readDiscards().then(records => { if (mounted) { setLocalDiscards(records); setStorageReady(true); } }).catch(() => { if (mounted) { setStorageReady(false); notify('Armazenamento local indisponível. Os lançamentos foram bloqueados para evitar perda de registros.', true); } });
    void refresh();
    const connection = () => setOnline(navigator.onLine);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    window.addEventListener('focus', refresh);
    const storage = (event: StorageEvent) => {
      if (event.key === KEY) { const next = load(); current.current = next.data; setData(next.data); }
    };
    window.addEventListener('storage', storage);
    return () => { mounted = false; window.removeEventListener('online', connection); window.removeEventListener('offline', connection); window.removeEventListener('focus', refresh); window.removeEventListener('storage', storage); };
  }, []);
  const commit = (change: (old: DemoState) => DemoState) => {
    const next = change(current.current);
    // Save before reporting success; quota/private mode errors do not silently lose data.
    localStorage.setItem(KEY, JSON.stringify(next));
    current.current = next;
    setData(next);
  };
  const active = data.productions.find(p => p.status !== 'closed');
  const updateActive = (transform: (p: Production) => Production) => commit(old => {
    if (!old.productions.some(p => p.status !== 'closed')) throw new Error('Nenhuma produção ativa.');
    return { ...old, productions: old.productions.map(p => p.status !== 'closed' ? transform(p) : p) };
  });
  const value: ContextValue = {
    data, discards: [...data.seedDiscards, ...localDiscards], localDiscards, storageReady, online, devices, active, notice, notify,
    start: (name, shiftId) => {
      if (!name.trim() || !current.current.shifts.some(s => s.id === shiftId)) throw new Error('Informe o nome e um turno válido.');
      commit(old => {
        if (old.productions.some(p => p.status !== 'closed')) throw new Error('Encerre a produção atual antes de iniciar outra.');
        return { ...old, productions: [{ id: `E1-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name: name.trim(), shiftId, status: 'active', startedAt: new Date().toISOString(), input: 0, output: 0, hourly: [], idlePeriods: [] }, ...old.productions] };
      });
      notify('Produção demonstrativa iniciada.');
    },
    requestClose: () => updateActive(p => ({ ...p, status: 'closing' })),
    cancelClose: () => updateActive(p => ({ ...p, status: 'active' })),
    close: () => {
      updateActive(p => {
        if (p.status !== 'closing') throw new Error('Solicite o encerramento primeiro.');
        return { ...p, status: 'closed', endedAt: new Date().toISOString() };
      });
      notify('Produção demonstrativa encerrada. Resultado consolidado disponível.');
    },
    simulate: () => {
      updateActive(p => {
        const hour = hourOf(new Date().toISOString());
        const output = Math.min(20, p.input - p.output + 24);
        const row = p.hourly.find(r => r.hour === hour);
        return { ...p, input: p.input + 24, output: p.output + output, hourly: row ? p.hourly.map(r => r.hour === hour ? { ...r, input: r.input + 24, output: r.output + output } : r) : [...p.hourly, { hour, input: 24, output }] };
      });
      notify('Eventos demonstrativos adicionados: 24 entradas e até 20 saídas.');
    },
    record: async (reasonId, quantity) => {
      const production = current.current.productions.find(p => p.status === 'active');
      if (!production) throw new Error('Não há produção ativa disponível para registrar descartes.');
      if (!current.current.reasons.some(r => r.id === reasonId && r.active)) throw new Error('Selecione um motivo ativo.');
      const saved: Discard = { eventId: crypto.randomUUID(), productionId: production.id, reasonId, quantity, createdAt: new Date().toISOString(), status: 'pending' };
      await saveDiscard(saved);
      setLocalDiscards(old => [...old.filter(r => r.eventId !== saved.eventId), saved]);
      notify('Descarte salvo neste dispositivo. Aguardando integração com o backend.');
    },
    undo: async eventId => {
      await changePendingDiscard(eventId, 'voided');
      setLocalDiscards(old => old.map(r => r.eventId === eventId ? { ...r, status: 'voided' } : r));
      notify('Lançamento local desfeito. O registro permanece no histórico.');
    },
    saveReasons: reasons => { commit(old => ({ ...old, reasons })); notify('Motivos salvos na demonstração.'); },
    saveShifts: shifts => { commit(old => ({ ...old, shifts })); notify('Turnos salvos na demonstração.'); },
    saveLimit: seconds => {
      if (!Number.isSafeInteger(seconds) || seconds < 10 || seconds > 3600) throw new Error('Informe um limite entre 10 e 3.600 segundos.');
      commit(old => ({ ...old, idleLimitSeconds: seconds })); notify('Limite salvo na demonstração.');
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() { const value = useContext(Context); if (!value) throw new Error('AppProvider ausente.'); return value; }
