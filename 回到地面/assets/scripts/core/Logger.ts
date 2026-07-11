// assets/scripts/core/Logger.ts — D0-4 (§5.4)
// Independent categorized logging system. Pure TS, no `cc` import.
// Replaces scattered console.log across systems via ctx.get("ILogger").

export enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

export type ChannelName =
    | "battle"
    | "ai"
    | "scene"
    | "physics"
    | "asset"
    | "ui"
    | "audio";

export interface LogChannel {
    debug(msg: string, meta?: unknown): void;
    info(msg: string, meta?: unknown): void;
    warn(msg: string, meta?: unknown): void;
    error(msg: string, meta?: unknown): void;
}

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
    [LogLevel.Debug]: 0,
    [LogLevel.Info]: 1,
    [LogLevel.Warn]: 2,
    [LogLevel.Error]: 3,
};

const DEFAULT_CHANNELS: ChannelName[] = [
    "battle",
    "ai",
    "scene",
    "physics",
    "asset",
    "ui",
    "audio",
];

const LEVEL_TAG: Record<LogLevel, string> = {
    [LogLevel.Debug]: "debug",
    [LogLevel.Info]: "info",
    [LogLevel.Warn]: "warn",
    [LogLevel.Error]: "error",
};

// Contract for the categorized logger (§5.4). Lets consumers depend on the
// interface rather than the concrete Logger class.
export interface ILogger {
  channel(name: ChannelName): LogChannel;
}

export class Logger implements ILogger {
    private readonly sink: (line: string) => void;
    private readonly levels = new Map<ChannelName, LogLevel>();
    private readonly channels = new Map<ChannelName, LogChannel>();

    constructor(
        isDev: boolean = true,
        channelLevels?: Partial<Record<ChannelName, LogLevel>>,
        sink?: (line: string) => void
    ) {
        this.sink = sink ?? ((line: string) => console.log(line));
        const defaultLevel = isDev ? LogLevel.Debug : LogLevel.Error;
        for (const name of DEFAULT_CHANNELS) {
            this.levels.set(name, channelLevels?.[name] ?? defaultLevel);
            this.channels.set(name, this.makeChannel(name));
        }
    }

    channel(name: ChannelName): LogChannel {
        const ch = this.channels.get(name);
        if (!ch) {
            throw new Error(`Unknown log channel: ${name}`);
        }
        return ch;
    }

    private makeChannel(name: ChannelName): LogChannel {
        const emit = (level: LogLevel, msg: string, meta?: unknown): void => {
            const threshold = this.levels.get(name) ?? LogLevel.Debug;
            if (LOG_LEVEL_RANK[level] < LOG_LEVEL_RANK[threshold]) {
                return;
            }
            const time = new Date().toISOString();
            const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
            this.sink(`[${time}][${name}][${LEVEL_TAG[level]}] ${msg}${metaStr}`);
        };
        return {
            debug: (m, meta) => emit(LogLevel.Debug, m, meta),
            info: (m, meta) => emit(LogLevel.Info, m, meta),
            warn: (m, meta) => emit(LogLevel.Warn, m, meta),
            error: (m, meta) => emit(LogLevel.Error, m, meta),
        };
    }
}
