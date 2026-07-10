// AudioEvent.ts — audio domain event types (§3.11).
// Pure TS, no `cc`.

export interface AudioPlayEvent {
  readonly domain: 'audio';
  readonly type: 'play';
  readonly clipId: string;
  readonly category: 'bgm' | 'sfx' | 'voice' | 'ambient';
  readonly volume?: number;
  readonly loop?: boolean;
}

export interface AudioStopEvent {
  readonly domain: 'audio';
  readonly type: 'stop';
  readonly clipId?: string;
  readonly category?: string;
}

export interface AudioSnapshotEvent {
  readonly domain: 'audio';
  readonly type: 'snapshot';
  readonly snapshotId: string;
}

export interface AudioVolumeEvent {
  readonly domain: 'audio';
  readonly type: 'volume_changed';
  readonly category: string;
  readonly volume: number;
}

export type AudioEvent =
  | AudioPlayEvent
  | AudioStopEvent
  | AudioSnapshotEvent
  | AudioVolumeEvent;
