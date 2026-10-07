import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CloudOff, Database, Minus, Monitor, Plus, RotateCcw, ScanLine } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Brand } from '../components/Layout';
import { Badge, Empty, Modal, Notice, Panel } from '../components/ui';
import { date, number, time } from '../utils/metrics';

export function Totem() {
  const { data, active, localDiscards, storageReady, online, record, undo, notify } = useApp();
  const [reasonId, setReasonId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [undoId, setUndoId] = useState<string | null>(null);
  const reasons = data.reasons.filter(r => r.active);
  const reason = reasons.find(r => r.id === reasonId);
  const pending = localDiscards.filter(r => r.status === 'pending');
  const recent = [...localDiscards].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const ready = active?.status === 'active' && storageReady && !!reason && Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0 && Number(quantity) <= 9999;
  const submit = (event: FormEvent) => { event.preventDefault(); if (ready) setConfirm(true); };
  const save = async () => {
    if (!ready || busy) return;
    setBusy(true);
    try { await record(reasonId, Number(quantity)); setConfirm(false); setReasonId(''); setQuantity('1'); }
    catch (e) { notify(e instanceof Error ? e.message : 'Não foi possível salvar. O registro não foi confirmado.', true); }
    finally { setBusy(false); }
  };
  const revert = async () => {
    if (!undoId || busy) return;
    setBusy(true);
    try { await undo(undoId); setUndoId(null); }
    catch (e) { notify(e instanceof Error ? e.message : 'Não foi possível desfazer o lançamento.', true); }
    finally { setBusy(false); }
  };
  return <div className="totem-shell"><header className="totem-header"><Brand/><div><Badge tone={online ? 'blue' : 'warning'}>{online ? 'Demonstração · modo local' : 'Sem rede · modo local'}</Badge><Link to="/dashboard" className="button secondary"><ArrowLeft size={17}/>Voltar ao painel</Link></div></header><main className="totem-content" tabIndex={-1}><header className="totem-title"><div className="eyebrow"><Monitor size={15}/>POSTO DE TRIAGEM · ESTEIRA E1</div><h1>Registrar descarte</h1><p>Selecione o motivo, informe os pares e confirme.</p></header><div className="totem-production"><span className="status-dot"/><div><strong>{active ? active.name : 'Sem produção ativa'}</strong><small>{active ? `${active.id} · ${active.status === 'closing' ? 'Encerramento solicitado — novos lançamentos bloqueados' : 'Os descartes serão associados a esta produção'}` : 'Inicie uma produção no painel para registrar descartes.'}</small></div><Badge tone="blue">Dados demonstrativos</Badge></div>
    {!storageReady && <Notice>O armazenamento local ainda não está disponível. Os registros ficam bloqueados até ele estar pronto.</Notice>}
    <form onSubmit={submit} className="totem-form"><section className="totem-step"><h2><span>1</span>Qual o motivo?</h2>{reasons.length ? <div className="reason-options" role="group" aria-label="Motivo de descarte">{reasons.map((r, i) => <button key={r.id} type="button" className={`reason-option ${reasonId === r.id ? 'selected' : ''}`} aria-pressed={reasonId === r.id} onClick={() => setReasonId(r.id)} disabled={active?.status !== 'active'}><span className="reason-option-icon"><ScanLine size={24}/></span><strong>{r.name}</strong><span className="reason-option-number">0{i + 1}</span>{reasonId === r.id && <Check className="reason-check" size={20}/>}</button>)}</div> : <Empty title="Nenhum motivo ativo" description="Cadastre ou ative um motivo em Configurações."/>}</section><section className="totem-step quantity-step"><h2><span>2</span>Quantos pares?</h2><div className="quantity-control"><button type="button" aria-label="Diminuir quantidade" disabled={Number(quantity) <= 1} onClick={() => setQuantity(String(Math.max(1, Number(quantity) - 1)))}><Minus size={27}/></button><label><span className="sr-only">Quantidade de pares</span><input type="number" inputMode="numeric" min="1" max="9999" step="1" required value={quantity} onChange={e => setQuantity(e.target.value)}/><small>pares de solados</small></label><button type="button" aria-label="Aumentar quantidade" disabled={Number(quantity) >= 9999} onClick={() => setQuantity(String(Math.min(9999, Number(quantity || 0) + 1)))}><Plus size={27}/></button></div><div className="quantity-shortcuts">{[1, 5, 10, 20].map(n => <button type="button" key={n} className={Number(quantity) === n ? 'selected' : ''} onClick={() => setQuantity(String(n))}>{n} {n === 1 ? 'par' : 'pares'}</button>)}</div></section><div className="totem-submit"><span><Database size={18}/>Salvo no dispositivo até confirmação do servidor</span><button className="button primary" type="submit" disabled={!ready || busy}>Revisar descarte<ArrowRight size={20}/></button></div></form>
    <div className="totem-pending"><CloudOff size={21}/><div><strong>{pending.length} {pending.length === 1 ? 'registro aguardando' : 'registros aguardando'} backend</strong><p>A rede disponível não confirma comunicação com o servidor. Nesta versão, os lançamentos permanecem locais.</p></div></div><Panel title="Últimos lançamentos neste dispositivo" subtitle="Registros locais demonstrativos · os exemplos do Dashboard não aparecem nesta lista.">{recent.length ? <div className="table-scroll"><table><thead><tr><th>Motivo</th><th>Quantidade</th><th>Horário</th><th>Status</th><th><span className="sr-only">Correção</span></th></tr></thead><tbody>{recent.map(r => <tr key={r.eventId}><td><strong>{data.reasons.find(reason => reason.id === r.reasonId)?.name ?? 'Motivo não disponível'}</strong><small>{r.productionId}</small></td><td>{number(r.quantity)} pares</td><td>{time(r.createdAt)}<small>{date(r.createdAt)}</small></td><td><Badge tone={r.status === 'voided' ? 'neutral' : r.status === 'pending' ? 'warning' : 'success'}>{r.status === 'voided' ? 'Desfeito' : r.status === 'pending' ? 'Salvo localmente' : 'Sincronizado'}</Badge></td><td>{r.status === 'pending' && <button type="button" className="button table-button" disabled={busy} onClick={() => setUndoId(r.eventId)}><RotateCcw size={15}/>Desfazer</button>}</td></tr>)}</tbody></table></div> : <Empty title="Nenhum lançamento local ainda" description="Os descartes registrados aqui aparecerão nesta lista."/>}</Panel>
    </main><footer className="totem-footer">HG Industrial · Triagem E1 · 1 unidade = 1 par de solados</footer>
    {confirm && <Modal title="Confirmar descarte" onClose={() => { if (!busy) setConfirm(false); }}><div className="confirm-discard"><ScanLine size={32}/><strong>{number(Number(quantity))} {Number(quantity) === 1 ? 'par' : 'pares'}</strong><span>{reason?.name ?? 'Motivo indisponível'}</span></div><p className="muted">Produção: {active?.id}. Data e horário serão registrados automaticamente ao salvar.</p><Notice>Este lançamento será salvo localmente. A sincronização real aguarda a integração do backend.</Notice><div className="form-actions"><button className="button secondary" disabled={busy} onClick={() => setConfirm(false)}>Revisar</button><button className="button primary" disabled={!ready || busy} onClick={() => void save()}><Check size={18}/>{busy ? 'Salvando…' : 'Confirmar e salvar'}</button></div></Modal>}
    {undoId && <Modal title="Desfazer lançamento local" onClose={() => { if (!busy) setUndoId(null); }}><p>O lançamento deixará de contar nos indicadores. Ele continuará no histórico como desfeito.</p><p className="muted">Para corrigir a quantidade ou o motivo, desfaça e registre novamente. Correções de dados já sincronizados dependerão das permissões e da API.</p><div className="form-actions"><button className="button secondary" disabled={busy} onClick={() => setUndoId(null)}>Cancelar</button><button className="button danger" disabled={busy} onClick={() => void revert()}>{busy ? 'Desfazendo…' : 'Desfazer lançamento'}</button></div></Modal>}
  </div>;
}
