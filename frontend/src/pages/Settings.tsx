import { useState, type FormEvent } from 'react';
import { Clock3, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Badge, Modal, PageHeading, Panel, safeAction } from '../components/ui';
import { IDLE_LIMIT_SECONDS } from '../services/demo';
import type { Reason, Shift } from '../types';

export function Settings() {
  const { data, saveReasons, saveShifts, deleteReason, notify } = useApp();
  const [reason, setReason] = useState<Reason | null>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState<Reason | null>(null);
  const reasons = data.reasons.filter((r) => !r.deletedAt);

  const submitReason = (event: FormEvent) => {
    event.preventDefault();
    if (!reason) return;
    const name = reason.name.trim();
    if (
      !name ||
      reasons.some(
        (r) =>
          r.id !== reason.id &&
          r.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'),
      )
    ) {
      notify('Informe um motivo com nome único.', true);
      return;
    }
    safeAction(() => {
      saveReasons(
        data.reasons.some((r) => r.id === reason.id)
          ? data.reasons.map((r) => (r.id === reason.id ? { ...reason, name } : r))
          : [...data.reasons, { ...reason, name }],
      );
      setReason(null);
    }, notify);
  };

  const submitShift = (event: FormEvent) => {
    event.preventDefault();
    if (!shift) return;
    const name = shift.name.trim();
    if (
      !name ||
      shift.start === shift.end ||
      data.shifts.some(
        (s) =>
          s.id !== shift.id &&
          s.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'),
      )
    ) {
      notify('Informe um nome único e horários distintos para o turno.', true);
      return;
    }
    safeAction(() => {
      saveShifts(
        data.shifts.some((s) => s.id === shift.id)
          ? data.shifts.map((s) => (s.id === shift.id ? { ...shift, name } : s))
          : [...data.shifts, { ...shift, name }],
      );
      setShift(null);
    }, notify);
  };

  return (
    <>
      <PageHeading
        eyebrow="ESTEIRA E1"
        title="Configurações"
        description="Motivos de descarte e turnos de trabalho."
      />
      <Panel
        title="Motivos de descarte"
        subtitle="Os motivos ativos aparecem no Totem."
        action={
          <button
            className="button secondary"
            onClick={() => setReason({ id: crypto.randomUUID(), name: '', active: true })}
          >
            <Plus size={16} />
            Novo motivo
          </button>
        }
      >
        <div className="settings-list">
          {reasons.map((r) => (
            <div key={r.id}>
              <div>
                <strong>{r.name}</strong>
              </div>
              <Badge tone={r.active ? 'success' : 'neutral'}>
                {r.active ? 'Ativo' : 'Inativo'}
              </Badge>
              <button
                className="icon-button"
                aria-label={`Editar ${r.name}`}
                onClick={() => setReason({ ...r })}
              >
                <Pencil size={17} />
              </button>
              <button
                className="button table-button"
                onClick={() =>
                  safeAction(
                    () =>
                      saveReasons(
                        data.reasons.map((item) =>
                          item.id === r.id ? { ...item, active: !item.active } : item,
                        ),
                      ),
                    notify,
                  )
                }
              >
                {r.active ? 'Desativar' : 'Ativar'}
              </button>
              <button
                className="button table-button delete-button"
                aria-label={`Excluir ${r.name}`}
                onClick={() => setDeleting(r)}
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          ))}
        </div>
        {!reasons.length && (
          <p className="muted">Nenhum motivo cadastrado. Adicione um motivo para usar o Totem.</p>
        )}
      </Panel>
      <Panel
        title="Turnos de trabalho"
        action={
          <button
            className="button secondary"
            onClick={() =>
              setShift({ id: crypto.randomUUID(), name: '', start: '07:00', end: '15:00' })
            }
          >
            <Plus size={16} />
            Novo turno
          </button>
        }
      >
        <div className="settings-list">
          {data.shifts.map((s) => (
            <div key={s.id}>
              <Clock3 size={20} className="muted" />
              <div>
                <strong>{s.name}</strong>
                <small>
                  {s.start}–{s.end}
                  {s.start > s.end ? ' · termina no dia seguinte' : ''}
                </small>
              </div>
              <button
                className="icon-button"
                aria-label={`Editar ${s.name}`}
                onClick={() => setShift({ ...s })}
              >
                <Pencil size={17} />
              </button>
            </div>
          ))}
        </div>
      </Panel>
      <p className="preset-note">
        Ociosidade: {IDLE_LIMIT_SECONDS / 60} minutos sem eventos. Valor predefinido.
      </p>
      {reason && (
        <Modal
          title={reasons.some((r) => r.id === reason.id) ? 'Editar motivo' : 'Novo motivo'}
          onClose={() => setReason(null)}
        >
          <form onSubmit={submitReason}>
            <label className="field">
              Nome do motivo
              <input
                autoFocus
                required
                maxLength={60}
                value={reason.name}
                onChange={(e) => setReason({ ...reason, name: e.target.value })}
              />
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={reason.active}
                onChange={(e) => setReason({ ...reason, active: e.target.checked })}
              />
              Disponível para novos registros
            </label>
            <div className="form-actions">
              <button type="button" className="button secondary" onClick={() => setReason(null)}>
                Cancelar
              </button>
              <button className="button primary" type="submit">
                <Save size={16} />
                Salvar motivo
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Excluir motivo?" onClose={() => setDeleting(null)}>
          <p>
            O motivo <strong>{deleting.name}</strong> sairá do cadastro e não aparecerá mais no
            Totem.
          </p>
          <p className="muted">
            Os descartes já registrados continuarão no histórico com o mesmo motivo.
          </p>
          <div className="form-actions">
            <button className="button secondary" onClick={() => setDeleting(null)}>
              Cancelar
            </button>
            <button
              className="button danger"
              onClick={() =>
                safeAction(() => {
                  deleteReason(deleting.id);
                  setDeleting(null);
                }, notify)
              }
            >
              <Trash2 size={16} />
              Excluir motivo
            </button>
          </div>
        </Modal>
      )}
      {shift && (
        <Modal
          title={data.shifts.some((s) => s.id === shift.id) ? 'Editar turno' : 'Novo turno'}
          onClose={() => setShift(null)}
        >
          <form onSubmit={submitShift}>
            <label className="field">
              Nome do turno
              <input
                autoFocus
                required
                maxLength={40}
                value={shift.name}
                onChange={(e) => setShift({ ...shift, name: e.target.value })}
              />
            </label>
            <div className="two-columns">
              <label className="field">
                Início
                <input
                  type="time"
                  required
                  value={shift.start}
                  onChange={(e) => setShift({ ...shift, start: e.target.value })}
                />
              </label>
              <label className="field">
                Fim
                <input
                  type="time"
                  required
                  value={shift.end}
                  onChange={(e) => setShift({ ...shift, end: e.target.value })}
                />
              </label>
            </div>
            <p className="muted">
              Quando o fim é anterior ao início, o turno termina no dia seguinte.
            </p>
            <div className="form-actions">
              <button type="button" className="button secondary" onClick={() => setShift(null)}>
                Cancelar
              </button>
              <button className="button primary" type="submit">
                <Save size={16} />
                Salvar turno
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
