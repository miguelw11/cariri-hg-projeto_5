import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Plus, RotateCcw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Brand } from '../components/Layout';
import { Modal } from '../components/ui';
import { number, time } from '../utils/metrics';

export function Totem() {
  const { data, active, localDiscards, storageReady, online, record, undo, notify } = useApp();
  const [reasonId, setReasonId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [busy, setBusy] = useState(false);
  const [undoId, setUndoId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const saving = useRef(false);
  const reasons = data.reasons.filter((r) => r.active && !r.deletedAt);
  const reason = reasons.find((r) => r.id === reasonId);
  const recent = [...localDiscards]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const ready =
    active?.status === 'active' &&
    storageReady &&
    !!reason &&
    Number.isSafeInteger(Number(quantity)) &&
    Number(quantity) > 0 &&
    Number(quantity) <= 9999;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready || saving.current) return;
    saving.current = true;
    setBusy(true);
    setSuccess('');
    try {
      await record(reasonId, Number(quantity));
      setSuccess(
        `${number(Number(quantity))} ${Number(quantity) === 1 ? 'par registrado' : 'pares registrados'} · ${reason.name}`,
      );
      setQuantity('1');
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Não foi possível registrar. Tente novamente.',
        true,
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };

  const revert = async () => {
    if (!undoId || saving.current) return;
    saving.current = true;
    setBusy(true);
    try {
      await undo(undoId);
      setUndoId(null);
      setSuccess('Registro desfeito.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Não foi possível desfazer.', true);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="totem-shell totem-simple">
      <header className="totem-header">
        <Brand />
        <div>
          <span className="totem-connection">
            {online ? 'Modo local · demonstração' : 'Sem rede · modo local'}
          </span>
          <Link to="/dashboard" className="totem-back">
            Voltar ao painel
          </Link>
        </div>
      </header>
      <main className="totem-content" tabIndex={-1}>
        <h1>Registrar descarte</h1>
        {active?.status !== 'active' && (
          <p className="totem-alert" role="status">
            {active?.status === 'closing'
              ? 'Produção em encerramento. Aguarde o responsável.'
              : 'Nenhuma produção em andamento. Avise o responsável.'}
          </p>
        )}
        {!storageReady && (
          <p className="totem-alert" role="status">
            Não é possível salvar neste dispositivo agora. Aguarde ou avise o responsável.
          </p>
        )}
        <form onSubmit={(event) => void submit(event)} className="totem-form">
          <fieldset className="totem-reasons" disabled={busy || active?.status !== 'active'}>
            <legend>Motivo do descarte</legend>
            {reasons.length ? (
              <div className="reason-options">
                {reasons.map((r) => (
                  <label
                    key={r.id}
                    className={`reason-option ${reasonId === r.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.id}
                      checked={reasonId === r.id}
                      onChange={() => {
                        setReasonId(r.id);
                        setSuccess('');
                      }}
                      required
                    />
                    <span>{r.name}</span>
                    {reasonId === r.id && <Check size={20} aria-hidden="true" />}
                  </label>
                ))}
              </div>
            ) : (
              <p className="totem-alert">Nenhum motivo disponível. Avise o responsável.</p>
            )}
          </fieldset>
          <label className="quantity-label" htmlFor="discard-quantity">
            Quantidade de pares
          </label>
          <div className="quantity-control">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              disabled={busy || Number(quantity) <= 1}
              onClick={() => {
                setQuantity(String(Math.max(1, Number(quantity) - 1)));
                setSuccess('');
              }}
            >
              <Minus size={25} />
            </button>
            <input
              id="discard-quantity"
              type="number"
              inputMode="numeric"
              min="1"
              max="9999"
              step="1"
              required
              disabled={busy}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setSuccess('');
              }}
            />
            <button
              type="button"
              aria-label="Aumentar quantidade"
              disabled={busy || Number(quantity) >= 9999}
              onClick={() => {
                setQuantity(String(Math.min(9999, Number(quantity || 0) + 1)));
                setSuccess('');
              }}
            >
              <Plus size={25} />
            </button>
          </div>
          <button className="button primary totem-register" type="submit" disabled={!ready || busy}>
            {busy ? 'Registrando…' : 'Registrar descarte'}
          </button>
          <div className="totem-success" role="status">
            {success && (
              <>
                <Check size={20} />
                {success}
              </>
            )}
          </div>
        </form>
        {recent.length > 0 && (
          <details className="totem-history">
            <summary>Últimos registros</summary>
            <ul>
              {recent.map((r) => (
                <li key={r.eventId}>
                  <div>
                    <strong>
                      {number(r.quantity)} {r.quantity === 1 ? 'par' : 'pares'} ·{' '}
                      {data.reasons.find((item) => item.id === r.reasonId)?.name ??
                        'Motivo excluído'}
                    </strong>
                    <small>
                      {time(r.createdAt)} ·{' '}
                      {r.status === 'voided'
                        ? 'Desfeito'
                        : r.status === 'synced'
                          ? 'Enviado'
                          : 'Salvo no dispositivo'}
                    </small>
                  </div>
                  {r.status === 'pending' && (
                    <button
                      className="button table-button"
                      disabled={busy}
                      onClick={() => setUndoId(r.eventId)}
                    >
                      <RotateCcw size={15} />
                      Desfazer
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </main>
      {undoId && (
        <Modal
          title="Desfazer registro?"
          onClose={() => {
            if (!busy) setUndoId(null);
          }}
        >
          <p>Este descarte deixará de contar no total.</p>
          <div className="form-actions">
            <button className="button secondary" disabled={busy} onClick={() => setUndoId(null)}>
              Cancelar
            </button>
            <button className="button danger" disabled={busy} onClick={() => void revert()}>
              {busy ? 'Desfazendo…' : 'Desfazer'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
