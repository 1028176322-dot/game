import { Color, Graphics, Node, Sprite, UITransform } from 'cc';

export interface RuntimeEntitySlotSpec {
    name: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
}

export interface RuntimeEntitySpec {
    name: string;
    width?: number;
    height?: number;
    body?: {
        name?: string;
        width?: number;
        height?: number;
    };
    hpBar?: {
        enabled?: boolean;
        width?: number;
        height?: number;
        y?: number;
    };
    shadow?: {
        enabled?: boolean;
        width?: number;
        height?: number;
        y?: number;
    };
    slots?: RuntimeEntitySlotSpec[];
}

export interface RuntimeEntityNodes {
    root: Node;
    body: Node;
    slots: Record<string, Node>;
    hpBar?: Node;
    hpFill?: Node;
    shadow?: Node;
}

export class RuntimeEntityFactory {
    static create(spec: RuntimeEntitySpec): RuntimeEntityNodes {
        const root = new Node(spec.name);
        this.ensureTransform(root, spec.width ?? 96, spec.height ?? 96);

        const bodySpec = spec.body ?? {};
        const body = this.ensureSpriteChild(
            root,
            bodySpec.name ?? 'Body',
            bodySpec.width ?? spec.width ?? 96,
            bodySpec.height ?? spec.height ?? 96,
        );

        const slots: Record<string, Node> = {};
        for (const slot of spec.slots ?? []) {
            const child = this.ensureChild(root, slot.name, slot.width ?? 1, slot.height ?? 1);
            child.setPosition(slot.x ?? 0, slot.y ?? 0, 0);
            slots[slot.name] = child;
        }

        const nodes: RuntimeEntityNodes = { root, body, slots };

        if (spec.hpBar?.enabled) {
            const hpBar = this.createHPBar(root, spec.hpBar.width ?? 84, spec.hpBar.height ?? 12);
            hpBar.setPosition(0, spec.hpBar.y ?? 58, 0);
            nodes.hpBar = hpBar;
            nodes.hpFill = hpBar.getChildByName('BarFill') ?? undefined;
        }

        if (spec.shadow?.enabled) {
            const shadow = this.ensureChild(root, 'Shadow', spec.shadow.width ?? 70, spec.shadow.height ?? 20);
            shadow.setPosition(0, spec.shadow.y ?? -42, 0);
            this.drawEllipse(shadow, spec.shadow.width ?? 70, spec.shadow.height ?? 20, new Color(0, 0, 0, 80));
            nodes.shadow = shadow;
        }

        return nodes;
    }

    static ensureTransform(node: Node, width: number, height: number): UITransform {
        const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
        transform.setContentSize(width, height);
        return transform;
    }

    static ensureChild(parent: Node, name: string, width: number, height: number): Node {
        let child = parent.getChildByName(name);
        if (!child) {
            child = new Node(name);
            parent.addChild(child);
        }
        this.ensureTransform(child, width, height);
        return child;
    }

    static ensureSpriteChild(parent: Node, name: string, width: number, height: number): Node {
        const child = this.ensureChild(parent, name, width, height);
        if (!child.getComponent(Sprite)) {
            child.addComponent(Sprite);
        }
        return child;
    }

    static createHPBar(parent: Node, width: number, height: number): Node {
        const hpBar = this.ensureChild(parent, 'HPBar', width, height);
        const bg = this.ensureChild(hpBar, 'BarBg', width, Math.max(2, height - 2));
        this.drawRect(bg, width, Math.max(2, height - 2), new Color(35, 35, 35, 190));

        const fill = this.ensureChild(hpBar, 'BarFill', Math.max(2, width - 4), Math.max(2, height - 4));
        fill.setPosition(0, 0, 0);
        this.drawRect(fill, Math.max(2, width - 4), Math.max(2, height - 4), new Color(85, 220, 105, 230));
        return hpBar;
    }

    static drawRect(node: Node, width: number, height: number, color: Color): void {
        const graphics = node.getComponent(Graphics) ?? node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = color;
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
    }

    static drawEllipse(node: Node, width: number, height: number, color: Color): void {
        const graphics = node.getComponent(Graphics) ?? node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = color;
        graphics.ellipse(0, 0, width / 2, height / 2);
        graphics.fill();
    }
}
