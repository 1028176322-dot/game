// tests/core/logger.test.ts — D0-4 DoD verification (§5.4).
import { describe, it, expect, vi, afterEach } from "vitest";
import { Logger, LogLevel } from "../../assets/scripts/core/Logger";

describe("D0-4 Logger", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("formats output as [time][channel][level] msg", () => {
        const spy = vi.spyOn(console, "log").mockImplementation(() => {});
        const logger = new Logger(true);
        logger.channel("battle").info("x");
        expect(spy).toHaveBeenCalledTimes(1);
        const out = spy.mock.calls[0][0] as string;
        expect(out).toContain("[battle][info] x");
        // time + channel + level envelope present
        expect(out.startsWith("[")).toBe(true);
        expect(out).toMatch(/\[[^\]]*\]\[battle\]\[info\] x/);
    });

    it("appends meta as JSON when provided", () => {
        const spy = vi.spyOn(console, "log").mockImplementation(() => {});
        const logger = new Logger(true);
        logger.channel("ai").warn("hp", { v: 12 });
        const out = spy.mock.calls[0][0] as string;
        expect(out).toContain("[ai][warn] hp");
        expect(out).toContain('{"v":12}');
    });

    it("filters lower levels when channel set to Error", () => {
        const spy = vi.spyOn(console, "log").mockImplementation(() => {});
        // battle channel forced to Error; dev default (Debug) for others.
        const logger = new Logger(true, { battle: LogLevel.Error });
        logger.channel("battle").info("should-be-silent");
        logger.channel("battle").error("should-print");
        const calls = spy.mock.calls.map((c) => c[0] as string);
        expect(calls.some((c) => c.includes("should-be-silent"))).toBe(false);
        expect(calls.some((c) => c.includes("should-print"))).toBe(true);
    });

    it("release build (isDev=false) defaults all channels to Error level", () => {
        const spy = vi.spyOn(console, "log").mockImplementation(() => {});
        const logger = new Logger(false);
        logger.channel("scene").info("silent-in-release");
        logger.channel("scene").error("visible-in-release");
        const calls = spy.mock.calls.map((c) => c[0] as string);
        expect(calls.some((c) => c.includes("silent-in-release"))).toBe(false);
        expect(calls.some((c) => c.includes("visible-in-release"))).toBe(true);
    });

    it("throws on unknown channel name", () => {
        const logger = new Logger(true);
        // @ts-expect-error testing runtime guard with invalid input
        expect(() => logger.channel("nope")).toThrow();
    });
});
