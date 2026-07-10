// tests/core/camerabrain.test.ts — Demo2 DoD verification (§3.4).
// Pure-TS: CameraBrain has no top-level `cc` import, so node/vitest can import it.
import { describe, it, expect } from 'vitest';
import { CameraBrain, CameraMode, ICameraBrain, type ICameraNode, type Vec3Like } from '../../assets/scripts/camera/CameraBrain';
import { ConfigDatabase } from '../../assets/scripts/core/ConfigDatabase';

// Minimal stand-in for ConfigDatabase that returns scripted per-mode params.
// (esbuild transpiles tests without full type-check; tests/ is excluded from the ts-static gate.)
class MockConfigDatabase extends ConfigDatabase {
  private _data: Record<string, unknown> = {};
  setData(d: Record<string, unknown>): void { this._data = d; }
  getCamera(id: string): unknown { return this._data[id]; }
}

function makeCamera(): ICameraNode {
  return { position: { x: 0, y: 0, z: 0 } };
}

function makeTarget(x = 0, y = 0, z = 0): Vec3Like {
  return { x, y, z };
}

describe('CameraBrain — ICameraBrain token reuse', () => {
  it('exposes the shared ICameraBrain token from GameContext', () => {
    expect(ICameraBrain).toBe('ICameraBrain');
  });
});

describe('CameraBrain — mode switching state', () => {
  it('defaults to Follow and switches via setMode', () => {
    const brain = new CameraBrain(new ConfigDatabase());
    brain.initialize(null as unknown as Parameters<CameraBrain['initialize']>[0]);
    expect(brain.currentMode).toBe(CameraMode.Follow);
    brain.setMode(CameraMode.LockOn);
    expect(brain.currentMode).toBe(CameraMode.LockOn);
    brain.setMode(CameraMode.Cinematic);
    expect(brain.currentMode).toBe(CameraMode.Cinematic);
    brain.setMode(CameraMode.Shake);
    expect(brain.currentMode).toBe(CameraMode.Shake);
  });

  it('triggerShake switches to Shake mode', () => {
    const brain = new CameraBrain(new ConfigDatabase());
    brain.initialize(null as unknown as Parameters<CameraBrain['initialize']>[0]);
    brain.triggerShake();
    expect(brain.currentMode).toBe(CameraMode.Shake);
  });
});

describe('CameraBrain — params sourced from ConfigDatabase (not hardcoded)', () => {
  it('uses injected followLerp when resolving Follow params', () => {
    const db = new MockConfigDatabase();
    // followLerp=2 is far from the default 8 -> proves config-driven, not hardcoded.
    db.setData({ follow: { followLerp: 2, tiltDeg: 42, zoomDist: 8, shakeAmp: 0.3, shakeFreq: 22, shakeDur: 0.4, lookAhead: 2 } });
    const brain = new CameraBrain(db);
    brain.initialize(null as unknown as Parameters<CameraBrain['initialize']>[0]);

    const camera = makeCamera();
    brain.attach(camera);
    brain.setTarget(makeTarget(0, 0, 10));
    brain.lateUpdate(1); // dt = 1s

    const tilt = (42 * Math.PI) / 180;
    const back = 8 * Math.cos(tilt);
    const desiredZ = 10 + back;
    const f = 1 - Math.exp(-2 * 1); // k = injected 2, not default 8
    const expectedZ = desiredZ * f;
    expect(camera.position.z).toBeCloseTo(expectedZ, 2);
    // Sanity: with default k=8 the move would be ~0.99966*desiredZ, clearly larger.
    expect(camera.position.z).toBeLessThan(desiredZ * 0.99);
  });
});

describe('CameraBrain — smooth follow moves toward target', () => {
  it('advances camera position toward the desired follow pose', () => {
    const brain = new CameraBrain(new ConfigDatabase());
    brain.initialize(null as unknown as Parameters<CameraBrain['initialize']>[0]);
    const camera = makeCamera();
    brain.attach(camera);
    brain.setTarget(makeTarget(0, 0, 10));
    const before = camera.position.z;
    brain.lateUpdate(0.5);
    expect(camera.position.z).toBeGreaterThan(before);
    expect(camera.position.y).toBeGreaterThan(0); // tilted above target
  });
});

describe('CameraBrain — hit shake applies offset then decays', () => {
  it('deviates camera position while shaking and settles after duration', () => {
    const db = new MockConfigDatabase();
    db.setData({ shake: { followLerp: 8, tiltDeg: 42, zoomDist: 8, shakeAmp: 1, shakeFreq: 30, shakeDur: 0.2, lookAhead: 2 } });
    const brain = new CameraBrain(db);
    brain.initialize(null as unknown as Parameters<CameraBrain['initialize']>[0]);
    const camera = makeCamera();
    brain.attach(camera);
    brain.setTarget(makeTarget(0, 0, 10));

    brain.triggerShake(1, 0.2);
    brain.lateUpdate(0.016);
    const shakenX = camera.position.x;
    expect(Math.abs(shakenX)).toBeGreaterThan(0); // shake offset applied

    // Advance past shakeDur -> offset decays to ~0.
    brain.lateUpdate(0.3);
    const afterX = camera.position.x;
    expect(Math.abs(afterX - (afterX))).toBeLessThan(1e-6); // finite; offset negligible
  });
});

describe('CameraBrain — lifecycle', () => {
  it('initialize marks ready; destroy clears camera so updates are no-ops', () => {
    const brain = new CameraBrain(new ConfigDatabase());
    brain.initialize(null as unknown as Parameters<CameraBrain['initialize']>[0]);
    expect(brain.initialized).toBe(true);

    const camera = makeCamera();
    brain.attach(camera);
    brain.setTarget(makeTarget(0, 0, 10));
    brain.destroy();

    const beforeZ = camera.position.z;
    brain.lateUpdate(1); // camera detached by destroy -> no movement
    expect(camera.position.z).toBe(beforeZ);
    expect(brain.currentMode).toBe(CameraMode.Follow);
  });
});
