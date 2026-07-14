import { _decorator, Component, Label, Node, Camera } from 'cc';
import { AssetBundleService } from '../assets/AssetBundleService';
import { ConfigService } from '../config/ConfigService';
import { ConfigManager } from './ConfigManager';
import { GameManager } from './GameManager';
import { SceneFlowService } from '../app/SceneFlowService';
import { GameContext, ILogger, IConfigDatabase, IAssetCache, ICameraBrain, ICollisionService, IDebugService, ISaveManager, IReplayRecorder, IAnimationController, IAudioService, IEventBus, IRuntimeState, ILightingService } from './GameContext';
import { Logger } from './Logger';
import { RuntimeState } from './RuntimeState';
import { ConfigDatabase } from './ConfigDatabase';
import { LifecycleManager, ILifecycle } from './LifecycleManager';
import { AssetCache } from '../assets/AssetCache';
import { CameraBrain, CameraMode, ICameraNode } from '../camera/CameraBrain';
import { PhysicsCollisionImpl } from '../physics/PhysicsCollisionImpl';
import { SkillGraph, ISkillGraph } from '../battle/skill/SkillGraph';
import { SkillExecutor, ISkillExecutor } from '../battle/skill/SkillExecutor';
import { DungeonGenerator } from '../dungeon/DungeonGenerator';
import { RoomBuilder } from '../dungeon/RoomBuilder';
import { NavigationGrid } from '../dungeon/NavigationGrid';
import { RoomRuntime, IRoomRuntime } from '../dungeon/RoomRuntime';
import { DebugPanel } from '../debug/DebugPanel';
import { PerfSampler } from '../debug/PerfSampler';
import { SaveManagerImpl, MemorySaveBackend } from '../save/SaveManager';
import { ReplayRecorder } from '../replay/ReplayRecorder';
import { AudioSystem, MemoryAudioSink } from '../audio/AudioSystem';
import { AnimationStateMachine } from '../battle/ai/AnimationStateMachine';
import { IAIController } from '../battle/ai/IAIController';
import { AIController } from '../battle/ai/AIController';
import { EventBusManager } from './EventBusManager';
import { LightingService } from '../lighting/LightingService';
import { EntityManager, IEntityManager } from '../ecs/EntityManager';
import { MovementComponent, IMovementComponent } from '../ecs/MovementComponent';
import { AnimationComponent, IAnimationComponent } from '../ecs/AnimationComponent';
import { CombatComponent, ICombatComponent } from '../ecs/CombatComponent';
import { StatComponent, IStatComponent } from '../ecs/StatComponent';
import { TargetComponent, ITargetComponent } from '../ecs/TargetComponent';
import { InteractionComponent, IInteractionComponent } from '../ecs/InteractionComponent';
import { CombatSystem, ICombatSystem } from '../battle/combat/CombatSystem';
import { TargetSelector, ITargetSelector } from '../battle/combat/TargetSelector';
import { HitResolver, DamageResolver, IHitResolver, IDamageResolver } from '../battle/skill/Resolvers';

