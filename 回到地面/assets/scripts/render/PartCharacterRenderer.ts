/**
 * PartCharacterRenderer — Assemble a character from isolated part sprites.
 *
 * Loads character_parts.json + character_rigs.json and builds a node tree
 * where each part is a child Sprite. Parts are sorted by their rig z value.
 */

import {
    _decorator,
    Component,
    Node,
    Sprite,
    UITransform,
    Vec3,
    resources,
    SpriteFrame,
    JsonAsset,
} from 'cc';

const { ccclass } = _decorator;

interface RigPart {
    z: number;
    position: [number, number];
    scale?: [number, number];
    anchor?: [number, number];
}

export interface CharacterRig {
    rootSize: [number, number];
    parts: Record<string, RigPart>;
}

export interface CharacterParts {
    parts: Record<string, string>;
}

@ccclass('PartCharacterRenderer')
export class PartCharacterRenderer extends Component {
    private _partNodes = new Map<string, Node>();
    private _rig: CharacterRig | null = null;
    private _characterId = '';

    async setup(characterId: string, partsConfig: CharacterParts, rig: CharacterRig) {
        this._characterId = characterId;
        this._rig = rig;

        const ui = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        ui.setContentSize(rig.rootSize[0], rig.rootSize[1]);

        // Sort parts by z ascending so they render in correct order.
        const entries = Object.entries(rig.parts).sort((a, b) => a[1].z - b[1].z);

        for (const [partName, partRig] of entries) {
            if (partName === 'shadow') {
                this._createShadow(partName, partRig);
                continue;
            }

            const assetPath = partsConfig.parts[partName];
            if (!assetPath) {
                continue;
            }

            const partNode = new Node(partName);
            partNode.setParent(this.node);
            partNode.setPosition(new Vec3(partRig.position[0], partRig.position[1], 0));
            partNode.setScale(partRig.scale?.[0] ?? 1, partRig.scale?.[1] ?? 1, 1);

            const partUi = partNode.addComponent(UITransform);
            partUi.setAnchorPoint(partRig.anchor?.[0] ?? 0.5, partRig.anchor?.[1] ?? 0.5);

            const sprite = partNode.addComponent(Sprite);
            const frame = await this._loadSpriteFrame(assetPath);
            if (frame) {
                sprite.spriteFrame = frame;
            } else {
                console.warn(`[PartCharacterRenderer] failed to load part: ${assetPath}`);
            }

            this._partNodes.set(partName, partNode);
        }
    }

    getCharacterId(): string {
        return this._characterId;
    }

    getPart(name: string): Node | null {
        return this._partNodes.get(name) || null;
    }

    getRig(): CharacterRig | null {
        return this._rig;
    }

    resetToRig() {
        if (!this._rig) {
            return;
        }

        for (const [partName, partRig] of Object.entries(this._rig.parts)) {
            const node = this._partNodes.get(partName);
            if (!node) {
                continue;
            }

            node.setPosition(partRig.position[0], partRig.position[1], 0);
            node.setRotationFromEuler(0, 0, 0);
            node.setScale(partRig.scale?.[0] ?? 1, partRig.scale?.[1] ?? 1, 1);
        }
    }

    private _loadSpriteFrame(path: string): Promise<SpriteFrame | null> {
        return new Promise((resolve) => {
            const fullPath = `${path}/spriteFrame`;
            resources.load(fullPath, SpriteFrame, (err, frame) => {
                if (err || !frame) {
                    console.warn(`[PartCharacterRenderer] load failed: ${fullPath}`, err);
                    resolve(null);
                    return;
                }
                resolve(frame);
            });
        });
    }

    private _createShadow(partName: string, rig: RigPart) {
        const node = new Node(partName);
        node.setParent(this.node);
        node.setPosition(rig.position[0], rig.position[1], 0);
        node.setScale(rig.scale?.[0] ?? 1, rig.scale?.[1] ?? 1, 1);
        // Shadow is intentionally a blank node in the prototype.
        // Replace with a Sprite loading a shadow texture when available.
        this._partNodes.set(partName, node);
    }
}
