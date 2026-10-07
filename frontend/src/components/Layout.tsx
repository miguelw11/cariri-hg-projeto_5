import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Activity, ArrowUpRight, ChartNoAxesCombined, ChevronRight, Factory, LayoutDashboard, Menu, Monitor, Radio, Settings2, X } from 'lucide-react';
import { Badge } from './ui';
const links = [
  { to: '/dashboard', text: 'Dashboard', icon: LayoutDashboard },
  { to: '/producao', text: 'Produção', icon: Factory },
  { to: '/relatorios', text: 'Relatórios', icon: ChartNoAxesCombined },
  { to: '/dispositivos', text: 'Dispositivos', icon: Radio },
  { to: '/configuracoes', text: 'Configurações', icon: Settings2 },
];
export function Brand() { return <div className="brand"><span className="brand-mark">HG<span/></span><div><strong>HG INDUSTRIAL</strong><small>CONTROLE DE PRODUÇÃO</small></div></div>; }
export function Layout() {
  const [open, setOpen] = useState(false);
  return <div className="app-shell"><a className="skip-link" href="#main">Pular para o conteúdo</a>{open && <button className="sidebar-overlay" aria-label="Fechar menu" onClick={() => setOpen(false)}/>}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}><Link to="/dashboard" className="brand-link" onClick={() => setOpen(false)}><Brand/></Link><button className="mobile-close icon-button" aria-label="Fechar menu" onClick={() => setOpen(false)}><X/></button><div className="nav-caption">ESPAÇO DE TRABALHO</div><nav aria-label="Navegação principal">{links.map(({ to, text, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)}><Icon size={20}/>{text}<ChevronRight className="nav-chevron" size={15}/></NavLink>)}</nav><div className="sidebar-totem"><div className="totem-icon"><Monitor size={22}/></div><h3>Triagem simplificada</h3><p>Registre os descartes direto no posto de trabalho.</p><Link to="/totem">Abrir Totem<ArrowUpRight size={16}/></Link></div><footer className="sidebar-footer"><span className="line-icon"><Activity size={18}/></span><div><strong>Esteira E1</strong><small>Unidade de produção</small></div><span className="status-dot"/></footer></aside>
    <div className="workspace"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(!open)}><Menu size={22}/></button><span>Operação industrial</span><ChevronRight size={14}/><strong>Esteira E1</strong></div><div className="topbar-right"><Badge tone="blue">Demonstração</Badge><div className="operator-avatar" title="Ambiente demonstrativo">HG</div></div></header><div className="demo-strip"><span className="status-dot"/><strong>Ambiente demonstrativo</strong><span>Dados de exemplo e alterações salvas neste dispositivo.</span></div><main id="main" className="main-content" tabIndex={-1}><Outlet/></main><footer className="workspace-footer"><span>HG Industrial · Monitoramento E1</span><span>1 unidade = 1 par de solados</span></footer></div></div>;
}
