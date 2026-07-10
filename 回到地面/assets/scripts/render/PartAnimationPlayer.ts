/**
 * PartAnimationPlayer — Keyframe-driven animation for part-based characters.
 *
 * Reads character_part_animations.json and interpolates position/rotation/scale
 * per part on every update(). Attach to the same node as PartCharacterRenderer.
 */

import { _decorator, Component, Node, Vec3 } from 'cc';
import { PartCharacterRenderer } from './PartCharacterRenderer';

const { ccclass } = _decorator;

export interface Keyframe {
    time: number;
    position?: [number, number];
    rotation?: number;
    scale?: [number, number];
}

export interface PartAnimation {
    loop: boolean;
    duration: number;
    tracks: Record<string, Keyframe[]>;
}

@ccclass('PartAnimationPlayer')
export class PartAnimationPlayer extends Component {
    private _renderer: PartCharacterRenderer | null = null;
    private _anim: PartAnimation | null = null;
    private _time = 0;
    private _playing = false;

    setup(renderer: PartCharacterRenderer) {
        this._renderer = renderer;
    }

    play(anim: PartAnimation) {
        this._anim = anim;
        this._time = 0;
        this._playing = true;

        // Reset parts to rig defaults before playing so animations are relative.
        if (this._renderer) {
            this._renderer.resetToRig();
        }
    }

    stop() {
        this._playing = false;
        this._anim = null;
    }

    isPlaying(): boolean {
        return this._playing;
    }

    update(dt: number) {
        if (!this._playing || !this._anim || !this._renderer) {
            return;
        }

        this._time += dt;

        if (this._time > this._anim.duration) {
            if (this._anim.loop) {
                this._time = this._time % this._anim.duration;
            } else {
                this._time = this._anim.duration;
                this._playing = false;
            }
        }

        for (const [partName, frames] of Object.entries(this._anim.tracks)) {
            const node = this._renderer.getPart(partName);
            if (!node || frames.length === 0) {
                continue;
            }

            this._applyTrack(node, frames, this._time);
        }
    }

    private _applyTrack(node: Node, frames: Keyframe[], time: number) {
        let a = frames[0];
        let b = frames[frames.length - 1];

        for (let i = 0; i < frames.length - 1; i++) {
            if (time >= frames[i].time && time <= frames[i + 1].time) {
                a = frames[i];
                b = frames[i + 1];
                break;
            }
        }

        const span = Math.max(0.001, b.time - a.time);
        const t = Math.max(0, Math.min(1, (time - a.time) / span));

        if (a.position || b.position) {
            const ap = a.position || b.position!;
            const bp = b.position || a.position!;
            node.setPosition(
                ap[0] + (bp[0] - ap[0]) * t,
                ap[1] + (bp[1] - ap[1]) * t,
                0,
            );
        }

        if (a.rotation !== undefined || b.rotation !== undefined) {
            const ar = a.rotation ?? b.rotation ?? 0;
            const br = b.rotation ?? a.rotation ?? 0;
            node.setRotationFromEuler(0, 0, ar + (br - ar) * t);
        }

        if (a.scale || b.scale) {
            const as = a.scale || b.scale!;
            const bs = b.scale || a.scale!;
            node.setScale(
                as[0] + (bs[0] - as[0]) * t,
                as[1] + (bs[1] - as[1]) * t,
                1,
            );
        }
    }
}
