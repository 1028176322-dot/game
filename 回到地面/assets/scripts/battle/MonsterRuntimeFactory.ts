import { Color, instantiate, Node, Prefab, Sprite } from 'cc';
import { RuntimeEntityFactory } from '../runtime/RuntimeEntityFactory';
import { MonsterController } from './MonsterController';
import { MonsterRuntimeView } from './MonsterRuntimeView';

export interface MonsterRuntimeNodes {
    root: Node;
    body: Node;
    effectSocket: Node;
    controller: MonsterController;
    view: MonsterRuntimeView;
}

export class MonsterRuntimeFactory {
    static create(name: string, prefab: Prefab | null = null): MonsterRuntimeNodes {
        const created = prefab
            ? null
            : RuntimeEntityFactory.create({
                name,
                width: 96,
                height: 96,
                body: { name: 'Body', width: 96, height: 96 },
                hpBar: { enabled: true, width: 84, height: 12, y: 58 },
                shadow: { enabled: true, width: 70, height: 20, y: -42 },
                slots: [{ name: 'EffectSocket', width: 1, height: 1 }],
            });

        const root = prefab ? instantiate(prefab) : created!.root;
        root.name = name;

        const body = created?.body ?? RuntimeEntityFactory.ensureSpriteChild(root, 'Body', 96, 96);
        const hpBar = created?.hpBar ?? RuntimeEntityFactory.createHPBar(root, 84, 12);
        hpBar.setPosition(0, 58, 0);
        const hpFill = created?.hpFill ?? hpBar.getChildByName('BarFill') ?? undefined;
        const effectSocket = created?.slots.EffectSocket ?? RuntimeEntityFactory.ensureChild(root, 'EffectSocket', 1, 1);
        const shadow = created?.shadow ?? RuntimeEntityFactory.ensureChild(root, 'Shadow', 70, 20);
        if (!created?.shadow) {
            shadow.setPosition(0, -42, 0);
            RuntimeEntityFactory.drawEllipse(shadow, 70, 20, new Color(0, 0, 0, 80));
        }

        const controller = root.getComponent(MonsterController) ?? root.addComponent(MonsterController);
        const view = root.getComponent(MonsterRuntimeView) ?? root.addComponent(MonsterRuntimeView);
        const bodySprite = body.getComponent(Sprite) ?? body.addComponent(Sprite);
        view.initRefs(bodySprite, hpBar, hpFill ?? hpBar, effectSocket, shadow);

        return { root, body, effectSocket, controller, view };
    }

    static getBodyNode(root: Node): Node {
        return root.getChildByName('Body') ?? root;
    }
}
