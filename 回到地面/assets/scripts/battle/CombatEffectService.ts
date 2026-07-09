/**
 * CombatEffectService - ARPG 战斗视觉效果服务（纯代码特效）
 *
 * 监听 eventBus 战斗事件，触发零依赖的纯代码视觉反馈：
 *   - 受击闪白
 *   - 节点抖动
 *   - 屏幕震动
 *   - 攻击弹道（Sprite 色块飞向目标）
 *   - 死亡缩放消散（改进了 MonsterController 原有的死亡效果）
 *   - 暴击额外震动
 *   - 暴击额外震动
 *
 * 设计原则：
 *   - 零新美术资源：所有效果纯代码生成
 *   - 零侵入：不修改现有组件，只监听事件
 *   - 临时节点用完即销毁
 */

import { Node, Sprite, tween, Vec3, Color, UITransform, director, Camera } from 'cc';
import { eventBus } from '../core/EventBus';

export interface AttackResult {
    target: Node;
    damage: number;
    isCrit: boolean;
    element: string;
    killed: boolean;
}

const FLASH_DURATION = 0.08;
const SHAKE_DURATION = 0.15;
const SHAKE_INTENSITY = 6;

export class CombatEffectService {
    private static _instance: CombatEffectService | null = null;
    private _initialized = false;
    private _playerNode: Node | null = null;
    private _cameraNode: Node | null = null;
    private _cameraOrig = new Vec3(0, 0, 0);

    static get instance(): CombatEffectService {
        if (!this._instance) this._instance = new CombatEffectService();
        return this._instance;
    }

    /** 初始化：传入玩家节点，自动查找相机，挂载事件 */
    init(playerNode: Node): void {
        if (this._initialized) return;
        this._playerNode = playerNode;
        this._findCamera();
        this._cameraOrig = this._cameraNode?.getPosition()?.clone() ?? new Vec3(0, 0, 0);

        eventBus.on('attack:performed', this._onAttackPerformed, this);
        eventBus.on('player:damaged', this._onPlayerDamaged, this);
        eventBus.on('element:reaction', this._onElementReaction, this);

        this._initialized = true;
        console.log('[CombatEffectService] initialized');
    }

    destroy(): void {
        eventBus.offTarget(this);
        this._initialized = false;
    }

    // ── 内部 ──────────────────────────────────

    private _findCamera(): void {
        const cams = director.getScene()?.getComponentsInChildren(Camera);
        if (cams && cams.length > 0) {
            this._cameraNode = cams[0].node;
        }
        // 兜底：如果找不到 Camera，就用场景根节点
        if (!this._cameraNode) {
            this._cameraNode = director.getScene()?.children[0] ?? null;
        }
    }

    // ── 事件处理 ──────────────────────────────

    private _onAttackPerformed(result: AttackResult): void {
        // 1. 刀光弹道
        if (this._playerNode && result.target?.isValid) {
            this._spawnProjectile(this._playerNode.getPosition(), result.target.getPosition(), result.isCrit);
        }

        // 2. 受击闪白 + 抖动
        if (result.target?.isValid) {
            this._flashWhite(result.target);
            this._jolt(result.target, SHAKE_INTENSITY);
        }

        // 3. 屏幕震动（暴击更猛）
        this._screenShake(result.isCrit ? SHAKE_INTENSITY * 1.5 : SHAKE_INTENSITY, SHAKE_DURATION);
    }

    private _onPlayerDamaged(_damage: number, _isCrit: boolean): void {
        if (!this._playerNode) return;
        this._flashWhite(this._playerNode);
        this._screenShake(SHAKE_INTENSITY * 0.8, SHAKE_DURATION);
    }

    private _onElementReaction(_reaction: { name: string; position: Vec3 }): void {
        this._screenShake(SHAKE_INTENSITY * 1.3, SHAKE_DURATION * 1.4);
        // 元素反应位置产生一个彩色闪光
        // 简化为屏幕抖动加强
    }

    // ── 特效函数（纯代码） ────────────────────

    /** 节点闪白 */
    private _flashWhite(node: Node): void {
        const sprite = node.getComponent(Sprite);
        if (!sprite) return;
        const orig = sprite.color.clone();
        sprite.color = Color.WHITE;
        tween(sprite).delay(FLASH_DURATION).call(() => {
            if (sprite.isValid) sprite.color = orig;
        }).start();
    }

    /** 节点瞬抖 */
    private _jolt(node: Node, intensity: number): void {
        const orig = node.getPosition();
        const dx = (Math.random() - 0.5) * intensity;
        const dy = (Math.random() - 0.5) * intensity;
        tween(node)
            .to(0.025, { position: new Vec3(orig.x + dx, orig.y + dy, orig.z) })
            .to(0.025, { position: orig })
            .start();
    }

    /** 屏幕震动 */
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

    /** 生成弹道（色块飞向目标） */
    private _spawnProjectile(from: Vec3, to: Vec3, isCrit: boolean): void {
        const canvas = director.getScene()?.getComponentInChildren(cc.Canvas as any);
        if (!canvas) return;

        const proj = new Node('_projectile');
        const uiTransform = proj.addComponent(cc.UITransform as any);
        const size = isCrit ? 32 : 20;
        uiTransform.setContentSize(size, size);
        const sprite = proj.addComponent(Sprite);

        // 暴击用金色，普通用淡黄
        if (isCrit) {
            sprite.color = new Color(255, 215, 0, 220);
        } else {
            sprite.color = new Color(255, 255, 200, 200);
        }

        canvas.node.addChild(proj);
        proj.setPosition(from);

        const mid = new Vec3(
            (from.x + to.x) * 0.5,
            (from.y + to.y) * 0.5 + 20,
            0
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
