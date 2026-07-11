// ConfigDatabase.ts — unified typed config query (§5.3).
// Pure TS, NO `cc` import: runs in node for vitest.
// Authoritative spec: docs/2D转3D全面升级方案.md §5.3.
//
// Reuse, not re-implement: §5.3 states "System 不得自行 load". ConfigDatabase only WRAPS
// config data that is already loaded by ConfigService (at runtime via GameBootstrap, Demo0 D0-5).
// It must never call resources.load / re-parse JSON itself.
//
// To stay `cc`-free and testable, the already-loaded data is injected via the constructor
// (the injection seam). At runtime GameBootstrap passes the namespaces read from
// ConfigService.instance. No static import of ConfigService here (it imports `cc`).

import type { GameConfigs, ConfigName } from '../config/ConfigTypes';

// Contract for the typed config query (§5.3).
export interface IConfigDatabase {
  loadAll(): Promise<void>;
  getSkill(id: string): unknown;
  getMonster(id: string): unknown;
  getBoss(id: string): unknown;
  getEffect(id: string): unknown;
  getAI(id: string): unknown;
  getCamera(id: string): unknown;
  getAudio(id: string): unknown;
}

export class ConfigDatabase implements IConfigDatabase {
  private _configs: Partial<GameConfigs> = {};
  private _loaded = false;

  /** Inject already-loaded config data (from ConfigService at runtime; mock in tests). */
  constructor(configs?: Partial<GameConfigs>) {
    this._configs = configs ?? {};
  }

  /** Wrap the injected already-loaded data. Does NOT load anything itself. */
  async loadAll(): Promise<void> {
    if (Object.keys(this._configs).length === 0) {
      throw new Error('[ConfigDatabase] no config data injected; pass ConfigService data via constructor');
    }
    this._loaded = true;
  }

  // NOTE: §5.3 return types (SkillConfig / MonsterConfig / BossConfig / EffectConfig /
  // AIConfig / CameraConfig / AudioConfig) are NOT yet defined in config/ConfigTypes.ts.
  // Per D0-3 rule we return `unknown` + TODO and do NOT define new config types here.
  // Namespace mapping below is provisional, pending ConfigTypes enrichment (Demo0 D0-5 / later):
  //   skills   -> 'skills'      (SkillsData exists; per-id type missing)
  //   monsters -> 'monsters'    (MonstersData exists; MonsterDef nested by zone)
  //   boss     -> 'zones'       (FinalBossDef lives in zones[zoneId].finalBoss)
  //   effect   -> 'economy'     (no effects config file yet)
  //   ai       -> 'battle'      (AI strategy config TBD)
  //   camera   -> 'zones'       (CameraBrain params TBD)
  //   audio    -> 'battle'      (AudioSystem params TBD)

  getSkill(id: string): unknown {
    return this._byId('skills', id); // TODO: define SkillConfig in ConfigTypes
  }

  getMonster(id: string): unknown {
    return this._byId('monsters', id); // TODO: define MonsterConfig in ConfigTypes
  }

  getBoss(id: string): unknown {
    return this._byId('zones', id); // TODO: define BossConfig; zones[].finalBoss = FinalBossDef
  }

  getEffect(id: string): unknown {
    return this._byId('economy', id); // TODO: define EffectConfig in ConfigTypes
  }

  getAI(id: string): unknown {
    return this._byId('battle', id); // TODO: define AIConfig in ConfigTypes
  }

  getCamera(id: string): unknown {
    return this._byId('zones', id); // TODO: define CameraConfig in ConfigTypes
  }

  getAudio(id: string): unknown {
    return this._byId('battle', id); // TODO: define AudioConfig in ConfigTypes
  }

  private _byId(ns: ConfigName, id: string): unknown {
    const nsData = this._configs[ns] as Record<string, unknown> | undefined;
    return nsData ? nsData[id] : undefined;
  }
}
