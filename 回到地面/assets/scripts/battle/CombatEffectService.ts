/**
 * CombatEffectService - ARPG 战斗视觉效果服务
 *
 * 监听 eventBus 战斗事件，触发：
 *   - 角色帧动画（attack/hit/dodge）
 *   - 攻击弹道
 *   - 受击闪白 + 抖动
 *   - 屏幕震动
 *   - 死亡增强
 *
 * 帧动画使用 CharacterVisualService 读取 game_assets.json 中的
 * sprite sheet 定义（5 角色 × 7 动作，竖排 4 帧，每帧 192×192）。
 */

import { Node, Sprite, tween, Vec3, Color, UITransform, director, Camera, Canvas } from 'cc';
import { eventBus } from '../core/EventBus';
import { CharacterVisualService } from '../render/CharacterVisualService';
import { PlayerDataManager } from '../core/PlayerDataManager';
import type { AttackResult } from './AutoAttack';

const FLASH_DURATION = 0.08;
const SHAKE_DURATION = 0.15;
const SHAKE_INTENSITY = 6;

export class CombatEffectService {
    private static _instance: CombatEffectService | null = null;
    private _initialized = false;
    private _playerNode: Node | null = null;
    private _cameraNode: Node | null = null;
    private _cameraOrig = new Vec3(0, 0, 0);
    private _characterClass: string = 'warrior';

    static get instance(): CombatEffectService {
        if (!this._instance) this._instance = new CombatEffectService();
        return this._instance;
    }

    /** 初始化：传入玩家节点，自动查找相机，挂载事件 */
    init(playerNode: Node): void {
        if (this._initialized) return;
        this._playerNode = playerNode;
        this._characterClass = (PlayerDataManager.getInstance() as any).selectedCharacter ?? 'warrior';
        this._findCamera();
        this._cameraOrig = this._cameraNode?.getPosition()?.clone() ?? new Vec3(0, 0, 0);

        // 玩家入场播放 idle 动画（循环）
        this._playAnim('idle', true, 6);

        eventBus.on('attack:performed', this._onAttackPerformed, this);
        eventBus.on('player:damaged', this._onPlayerDamaged, this);
        eventBus.on('element:reaction', this._onElementReaction, this);

        this._initialized = true;
        console.log('[CombatEffectService] initialized (class=' + this._characterClass + ')');
    }

    destroy(): void {
        eventBus.offTarget(this);
        this._initialized = false;
    }

    // ── 角色帧动画接口 ────────────────────────

    /**
     * 播放角色动画。action 取值: idle/walk/attack/hit/dodge/skill/death
     * loop=true 时循环播放（idle/walk），否则播放一次后回到 idle
     */
    playCharacterAnim(action: string, loop: boolean = false): void {
        this._playAnim(action, loop, action === 'idle' ? 6 : 10);
    }

    // ── 内部 ──────────────────────────────────

    private _findCamera(): void {
        const cams = director.getScene()?.getComponentsInChildren(Camera);
        if (cams && cams.length > 0) {
            this._cameraNode = cams[0].node;
        }
        if (!this._cameraNode) {
            this._cameraNode = director.getScene()?.children[0] ?? null;
        }
    }

    /** 核心动画播放函数 */
    private _playAnim(action: string, loop: boolean, fps: number): void {
        if (!this._playerNode) return;
        const key = `character.${this._characterClass}.${action}`;
        CharacterVisualService.instance.play(this._playerNode, key, fps).then((ok) => {
            if (!ok && action !== 'idle') {
                // fallback: 动画缺失时回到 idle
                this._playAnim('idle', true, 6);
            }
        });
    }

    // ── 事件处理 ──────────────────────────────

