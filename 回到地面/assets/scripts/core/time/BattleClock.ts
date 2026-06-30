/**
 * BattleClock - 战斗时钟
 *
 * 职责:
 * 1. 替代 eventBus.pause() 控制战斗计时
 * 2. 暂停时仅影响战斗逻辑，不影响 UI/存档/埋点等系统
 * 3. 支持 timeScale 实现子弹时间等效果
 *
 * 使用方式:
 *   const clock = BattleClock.instance;
 *   clock.paused = true;   // 暂停战斗（UI 仍可响应）
 *   clock.timeScale = 0.5; // 半速
 *   const scaledDt = clock.scale(dt);
 */

export class BattleClock {
    private static _instance: BattleClock | null = null;

    /** 战斗是否暂停 */
    paused = false;

    /** 时间流速倍率（1.0 = 正常） */
    timeScale = 1;

    static get instance(): BattleClock {
        if (!this._instance) this._instance = new BattleClock();
        return this._instance;
    }

    /** 根据暂停/倍率缩放 dt */
    scale(dt: number): number {
        return this.paused ? 0 : dt * this.timeScale;
    }

    /** 设置时间流速（带持续时长） */
    setTimeScale(scale: number, duration: number): void {
        const prev = this.timeScale;
        this.timeScale = scale;
        if (duration > 0) {
            // 定时恢复（由 BattleManager 的 update 驱动）
            this._scheduleRestore(prev, duration);
        }
    }

    /** 重置到正常状态 */
    reset(): void {
        this.paused = false;
        this.timeScale = 1;
        this._restoreTimer = -1;
    }

    // ======== 内部实现 ========

    private _restoreTimer = -1;

    private _scheduleRestore(target: number, duration: number): void {
        this._restoreTimer = duration;
        this._pendingRestore = target;
    }

    /** 由外部每帧调用（BattleManager.update） */
    tick(dt: number): void {
        if (this._restoreTimer > 0) {
            this._restoreTimer -= dt * (1 / this.timeScale);
            if (this._restoreTimer <= 0) {
                this.timeScale = this._pendingRestore;
                this._restoreTimer = -1;
            }
        }
    }
}
