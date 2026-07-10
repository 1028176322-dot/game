// RuntimeEvent.ts — runtime state domain event types (§3.11).
// Pure TS, no `cc`.

export interface RuntimeSeedEvent {
  readonly domain: 'runtime';
  readonly type: 'seed_assigned';
  readonly seed: number;
  readonly fork: string;
}

export interface RuntimeStateChangeEvent {
  readonly domain: 'runtime';
  readonly type: 'state_changed';
  readonly previous: string;
  readonly current: string;
}

export interface RuntimeErrorEvent {
  readonly domain: 'runtime';
  readonly type: 'error';
  readonly code: string;
  readonly message: string;
  readonly fatal: boolean;
}

export type RuntimeEvent =
  | RuntimeSeedEvent
  | RuntimeStateChangeEvent
  | RuntimeErrorEvent;
