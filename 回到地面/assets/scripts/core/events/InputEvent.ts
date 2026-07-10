// InputEvent.ts — input domain event types (§3.11).
// Pure TS, no `cc`.

export interface InputKeyEvent {
  readonly domain: 'input';
  readonly type: 'key_down' | 'key_up';
  readonly key: string;
  readonly modifiers?: string[];
}

export interface InputPointerEvent {
  readonly domain: 'input';
  readonly type: 'pointer_down' | 'pointer_up' | 'pointer_move';
  readonly screenX: number;
  readonly screenY: number;
  readonly worldX?: number;
  readonly worldY?: number;
}

export interface InputJoystickEvent {
  readonly domain: 'input';
  readonly type: 'joystick_move' | 'joystick_release';
  readonly dx: number;
  readonly dy: number;
}

export type InputEvent =
  | InputKeyEvent
  | InputPointerEvent
  | InputJoystickEvent;
