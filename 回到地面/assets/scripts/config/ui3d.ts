/**
 * ui3d.ts — B-lite config for UI 3D backgrounds (T4 main menu / T5 splash).
 *
 * The file assets/resources/config/ui3d.json ships DEFAULT-CLOSED:
 *   { enabled:false, modelAssetId:'' } -> no 3D backdrop, keep the 2D one.
 * When the backdrop model asset is ready, flip enabled=true + set modelAssetId
 * in ui3d.json only; no code change required.
 *
 * Loaded via resources.load (NOT ConfigService, which is a fixed-name registry
 * with cross-reference validation that ui3d is intentionally excluded from).
 */

import { resources, JsonAsset } from 'cc';

export interface UI3DBackdropConfig {
    enabled: boolean;
    modelAssetId: string;
    fallback2dKey: string;
    quality?: 'auto' | 'high' | 'low';
    transparent?: boolean;
}

export interface UI3DConfig {
    version: number;
    mainBackdrop: UI3DBackdropConfig;
    splashBackdrop: UI3DBackdropConfig;
}

const DEFAULT_MAIN: UI3DBackdropConfig = {
    enabled: false,
    modelAssetId: '',
    fallback2dKey: 'ui.main.bg',
    quality: 'auto',
    transparent: false,
};

const DEFAULT_SPLASH: UI3DBackdropConfig = {
    enabled: false,
    modelAssetId: '',
    fallback2dKey: 'ui.splash.bg',
    quality: 'auto',
    transparent: false,
};

function fallback(group: 'mainBackdrop' | 'splashBackdrop'): UI3DBackdropConfig {
    return group === 'mainBackdrop'
        ? { ...DEFAULT_MAIN }
        : { ...DEFAULT_SPLASH };
}

/**
 * Load one backdrop group from assets/resources/config/ui3d.json.
 * Never throws: on missing file / parse error / missing group it returns a
 * safe default (enabled=false) so callers degrade to the 2D background.
 */
export function loadUI3DBackdropConfig(
    group: 'mainBackdrop' | 'splashBackdrop',
): Promise<UI3DBackdropConfig> {
    return new Promise((resolve) => {
        resources.load('config/ui3d', JsonAsset, (err, asset) => {
            if (err || !asset) {
                resolve(fallback(group));
                return;
            }
            try {
                const raw = asset.json as Partial<UI3DConfig> | null;
                const groupRaw = raw?.[group] as Partial<UI3DBackdropConfig> | undefined;
                if (!groupRaw || typeof groupRaw !== 'object') {
                    resolve(fallback(group));
                    return;
                }
                resolve({
                    enabled: !!groupRaw.enabled,
                    modelAssetId: groupRaw.modelAssetId ?? '',
                    fallback2dKey: groupRaw.fallback2dKey ?? fallback(group).fallback2dKey,
                    quality: groupRaw.quality ?? 'auto',
                    transparent: groupRaw.transparent ?? false,
                });
            } catch {
                resolve(fallback(group));
            }
        });
    });
}
