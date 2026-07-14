// assets/scripts/core/save/RouteSaveAdapter.ts
// Implements RouteSavePort. Lives in the save-adaptation layer (core/save), NOT in
// dungeon/route. Uses the SaveService singleton and never `new`s SaveService (its
// constructor is private). Never fabricates a RunSave — a base RunSave must be
// created by RunCoordinator.startRun() first (GDD v0.4.3 ①③).
//
// Authoritative spec: docs/地牢重做_节点路线图肉鸽_设计v0.4.4.md §10.3.

import { SaveService } from './SaveService';
import { RouteRunSnapshot, RouteSavePort } from './RouteSaveTypes';

export class RouteSaveAdapter implements RouteSavePort {
    // v0.4.2: use the singleton, never `new`; v0.4.3: lives in core/save.
    private readonly _save = SaveService.instance;

    saveRoute(snapshot: RouteRunSnapshot): boolean {
        // v0.4.3: no active run -> return false; a new RunSave can only be created
        // by RunCoordinator.startRun(). Fabricating one here would bypass RunSave
        // required fields and save validation.
        const run = this._save.loadRun();
        if (!run) {
            console.warn('[RouteSaveAdapter] no active RunSave; skip route save');
            return false;
        }
        run.route = snapshot;
        return this._save.saveRun(run);
    }

    loadRoute(): RouteRunSnapshot | null {
        return this._save.loadRun()?.route ?? null;
    }

    clearRoute(): void {
        const run = this._save.loadRun();
        if (run) {
            run.route = undefined;
            this._save.saveRun(run);
        }
    }
}
