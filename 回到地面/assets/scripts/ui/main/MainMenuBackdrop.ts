// assets/scripts/ui/main/MainMenuBackdrop.ts — P3-2 (audit §5 main.scene step 2, optional).
// Optional 3D backdrop behind the 2D main menu. Loads a backdrop model via
// AssetBundleService and slowly rotates it around Y to add depth. Purely
// additive; it never touches the 2D menu. Mount on a node in main.scene (the
// .scene wiring is editor-only and cannot be verified in the sandbox).

import { _decorator, Component, ModelComponent, Model, Node, Quat } from 'cc';
import { AssetBundleService } from '../../assets/AssetBundleService';

const { ccclass, property } = _decorator;

@ccclass('MainMenuBackdrop')
export class MainMenuBackdrop extends Component {
    @property
    backdropAssetId: string = '';

    @property({ type: Node })
    modelHost: Node | null = null;

    @property
    rotateSpeed: number = 8; // degrees per second around Y

    private _host: Node | null = null;
    private _quat: Quat = new Quat();

    onLoad(): void {
        this._host = this.modelHost ?? this.node;
        if (!this._host.getComponent(ModelComponent)) {
            this._host.addComponent(ModelComponent);
        }
        if (this.backdropAssetId) {
            void this.loadBackdrop(this.backdropAssetId);
        }
    }

    async loadBackdrop(assetId: string): Promise<boolean> {
        const asset = await AssetBundleService.instance.tryLoadById<Model>(assetId);
        if (!asset) return false;
        const mc = this._host?.getComponent(ModelComponent);
        if (!mc) return false;
        mc.asset = asset;
        return true;
    }

    update(dt: number): void {
        if (!this._host || this.rotateSpeed === 0) return;
        Quat.fromEuler(this._quat, 0, this.rotateSpeed * dt, 0);
        this._host.rotate(this._quat);
    }
}
