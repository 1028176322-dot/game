/**
 * ConfigError - 配置系统专用错误类型
 * 
 * 职责:
 * 1. 区分加载失败 / 校验失败 / 引用缺失三种错误
 * 2. 每个错误携带配置文件名和具体原因
 */

export class ConfigLoadError extends Error {
    constructor(
        public readonly configName: string,
        message: string,
        public readonly innerError?: Error,
    ) {
        super(`[Config] ${configName}: ${message}`);
        this.name = 'ConfigLoadError';
    }
}

export class ConfigValidationError extends Error {
    constructor(
        public readonly configName: string,
        public readonly field: string,
        message: string,
    ) {
        super(`[Config] ${configName}.${field}: ${message}`);
        this.name = 'ConfigValidationError';
    }
}

export class ConfigReferenceError extends Error {
    constructor(
        public readonly sourceConfig: string,
        public readonly sourceField: string,
        public readonly missingRef: string,
    ) {
        super(`[Config] ${sourceConfig}.${sourceField}: missing reference '${missingRef}'`);
        this.name = 'ConfigReferenceError';
    }
}
