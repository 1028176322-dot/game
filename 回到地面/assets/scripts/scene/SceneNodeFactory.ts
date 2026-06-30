import { Component, Node, UITransform } from 'cc';

export class SceneNodeFactory {
    static ensureChild(parent: Node, name: string): Node {
        let child = parent.getChildByName(name);
        if (!child) {
            child = new Node(name);
            parent.addChild(child);
        }
        return child;
    }

    static ensureComponent<T extends Component>(node: Node, type: any): T {
        let comp = node.getComponent(type) as T | null;
        if (!comp) comp = node.addComponent(type) as T;
        return comp;
    }

    static ensureTransform(node: Node, width: number, height: number): UITransform {
        const transform = this.ensureComponent<UITransform>(node, UITransform);
        transform.setContentSize(width, height);
        return transform;
    }

    static findChildByName(root: Node, name: string): Node | null {
        if (root.name === name) return root;
        for (const child of root.children) {
            const found = this.findChildByName(child, name);
            if (found) return found;
        }
        return null;
    }

    static findComponentInChildren<T extends Component>(root: Node, type: any): T | null {
        const own = root.getComponent(type) as T | null;
        if (own) return own;
        for (const child of root.children) {
            const found = this.findComponentInChildren<T>(child, type);
            if (found) return found;
        }
        return null;
    }
}
