// Intentionally disabled until idempotent server endpoints and conflict resolution exist.
// Never auto-submit invoice/stock edits from multiple devices without the server implementation.
export const offlineSyncReady = false;
export function syncPendingOperations() {
  throw new Error('Offline synchronization has not been implemented.');
}
