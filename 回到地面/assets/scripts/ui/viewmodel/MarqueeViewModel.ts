/**
 * MarqueeViewModel - 跑马灯数据模型
 *
 * Phase 8: UI Prefab + ViewModel 化
 */

export interface MarqueeLightVM {
    lit: boolean;
    index: number;
}

export interface MarqueeVM {
    lights: MarqueeLightVM[];
    progressText: string;
    keyHintText: string;
    visible: boolean;
}
