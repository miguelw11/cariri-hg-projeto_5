import type { Discard } from '../types';
const DB = 'hg-industrial-totem-v1';
const STORE = 'discards';
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'eventId' });
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error('Feche outras abas para atualizar o armazenamento.'));
  });
}
export async function readDiscards(): Promise<Discard[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    tx.oncomplete = () => {
      db.close();
      resolve(request.result as Discard[]);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export async function saveDiscard(record: Discard): Promise<void> {
  if (
    !Number.isSafeInteger(record.quantity) ||
    record.quantity < 1 ||
    !record.productionId ||
    !record.reasonId
  )
    throw new Error('Registro de descarte inválido.');
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export async function changePendingDiscard(
  eventId: string,
  action: 'synced' | 'voided',
): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const request = store.get(eventId);
    request.onsuccess = () => {
      const value = request.result as Discard | undefined;
      if (!value || value.status !== 'pending') {
        tx.abort();
        return;
      }
      store.put({ ...value, status: action });
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(new Error('O registro mudou. Atualize a tela antes de tentar novamente.'));
    };
  });
}
