/**
 * RuntimeLayerService - Standardized dungeon render layer management
 *
 * Manages the 5-layer rendering stack for dungeon scenes:
 *   Background(0) -> Tile(1) -> Actor(2) -> Effect(3) -> Door(4)
 *
 * Enforces:
 *   - Fixed sibling index order
 *   - Dynamic Y-axis sorting within ActorLayer
 *   - Systems nodes contain only logic components (no renderable objects)
 */

import { _decorator, Component, Node, Sprite, Graphics, Vec3 } from 'cc';

const { ccclass } = _decorator;

export enum LayerType {
    Background = 0,
    Tile = 1,
    Actor = 2,
    Effect = 3,
    Door = 4,
}

const LAYER_NAMES: Record<LayerType, string> = {
    [LayerType.Background]: 'BackgroundLayer',
    [LayerType.Tile]: 'TileLayer',
    [LayerType.Actor]: 'ActorLayer',
    [LayerType.Effect]: 'EffectLayer',
    [LayerType.Door]: 'DoorLayer',
};

const ACTOR_BASE_INDEX = 100;
const TILE_SIZE = 64;

@ccclass('RuntimeLayerService')
export class RuntimeLayerService {
    private static _instance: RuntimeLayerService | null = null;
    private _root: Node | null = null;
    private _layers = new Map<LayerType, Node>();
    private _initialized = false;

    static get instance(): RuntimeLayerService {
        if (!this._instance) this._instance = new RuntimeLayerService();
        return this._instance;
    }

    /** Initialize the 5 render layers under the given root node */
    ensureLayers(root: Node): void {
        if (this._initialized && this._root === root) return;

        this._root = root;
        this._layers.clear();

        for (let t = LayerType.Background; t <= LayerType.Door; t++) {
            const name = LAYER_NAMES[t];
            let layer = root.getChildByName(name);
            if (!layer) {
                layer = new Node(name);
                root.addChild(layer);
            }
            layer.setSiblingIndex(t);
            this._layers.set(t, layer);
        }

        this._initialized = true;
        console.log('[RuntimeLayer] 5 render layers initialized');
    }

    /** Get a specific layer node */
    getLayer(type: LayerType): Node | null {
        return this._layers.get(type) ?? null;
    }

    /** Add a node to a render layer with optional Y-axis sort */
    addToLayer(node: Node, type: LayerType, yPos?: number): void {
        const layer = this._layers.get(type);
        if (!layer) {
            console.warn(`[RuntimeLayer] layer not found: ${type}`);
            return;
        }

        layer.addChild(node);

        // Y-axis sort: lower Y = lower sibling index (drawn first = behind)
        if (type === LayerType.Actor && yPos !== undefined) {
            const sortIndex = ACTOR_BASE_INDEX + Math.floor(yPos / TILE_SIZE);
            node.setSiblingIndex(sortIndex);
        }
    }

    /** Calculate sort index for a grid Y position */
    getSortOrder(gridY: number): number {
        return ACTOR_BASE_INDEX + Math.floor(gridY);
    }

    /** Update a node's sort order based on its world position (call each frame for moving entities) */
    updateSortOrder(node: Node): void {
        // Only applies to Actor layer
        const parent = node.parent;
        if (!parent || parent.name !== LAYER_NAMES[LayerType.Actor]) return;

        const worldPos = node.worldPosition;
        const sortIndex = ACTOR_BASE_INDEX + Math.floor(worldPos.y / TILE_SIZE);
        node.setSiblingIndex(sortIndex);
    }

    /** Remove all children from all layers */
    clearAll(): void {
        for (const [, layer] of this._layers) {
            layer.removeAllChildren();
        }
    }

    /** Clear a specific layer */
    clearLayer(type: LayerType): void {
        const layer = this._layers.get(type);
        if (layer) layer.removeAllChildren();
    }

    /** Check if layers are initialized */
    get isInitialized(): boolean {
        return this._initialized;
    }
}
