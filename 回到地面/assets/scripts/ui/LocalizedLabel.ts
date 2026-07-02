/**
 * LocalizedLabel - 多语言文本 Label 组件
 *
 * 用法（编辑器）：
 *   给已有 Label 的节点添加此组件
 *   填写 textKey = "ui.mainStart"
 *   运行时自动从 text.json 取值
 *
 * 用法（代码）：
 *   直接调用 T(key, params) 函数
 *
 * 优势：
 *   所有玩家可见文本集中在 text.json
 *   改文案不需改场景/脚本
 *   审核查敏感词只需搜 text.json
 *   后续多语言只需替换 text.json
 */

import { _decorator, Component, Label } from 'cc';
import { T } from '../core/TextManager';

const { ccclass, property, requireComponent } = _decorator;

@ccclass('LocalizedLabel')
@requireComponent(Label)
export class LocalizedLabel extends Component {
    @property
    textKey = '';

    @property
    fallback = '';

    onLoad(): void {
        this.refresh();
    }

    /**
     * 从 text.json 刷新文本
     * @param params 模板变量 {key: value}
     */
    refresh(params?: Record<string, string | number | boolean>): void {
        const label = this.getComponent(Label);
        if (!label) return;
        label.string = this.textKey ? T(this.textKey, params) : this.fallback;
    }
}
