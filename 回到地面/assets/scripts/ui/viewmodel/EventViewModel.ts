/**
 * EventViewModel - 事件界面数据模型
 *
 * Phase 8: UI Prefab + ViewModel 化
 */

export interface EventOptionVM {
    label: string;
    description: string;
}

export interface EventVM {
    sceneName: string;
    description: string;
    optionA: EventOptionVM;
    optionB: EventOptionVM;
    timeRemaining: number;
    visible: boolean;
}
