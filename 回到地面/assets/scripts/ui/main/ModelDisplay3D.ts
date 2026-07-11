// assets/scripts/ui/main/ModelDisplay3D.ts — P2-4 (§2.4).
// 3D character preview viewport for the main menu CreatePanel. Wraps a
// ModelComponent + SkinnedMeshRenderer so a 3D model asset can be shown in the
// PreviewZone. Attach this component to the PreviewZone/ModelDisplay node in the
// Cocos Creator editor (the .scene wiring cannot be verified in the sandbox).

import { _decorator, Component, ModelComponent, SkinnedMeshRenderer, Model } from 'cc';
import { AssetBundleService } from '../../assets/AssetBundleService';

const { ccclass, property } = _decorator;

@ccclass('ModelDisplay3D')
export class ModelDisplay3D extends Component {
    @property(ModelComponent)
    modelComp: ModelComponent | null = null;

    @property
    modelAssetId: string = '';

    onLoad(): void {
        if (!this.modelComp) {
            this.modelComp = this.getComponent(ModelComponent) ?? this.addComponent(ModelComponent);
        }
        if (!this.getComponent(SkinnedMeshRenderer)) {
            this.addComponent(SkinnedMeshRenderer);
        }
        if (this.modelAssetId) {
            void this.showModel(this.modelAssetId);
        }
    }

    /** Load a 3D model asset by id and assign it to the ModelComponent. */
    async showModel(assetId: string): Promise<boolean> {
        const asset = await AssetBundleService.instance.loadById<Model>(assetId);
        if (!this.modelComp) return false;
        this.modelComp.asset = asset;
        return true;
    }
}
