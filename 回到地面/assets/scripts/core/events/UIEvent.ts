// UIEvent.ts — UI domain event types (§3.11).
// Pure TS, no `cc`. Discriminated union.

export interface UIPanelOpenEvent {
  readonly domain: 'ui';
  readonly type: 'panel_open';
  readonly panelId: string;
  readonly layer: string;
  readonly data?: unknown;
}

export interface UIPanelCloseEvent {
  readonly domain: 'ui';
  readonly type: 'panel_close';
  readonly panelId: string;
}

export interface UIButtonClickEvent {
  readonly domain: 'ui';
  readonly type: 'button_click';
  readonly buttonId: string;
  readonly context?: string;
}

export interface UIHoverEvent {
  readonly domain: 'ui';
  readonly type: 'hover';
  readonly elementId: string;
  readonly entered: boolean;
}

export type UIEvent =
  | UIPanelOpenEvent
  | UIPanelCloseEvent
  | UIButtonClickEvent
  | UIHoverEvent;
