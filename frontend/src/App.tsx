import { useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Layout } from './components/Layout';
import { Empty, Toast } from './components/ui';
import { Dashboard } from './pages/Dashboard';
import { ProductionPage } from './pages/Production';
import { Reports } from './pages/Reports';
import { Devices } from './pages/Devices';
import { Settings } from './pages/Settings';
import { Totem } from './pages/Totem';
export function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const names: Record<string, string> = { '/dashboard': 'Dashboard', '/producao': 'Produção', '/relatorios': 'Relatórios', '/dispositivos': 'Dispositivos', '/configuracoes': 'Configurações', '/totem': 'Totem' };
    document.title = `${names[pathname] ?? 'Monitoramento E1'} | HG Industrial`;
    document.querySelector<HTMLElement>('main')?.focus();
  }, [pathname]);
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW();
  return <><Routes><Route element={<Layout/>}><Route index element={<Navigate to="/dashboard" replace/>}/><Route path="dashboard" element={<Dashboard/>}/><Route path="producao" element={<ProductionPage/>}/><Route path="relatorios" element={<Reports/>}/><Route path="dispositivos" element={<Devices/>}/><Route path="configuracoes" element={<Settings/>}/><Route path="*" element={<Empty title="Página não encontrada" description="Escolha um módulo no menu ou retorne ao Dashboard."><Link className="button primary" to="/dashboard">Voltar ao Dashboard</Link></Empty>}/></Route><Route path="totem" element={<Totem/>}/></Routes><Toast/>{needRefresh && <div className="update-banner" role="status"><p>Uma atualização está disponível. Termine o lançamento antes de atualizar.</p><button className="button primary" onClick={() => void updateServiceWorker(true)}>Atualizar</button><button className="button secondary" onClick={() => setNeedRefresh(false)}>Depois</button></div>}</>;
}
