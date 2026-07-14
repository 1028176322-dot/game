// assets/scripts/ui/main/MainMenuBackdrop.ts — T4 (UI 3D preview addendum).
// Replaces the old "mount ModelComponent directly on a UI node" approach
// (invisible under the orthographic main camera) with the offscreen-RT
// route: MainSceneController creates the Canvas/MainMenuBackdrop3D slot
// node (this component is mounted on it); this component reads ui3d.json and,
// when enabled, asks SceneModelPreview to render the 3D backdrop into that
// slot. The 3D model lives on a T1A preview layer (offscreen rig); only a
// 2D Sprite (the RT) is pasted back onto the slot, so the UI camera and
// buttons are never touched.

import { _decorator, Component, Node, UITransform } from 'cc';
import { SceneModelPreview, PreviewHandle } from '../../render/SceneModelPreview';
import { loadUI3DBackdropConfig } from '../../config/ui3d';

const { ccclass } = _decorator;

@ccclass('MainMenuBackdrop')
export class MainMenuBackdrop extends Component {
    private _handle: PreviewHandle | null = null;

    onLoad(): void {
        // This component is mounted on Canvas/MainMenuBackdrop3D (created by
        // MainSceneController). Ensure the slot has a UITransform so PreviewSurface
        // can size the offscreen RenderTexture from it.
        if (!this.node.getComponent(UITransform)) {
            this.node.addComponent(UITransform);
        }
        void this._applyConfig();
    }

    private async _applyConfig(): Promise<void> {
        const cfg = await loadUI3DBackdropConfig('mainBackdrop');
        // Safe degrade: keep the existing 2D background, no error, no block.
        if (!cfg?.enabled || !cfg.modelAssetId) return;

        // Bind the slot directly (this.node is the Canvas/MainMenuBackdrop3D slot
        // resolved by convention; passing it avoids any find() timing race).
        this._handle = await SceneModelPreview.instance.showBackdropInSlot(
            this.node,
            cfg.modelAssetId,
            {
                ownerId: 'MainScene',
                transparent: cfg.transparent ?? false,
                fallback2dKey: cfg.fallback2dKey,
            },
        );
    }

    onDestroy(): void {
        if (this._handle) {
            this._handle.destroy();
            this._handle = null;
        }
        SceneModelPreview.instance.clearOwner('MainScene');
    }
}
