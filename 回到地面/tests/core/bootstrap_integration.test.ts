// tests/core/bootstrap_integration.test.ts — D0-5 DoD: GameContext + LifecycleManager + Logger + ConfigDatabase integration.
// NOTE: assets/scripts/core/GameBootstrap.ts imports `cc` and only runs inside the Cocos engine,
// so it cannot be executed under vitest (node). This test assembles the SAME four infra classes
// with the SAME probe/sequence that GameBootstrap._wireInfra() uses, proving the injection +
// ILifecycle broadcast chain is correct and CI-verifiable.
import { describe, it, expect, vi, afterEach } from "vitest";
import { GameContext, ILogger, IConfigDatabase } from "../../assets/scripts/core/GameContext";
import { Logger } from "../../assets/scripts/core/Logger";
import { ConfigDatabase } from "../../assets/scripts/core/ConfigDatabase";
import { LifecycleManager, ILifecycle } from "../../assets/scripts/core/LifecycleManager";

describe("D0-5 infra integration (GameContext + LifecycleManager + Logger + ConfigDatabase)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("prints lifecycle chain in order: Initialize -> Enter -> Pause -> Resume -> Exit -> Destroy", () => {
        const spy = vi.spyOn(console, "log").mockImplementation(() => {});

        const ctx = new GameContext();
        ctx.register(ILogger, new Logger(true));
        ctx.register(IConfigDatabase, new ConfigDatabase());

        const logger = ctx.get<Logger>(ILogger);
        const lifecycle = new LifecycleManager();
        const probe: ILifecycle = {
            initialize: () => logger.channel("battle").info("Initialize"),
            enter: () => logger.channel("battle").info("Enter"),
            pause: () => logger.channel("battle").info("Pause"),
            resume: () => logger.channel("battle").info("Resume"),
            exit: () => logger.channel("battle").info("Exit"),
            destroy: () => logger.channel("battle").info("Destroy"),
        };
        lifecycle.register(probe);
        probe.initialize(ctx);
        lifecycle.enterAll();
        lifecycle.pauseAll();
        lifecycle.resumeAll();
        lifecycle.exitAll();
        lifecycle.destroyAll();

        const lines = spy.mock.calls.map((c) => c[0] as string);
        const battleInfo = lines.filter((l) => /\[battle\]\[info\]/.test(l));
        const msgs = battleInfo.map((l) => l.replace(/^\[[^\]]*\]\[battle\]\[info\] /, ""));
        expect(msgs).toEqual(["Initialize", "Enter", "Pause", "Resume", "Exit", "Destroy"]);
    });

    it("registers Logger and ConfigDatabase into GameContext without duplicate error", () => {
        const ctx = new GameContext();
        ctx.register(ILogger, new Logger(true));
        ctx.register(IConfigDatabase, new ConfigDatabase());
        expect(ctx.get(ILogger)).toBeInstanceOf(Logger);
        expect(ctx.get(IConfigDatabase)).toBeInstanceOf(ConfigDatabase);
    });

    it("ctx.onDestroy tears down registered services without throwing", () => {
        const ctx = new GameContext();
        ctx.register(ILogger, new Logger(true));
        ctx.register(IConfigDatabase, new ConfigDatabase());
        expect(() => ctx.onDestroy()).not.toThrow();
    });
});
