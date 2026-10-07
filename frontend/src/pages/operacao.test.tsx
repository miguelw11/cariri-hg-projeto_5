import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../contexts/AppContext';
import { createDemoState, deleteDemoReason } from '../services/demo';
import type { DemoState } from '../types';
import { Settings } from './Settings';
import { Totem } from './Totem';
import { Dashboard } from './Dashboard';
import type { ReactNode } from 'react';

function render(page: ReactNode, data: DemoState) {
  vi.stubGlobal('navigator', { onLine: true });
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(data) });
  return renderToStaticMarkup(
    <MemoryRouter>
      <AppProvider>{page}</AppProvider>
    </MemoryRouter>,
  );
}
afterEach(() => vi.unstubAllGlobals());

describe('Telas operacionais simplificadas', () => {
  it('oferece exclusão de motivos e não apresenta campos para editar ociosidade', () => {
    const state = { ...createDemoState(), idleLimitSeconds: 900 };
    const html = render(<Settings />, state);
    expect(html).toContain('Excluir Defeito na superfície');
    expect(html).toContain('Ociosidade: 2 minutos');
    expect(html).not.toContain('type="number"');
    expect(html).not.toContain('Salvar parâmetro');
  });

  it('mostra a logo oficial e mantém apenas motivo, quantidade e registro no formulário do Totem', () => {
    const state = deleteDemoReason(createDemoState(), 'surface');
    const html = render(<Totem />, state);
    expect(html).toContain('/brand/hg-industrial.svg');
    expect(html).not.toContain('Defeito na superfície');
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html.match(/type="number"/g)).toHaveLength(1);
    expect(html.match(/type="submit"/g)).toHaveLength(1);
    expect(html).not.toContain('Revisar descarte');
    expect(html).not.toContain('aguardando backend');
  });

  it('mantém a distinção entre diferença atual e perdas de produção encerrada', () => {
    const state = createDemoState();
    const active = render(<Dashboard />, state);
    expect(active).toContain('Diferença atual');
    expect(active).not.toContain('Cada par conta');
    expect(active).not.toContain('Pares de solados');
    state.productions[0] = {
      ...state.productions[0],
      status: 'closed',
      endedAt: new Date().toISOString(),
    };
    const closed = render(<Dashboard />, state);
    expect(closed).toContain('Perdas na E1');
    expect(closed).not.toContain('Diferença atual');
  });
});
