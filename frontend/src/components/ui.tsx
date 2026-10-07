import { useEffect, useRef, type ReactNode } from 'react';
import { AlertCircle, ArrowUpRight, Inbox, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'blue';
}) {
  return (
    <span className={`badge ${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="heading-actions">{action}</div>}
    </header>
  );
}
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
export function Stat({
  label,
  value,
  note,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <article className={`stat ${accent ? 'stat-accent' : ''}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Inbox size={34} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="inline-notice">
      <AlertCircle size={18} />
      <span>{children}</span>
    </div>
  );
}
export function TextLink({ children }: { children: ReactNode }) {
  return (
    <span className="text-link">
      {children}
      <ArrowUpRight size={16} />
    </span>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id="modal-title">{title}</h2>
        <button type="button" className="icon-button" aria-label="Fechar janela" onClick={onClose}>
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Toast() {
  const { notice } = useApp();
  return (
    <div aria-live="polite" aria-atomic="true" className="toast-region">
      {notice && (
        <div className={`toast ${notice.error ? 'toast-error' : ''}`}>
          <AlertCircle size={20} />
          {notice.message}
        </div>
      )}
    </div>
  );
}
export function safeAction(action: () => void, notify: (message: string, error?: boolean) => void) {
  try {
    action();
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Não foi possível concluir a ação.', true);
  }
}
