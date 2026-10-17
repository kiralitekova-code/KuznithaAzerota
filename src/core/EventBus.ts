export type GameEvent =
  | 'toast'
  | 'sfx'
  | 'quest-done'
  | 'level-complete'
  | 'built'
  | 'destroyed'
  | 'error'
  | 'produce'
  | 'state-changed';

type Handler = (payload: unknown) => void;

class EventBus {
  private handlers = new Map<GameEvent, Set<Handler>>();

  on(event: GameEvent, fn: Handler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  off(event: GameEvent, fn: Handler): void {
    this.handlers.get(event)?.delete(fn);
  }

  emit(event: GameEvent, payload?: unknown): void {
    this.handlers.get(event)?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error(`[EventBus] handler for "${event}" failed`, e);
      }
    });
  }
}

export const bus = new EventBus();

export const toast = (text: string, kind: 'info' | 'success' | 'error' = 'info') => bus.emit('toast', { text, kind });
export const sfx = (name: string) => bus.emit('sfx', name);
