// assets/scripts/ui/world/WorldSpaceUI.ts — P3-1 (audit §5 dungeon.scene step 5).
// Hosts a world-space UI container that follows a 3D target and billboards to
// the main camera, so damage numbers / health bars can live in the 3D world.
// Mount under the dungeon scene's world-space UI canvas. The canvas render-mode
// change and node placement are done in the Cocos Creator editor (the .scene
// wiring cannot be verified in the sandbox).

import { _decorator, Component, Node, Vec3, Camera } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('WorldSpaceUI')
export class WorldSpaceUI extends Component {
    @property({ type: Node })
    target: Node | null = null;

    @property(Vec3)
    offset: Vec3 = new Vec3(0, 1, 0);

    @property
    billboard: boolean = true;

    @property
    followEnabled: boolean = true;

    update(dt: number): void {
        if (!this.followEnabled || !this.target) return;
        const wp = this.target.worldPosition;
        this.node.setWorldPosition(wp.x + this.offset.x, wp.y + this.offset.y, wp.z + this.offset.z);
        if (this.billboard) {
            const cam = Camera.main;
            if (cam) {
                // Match the camera orientation so the UI plane faces the viewer.
                this.node.setWorldRotation(cam.node.worldRotation);
            }
        }
    }
}
