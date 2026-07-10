// SceneEvent.ts — scene transition domain event types (§3.11).
// Pure TS, no `cc`.

export interface SceneLoadingEvent {
  readonly domain: 'scene';
  readonly type: 'loading';
  readonly sceneId: string;
  readonly progress: number;
}

export interface SceneEnterEvent {
  readonly domain: 'scene';
  readonly type: 'enter';
  readonly sceneId: string;
  readonly fromScene: string;
}

export interface SceneExitEvent {
  readonly domain: 'scene';
  readonly type: 'exit';
  readonly sceneId: string;
  readonly toScene: string;
}

export type SceneEvent =
  | SceneLoadingEvent
  | SceneEnterEvent
  | SceneExitEvent;