const { ccclass, property } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property(Label)
    statusLabel: Label | null = null;

    /** Optional callback: (progressPercent, statusMessage) */
    onProgress: ((pct: number, msg: string) => void) | null = null;

    private _ready = false;
    private _error: string | null = null;
    private _ctx: GameContext | null = null;
    private _lifecycle: LifecycleManager | null = null;

    /** Static accessor so engine-side cc components (e.g. EcsEntityBridge) can resolve
     *  services from the wired GameContext. Null until _wireInfra() succeeds. Additive. */
    private static _context: GameContext | null = null;
    static get context(): GameContext | null { return GameBootstrap._context; }

    get ready(): boolean {
        return this._ready;
    }

    get error(): string | null {
        return this._error;
    }

    async onLoad(): Promise<void> {
        GameManager.ensure(this.node.scene);
        await this.startup();
    }

    async startup(): Promise<void> {
        if (this._ready || this._error) return;

        try {
            this._emitProgress(5, 'Starting...');
            this._setStatus('正在加载配置...');
            this._emitProgress(10, 'Loading config...');
            await ConfigService.instance.loadAll();

            this._emitProgress(50, 'Loading local config...');
            ConfigManager.getInstance().loadAll();

            this._emitProgress(70, 'Loading asset map...');
            await AssetBundleService.instance.loadAssetMapFromResources();

            this._emitProgress(95, 'Finalizing...');

            this._ready = true;
            this._emitProgress(100, 'Done');
            this._setStatus('加载完成');
            console.log('[GameBootstrap] startup complete');

            // Demo0 D0-5: wire GameContext + LifecycleManager (infra only, non-blocking).
            try {
                this._wireInfra();
            } catch (infraErr) {
                console.warn('[GameBootstrap] infra wiring demo skipped:', infraErr);
            }
        } catch (err) {
            this._error = err instanceof Error ? err.message : String(err);
            this._emitProgress(100, `Failed: ${this._error}`);
            this._setStatus(`启动失败：${this._error}`);
            console.error('[GameBootstrap] startup failed:', err);
        }
    }

    private _wireInfra(): void {
        // Demo0 D0-5: assemble the four core infra via GameContext (ServiceLocator).
        // Proves DI injection + ILifecycle broadcast are wired. Only infra classes are
        // `new`-ed here (no business System, per red line 4).
        // ConfigDatabase does NOT implement ILifecycle, so it is NOT registered into
        // LifecycleManager (avoid faking lifecycle, per D0-5 strict constraint).
        this._ctx = new GameContext();
        this._lifecycle = new LifecycleManager();
        GameBootstrap._context = this._ctx;

        // P2-2: IRuntimeState — authoritative run seed + frame counter for the
        // DebugPanel Seed panel and deterministic replay (§2.2 / §5.5). Pure TS
        // (delegates seed to RunRng). Registered early so the seed provider
        // below and any system can read it via ctx.get(IRuntimeState).
        const runtimeState = new RuntimeState();
        this._ctx.register(IRuntimeState, runtimeState);
        this._lifecycle.register(runtimeState);
        runtimeState.initialize(this._ctx);

        // §5.5 DebugPanel (IDebugService) — created before Logger so the Logger sink
        // forwards its output into the DebugPanel "Events" buffer (ILogger buffer reuse).
        const debugPanel = new DebugPanel();
        this._ctx.register(IDebugService, debugPanel);
        this._lifecycle.register(debugPanel);
        debugPanel.initialize(this._ctx);

        // Demo6: PerfSampler — dedicated perf baseline sampler for the 100-monster
        // stress test (§5.5 / §8.1). Wired as DebugPanel's authoritative perf source
        // (smoothed FPS / frame-time / memory / draw-call). Implements ILifecycle.
        // NOTE: DebugPanel + PerfSampler are Dev/Debug-build only (gated by the engine
        // bundler macro at build time); registered here for the demo/headless path.
        const perfSampler = new PerfSampler();
        this._lifecycle.register(perfSampler);
        perfSampler.initialize(this._ctx);
        debugPanel.setPerfSampler(perfSampler);

        // Demo seed provider — now backed by IRuntimeState (P2-2): shows the real
        // RunRng seed instead of a hard-coded placeholder.
        debugPanel.registerProvider('seed', () => ({ seed: runtimeState.getSeedDebug() }));

        this._ctx.register(
          ILogger,
          new Logger(true, undefined, (line: string) => {
            console.log(line);
            debugPanel.pushRaw(line);
          })
        );
        this._ctx.register(IConfigDatabase, new ConfigDatabase());

        // Demo1: AssetCache — loader delegates to existing AssetBundleService (no re-implementation).
        // Implements ILifecycle, so it is registered into LifecycleManager for teardown.
        const assetCache = new AssetCache((id) => AssetBundleService.instance.loadById(id));
        this._ctx.register(IAssetCache, assetCache);
        this._lifecycle.register(assetCache);

        // Demo2: CameraBrain — 7-mode follow camera (§3.4). Implements ILifecycle, so it joins
        // LifecycleManager teardown. Mode params are sourced from ConfigDatabase.getCamera.
        const cameraBrain = new CameraBrain(this._ctx.get<ConfigDatabase>(IConfigDatabase));
        this._ctx.register(ICameraBrain, cameraBrain);
        this._lifecycle.register(cameraBrain);
        const mainCam = this._findMainCamera();
        if (mainCam) {
          cameraBrain.attach(mainCam);
        }
        cameraBrain.setMode(CameraMode.Follow);

        // P2-1: LightingService (ILightingService) — per-region lighting presets
        // (directional / ambient / fog / skybox) applied to the live scene root.
        // Implements ILifecycle so it joins LifecycleManager teardown (red line 3).
        const lighting = new LightingService();
        this._ctx.register(ILightingService, lighting);
        this._lifecycle.register(lighting);
        lighting.initialize(this._ctx);

        // Demo3: PhysicsCollisionImpl — ICollisionService (§3.3). Pure TS, no cc, deterministic.
        // Implements ILifecycle so it joins LifecycleManager teardown (red line 3).
        const collision = new PhysicsCollisionImpl();
        this._ctx.register(ICollisionService, collision);
        this._lifecycle.register(collision);

        // P1-3: combat leaf resolvers — TargetSelector / HitResolver / DamageResolver (§3.8 / §3.9).
        // Pure stateless services lifted to instance ILifecycle so CombatSystem and SkillExecutor
        // inject them via GameContext (red line 4: no `new` of services inside consumers).
        const targetSelector = new TargetSelector();
        this._ctx.register(ITargetSelector, targetSelector);
        this._lifecycle.register(targetSelector);
        targetSelector.initialize(this._ctx);

        const hitResolver = new HitResolver();
        this._ctx.register(IHitResolver, hitResolver);
        this._lifecycle.register(hitResolver);
        hitResolver.initialize(this._ctx);

        const damageResolver = new DamageResolver();
        this._ctx.register(IDamageResolver, damageResolver);
        this._lifecycle.register(damageResolver);
        damageResolver.initialize(this._ctx);

        // Demo4: SkillGraph + SkillExecutor (§3.9). Data-driven skills, no switch (red line 2).
        // SkillGraph builds the node chain; SkillExecutor dispatches nodes by kind via a Map.
        // Both implement ILifecycle so they join LifecycleManager teardown (red line 3).
        const skillGraph = new SkillGraph();
        this._ctx.register(ISkillGraph, skillGraph);
        this._lifecycle.register(skillGraph);
        skillGraph.initialize(this._ctx);

        const skillExecutor = new SkillExecutor();
        this._ctx.register(ISkillExecutor, skillExecutor);
        this._lifecycle.register(skillExecutor);
        skillExecutor.initialize(this._ctx);

        // Demo5: dungeon room full lifecycle (§3.7 + §5.1). Build a demo room from a seed
        // (DungeonGenerator -> RoomBuilder -> NavigationGrid), register the RoomRuntime as
        // IRoomRuntime and join LifecycleManager (room-level teardown, red line 3). Pure TS.
        const layout = new DungeonGenerator().generate(20260710, 'forest');
        const roomData = new RoomBuilder().build(layout.rooms[0]);
        const navGrid = new NavigationGrid(roomData.tileMap);
        const roomRuntime = new RoomRuntime(roomData, navGrid);
        this._ctx.register(IRoomRuntime, roomRuntime);
        this._lifecycle.register(roomRuntime);
        roomRuntime.initialize(this._ctx);

        // §5.6 SaveManager (ISaveManager) — layered persistence (crash recovery / daily
        // challenge / cloud save share one snapshot). Backend injected (Memory for demo;
        // engine wires a localStorage-backed backend). Implements ILifecycle.
        const saveBackend = new MemorySaveBackend();
        const saveManager = new SaveManagerImpl(saveBackend);
        this._ctx.register(ISaveManager, saveManager);
        this._lifecycle.register(saveManager);
        saveManager.initialize(this._ctx);

        // §5.7 ReplayRecorder (IReplayRecorder) — deterministic replay = seed + input
        // stream. Ring buffer keeps recent N runs. Implements ILifecycle.
        const replayRecorder = new ReplayRecorder();
        this._ctx.register(IReplayRecorder, replayRecorder);
        this._lifecycle.register(replayRecorder);
        replayRecorder.initialize(this._ctx);

        // §5.8 AudioSystem (IAudioService) — audio orchestration (BGM/SFX/Voice/Ambient/3D +
        // Snapshot). Pure TS; playback delegated to an injected AudioSink (engine wires a
        // cc.AudioSource-backed sink; MemoryAudioSink for headless demo). Implements ILifecycle.
        const audioSystem = new AudioSystem(new MemoryAudioSink());
        this._ctx.register(IAudioService, audioSystem);
        this._lifecycle.register(audioSystem);
        audioSystem.initialize(this._ctx);

        // §3.5 / §3.10: AnimationStateMachine (IAnimationController) — state-machine-based
        // animation controller. Pure TS, no cc. Implements ILifecycle.
        const animSM = new AnimationStateMachine();
        this._ctx.register(IAnimationController, animSM);
        this._lifecycle.register(animSM);
        animSM.initialize(this._ctx);

        // §3.10: IAIController — registered as a FACTORY (not a singleton) because
        // AIController is per-owner: its initialize method binds the context and a
        // specific entity owner. Consumers resolve the factory through ctx.get and
        // then invoke it to obtain a dedicated instance, followed by initialize.
        // This removes the previously orphaned infrastructure: the controller was
        // implemented but never registered, so ctx.get(IAIController) used to throw.
        this._ctx.register(IAIController, () => new AIController());

        // §3.11: EventBusManager (IEventBus) — typed domain event bus with 6 emitters.
        // Pure TS. Implements ILifecycle. Per-domain log toggle available.
        const eventBus = new EventBusManager();
        this._ctx.register(IEventBus, eventBus);
        this._lifecycle.register(eventBus);
        eventBus.initialize(this._ctx);

        // §3.12: EntityManager (IEntityManager) — ECS entity registry.
        // Pure TS. Implements ILifecycle. PlayerController already has the main
        // Cocos component; EntityManager provides the registry side (component lookup).
        const entityManager = new EntityManager();
        this._ctx.register(IEntityManager, entityManager);
        this._lifecycle.register(entityManager);
        entityManager.initialize(this._ctx);

        // §3.12: Player ECS components (P1-4) — 6 components lifted to ILifecycle so they
        // join LifecycleManager teardown and can be resolved via GameContext. These are
        // demo singleton registrations; per-entity instances are assembled by EcsEntityFactory
        // (which `new`s components and calls their typed initialize). Pure TS.
        const movementC = new MovementComponent();
        this._ctx.register(IMovementComponent, movementC);
        this._lifecycle.register(movementC);
        movementC.initialize(this._ctx, 0, 0);

        const animC = new AnimationComponent();
        this._ctx.register(IAnimationComponent, animC);
        this._lifecycle.register(animC);
        animC.initialize(this._ctx);

        const combatC = new CombatComponent();
        this._ctx.register(ICombatComponent, combatC);
        this._lifecycle.register(combatC);
        combatC.initialize(this._ctx, 'demo', () => {});

        const statC = new StatComponent();
        this._ctx.register(IStatComponent, statC);
        this._lifecycle.register(statC);
        statC.initialize(this._ctx, 100, 10, 5, 60);

        const targetC = new TargetComponent();
        this._ctx.register(ITargetComponent, targetC);
        this._lifecycle.register(targetC);
        targetC.initialize(this._ctx, 0, 0);

        const interactionC = new InteractionComponent();
        this._ctx.register(IInteractionComponent, interactionC);
        this._lifecycle.register(interactionC);
        interactionC.initialize(this._ctx, 'demo', eventBus);

        // §3.8: CombatSystem — combat orchestration (dispatch/target/effect/projectile/lock-on).
        // Consumes SkillRequest from AI or player CombatComponent, executes through the full
        // combat pipeline. All dependencies resolved via ctx.get. Implements ILifecycle.
        const combatSystem = new CombatSystem();
        this._ctx.register(ICombatSystem, combatSystem);
        this._lifecycle.register(combatSystem);
        combatSystem.initialize(this._ctx);

        const logger = this._ctx.get<Logger>(ILogger);
        // Demo probe (NOT a business system): implements ILifecycle so LifecycleManager
        // can broadcast lifecycle events; each method logs via the injected Logger.
        const probe: ILifecycle = {
            initialize: () => logger.channel('battle').info('Initialize'),
            enter:      () => logger.channel('battle').info('Enter'),
            pause:      () => logger.channel('battle').info('Pause'),
            resume:     () => logger.channel('battle').info('Resume'),
            exit:       () => logger.channel('battle').info('Exit'),
            destroy:    () => logger.channel('battle').info('Destroy'),
        };
        this._lifecycle.register(probe);
        probe.initialize(this._ctx);
        // v0.4.4 (Demo7): formal startup keeps all infra services alive for the
        // whole session. The enter/pause/resume/exit/destroy probe is extracted to
        // runLifecycleSmokeTestOnly() so it can run in a test harness without
        // tearing down the real runtime (the old destroyAll() here killed services).
    }

    /**
     * Demo / headless lifecycle smoke test ONLY. Not called by formal startup().
     * Runs the full lifecycle cycle against the wired infra and tears it down.
     * Safe to invoke from a test harness; must NOT be mixed into startup().
     */
    runLifecycleSmokeTestOnly(): void {
        if (!this._lifecycle) return;
        this._lifecycle.enterAll();
        this._lifecycle.pauseAll();
        this._lifecycle.resumeAll();
        this._lifecycle.exitAll();
        this._lifecycle.destroyAll();
    }

    private _findMainCamera(): ICameraNode | null {
        // Locate the scene's main camera node and attach it to CameraBrain.
        // Non-fatal: CameraBrain works in logic-only mode until a camera is attached.
        try {
            const scene = this.node.scene;
            const cam = scene.getComponentInChildren(Camera);
            return cam ? (cam.node as unknown as ICameraNode) : null;
        } catch {
            return null;
        }
    }

    private _emitProgress(pct: number, msg: string): void {
        if (this.onProgress) {
            this.onProgress(pct, msg);
        }
    }

    goToMain(): void {
        if (this._error) {
            console.warn('[GameBootstrap] blocked by startup error:', this._error);
            return;
        }
        if (!this._ready) {
            this.scheduleOnce(() => this.goToMain(), 0.2);
            return;
        }
        SceneFlowService.instance.goToMain();
    }

    private _setStatus(text: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = text;
        }
    }

    static find(root: Node): GameBootstrap | null {
        if (!this._isSceneRoot(root)) {
            const own = root.getComponent(GameBootstrap);
            if (own) return own;
        }
        for (const child of root.children) {
            const found = GameBootstrap.find(child);
            if (found) return found;
        }
        return null;
    }

    static ensure(root: Node): GameBootstrap {
        const existing = GameBootstrap.find(root);
        if (existing) return existing;

        let node = root.getChildByName('GameBootstrap');
        if (!node) {
            node = new Node('GameBootstrap');
            root.addChild(node);
        }
        return node.getComponent(GameBootstrap) ?? node.addComponent(GameBootstrap);
    }

    private static _isSceneRoot(node: Node): boolean {
        return node.constructor?.name === 'Scene';
    }

    onDestroy(): void {
        this.unscheduleAllCallbacks();
        this._ctx?.onDestroy();
    }
}
