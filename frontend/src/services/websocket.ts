// Wire validated domain messages to the server-backed context when the contract exists.
export function connectRealtime(onMessage: (data: unknown) => void, onState: (state: 'connected' | 'disconnected') => void) {
  const url = import.meta.env.VITE_WS_URL;
  if (!url) throw new Error('WebSocket não configurado.');
  let stopped = false;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let socket: WebSocket | undefined;
  let attempt = 0;
  const start = () => {
    if (stopped) return;
    socket = new WebSocket(url);
    socket.onopen = () => { attempt = 0; onState('connected'); };
    socket.onmessage = event => {
      try { onMessage(JSON.parse(String(event.data)) as unknown); }
      catch { onState('disconnected'); }
    };
    socket.onerror = () => socket?.close();
    socket.onclose = () => {
      onState('disconnected');
      if (!stopped) retry = setTimeout(start, Math.min(30000, 1000 * 2 ** attempt++));
    };
  };
  start();
  return () => { stopped = true; clearTimeout(retry); socket?.close(); };
}