    private _onAttackPerformed(result: AttackResult): void {
        // 1. 播放攻击动画（非循环，10fps → 0.4s 播完 4 帧）
        this._playAnim('attack', false, 10);

        // 2. 刀光弹道
        if (this._playerNode && result.target?.isValid && result.target.node?.isValid) {
            this._spawnProjectile(this._playerNode.getPosition(), result.target.node.getPosition(), result.isCrit);
        }

        // 3. 受击闪白 + 抖动
        if (result.target?.isValid && result.target.node?.isValid) {
            this._flashWhite(result.target.node);
            this._jolt(result.target.node, SHAKE_INTENSITY);
        }

        // 4. 屏幕震动（暴击更猛）
        this._screenShake(result.isCrit ? SHAKE_INTENSITY * 1.5 : SHAKE_INTENSITY, SHAKE_DURATION);

        // 5. 攻击动画结束后回到 idle（非循环动画自动停止后, CharacterVisualService
        //    的 loop:false 动画播完最后一帧会静置，这里延迟切回 idle）
        this._scheduleIdleAfterAttack();
    }

    private _onPlayerDamaged(_damage: number, _isCrit: boolean): void {
        if (!this._playerNode) return;

        // 1. 受击动画
        this._playAnim('hit', false, 10);

        // 2. 闪白 + 震屏
        this._flashWhite(this._playerNode);
        this._screenShake(SHAKE_INTENSITY * 0.8, SHAKE_DURATION);
    }

    private _onElementReaction(_reaction: { name: string; position: Vec3 }): void {
        this._screenShake(SHAKE_INTENSITY * 1.3, SHAKE_DURATION * 1.4);
    }

    /** 攻击动画完成后恢复 idle（约 0.5s 后） */
    private _scheduleIdleAfterAttack(): void {
        setTimeout(() => {
            if (!this._playerNode?.isValid) return;
            this._playAnim('idle', true, 6);
        }, 500);
    }

    // ── 特效函数 ──────────────────────────────

    private _flashWhite(node: Node): void {
        const sprite = node.getComponent(Sprite);
        if (!sprite) return;
        const orig = sprite.color.clone();
        sprite.color = Color.WHITE;
        tween(sprite).delay(FLASH_DURATION).call(() => {
            if (sprite.isValid) sprite.color = orig;
        }).start();
    }

    private _jolt(node: Node, intensity: number): void {
        const orig = node.getPosition();
        const dx = (Math.random() - 0.5) * intensity;
        const dy = (Math.random() - 0.5) * intensity;
        tween(node)
            .to(0.025, { position: new Vec3(orig.x + dx, orig.y + dy, orig.z) })
            .to(0.025, { position: orig })
            .start();
    }

    private _screenShake(intensity: number, duration: number): void {
        if (!this._cameraNode) return;
        const orig = this._cameraOrig;
        const steps = Math.floor(duration / 0.03);
        for (let i = 0; i < steps; i++) {
            const t = i * 30;
            setTimeout(() => {
                if (!this._cameraNode?.isValid) return;
                const decay = 1 - (i / steps);
                const ox = (Math.random() - 0.5) * intensity * decay;
                const oy = (Math.random() - 0.5) * intensity * decay;
                this._cameraNode.setPosition(orig.x + ox, orig.y + oy, orig.z);
            }, t);
        }
        setTimeout(() => {
            if (this._cameraNode?.isValid) this._cameraNode.setPosition(orig);
        }, duration * 1000 + 50);
    }

    private _spawnProjectile(from: Vec3, to: Vec3, isCrit: boolean): void {
        const canvas = director.getScene()?.getComponentInChildren(Canvas);
        if (!canvas) return;

        const proj = new Node('_projectile');
        const uiTransform = proj.addComponent(UITransform);
        const size = isCrit ? 32 : 20;
        uiTransform.setContentSize(size, size);
        const sprite = proj.addComponent(Sprite);

        if (isCrit) {
            sprite.color = new Color(255, 215, 0, 220);
        } else {
            sprite.color = new Color(255, 255, 200, 200);
        }

        canvas.node.addChild(proj);
        proj.setPosition(from);

        const mid = new Vec3(
            (from.x + to.x) * 0.5,
            (from.y + to.y) * 0.5 + 20, 0
        );

        tween(proj)
            .to(0.08, { position: mid })
            .to(0.06, { position: to })
            .call(() => { uiTransform.setContentSize(size * 2, size * 2); })
            .to(0.04, { scale: new Vec3(0.2, 0.2, 1), opacity: 0 })
            .call(() => { if (proj.isValid) proj.destroy(); })
            .start();
    }
}
