import { Component, Node } from 'cc';

export type NodeLike = Node | Component | { node?: Node } | null | undefined;

export class NodeRef {
    static node(ref: NodeLike): Node | null {
        if (!ref) return null;
        if (ref instanceof Node) return ref;
        const maybeNode = (ref as { node?: Node }).node;
        return maybeNode instanceof Node ? maybeNode : null;
    }

    static component<T extends Component>(
        ref: NodeLike,
        type: { new (...args: any[]): T },
        fallbackRoot?: Node | null,
        fallbackPath?: string,
    ): T | null {
        const node = this.node(ref) ?? this.find(fallbackRoot, fallbackPath);
        return node?.getComponent(type) ?? null;
    }

    static childComponent<T extends Component>(
        ref: NodeLike,
        type: { new (...args: any[]): T },
        fallbackRoot?: Node | null,
        fallbackPath?: string,
    ): T | null {
        const node = this.node(ref) ?? this.find(fallbackRoot, fallbackPath);
        return node?.getComponentInChildren(type) ?? null;
    }

    static find(root: Node | null | undefined, path: string | null | undefined): Node | null {
        if (!root || !path) return null;

        let current: Node | null = root;
        for (const part of path.split('/')) {
            if (!part || part === '.') continue;
            current = current?.getChildByName(part) ?? null;
            if (!current) return null;
        }
        return current;
    }

    static requiredNode(ref: NodeLike, owner: string, field: string): Node | null {
        const node = this.node(ref);
        if (!node) {
            console.warn(`[NodeRef] ${owner}.${field} is not bound or is invalid`);
        }
        return node;
    }

    static requiredComponent<T extends Component>(
        ref: NodeLike,
        type: { new (...args: any[]): T },
        owner: string,
        field: string,
        fallbackRoot?: Node | null,
        fallbackPath?: string,
    ): T | null {
        const comp = this.component(ref, type, fallbackRoot, fallbackPath);
        if (!comp) {
            console.warn(`[NodeRef] ${owner}.${field} missing component ${type.name}`);
        }
        return comp;
    }
}
