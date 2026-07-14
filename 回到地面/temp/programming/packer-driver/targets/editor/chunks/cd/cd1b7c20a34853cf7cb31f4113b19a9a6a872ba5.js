System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, IConfigDatabase, AudioSystem, MemoryAudioSink, _crd, AudioCategory;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIConfigDatabase(extras) {
    _reporterNs.report("IConfigDatabase", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVec(extras) {
    _reporterNs.report("Vec3", "../physics/ICollisionService", _context.meta, extras);
  }

  _export({
    AudioSystem: void 0,
    MemoryAudioSink: void 0
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      IConfigDatabase = _unresolved_2.IConfigDatabase;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "14ab7qRMrFDi51sj1a0fuT7", "AudioSystem", undefined); // AudioSystem.ts — audio orchestration (§5.8).
      // Pure TS, NO `cc` import: runs in node for vitest. Actual playback is delegated to an
      // injected AudioSink (the engine wires a cc.AudioSource-backed sink at runtime).
      // Authoritative spec: docs/2D转3D全面升级方案.md §5.8.
      //
      // Design notes:
      //  - Implements the IAudioService contract (token exported from GameContext, reused here).
      //  - Six sub-systems: BGM / SFX / Voice / Ambient / 3D (positional) + Snapshot (mix presets).
      //  - 3D audio attenuation is distance-based from an injectable listener position; the engine
      //    feeds the listener each frame (typically CameraBrain's world position) via setListener.
      //  - Parameters are config-driven (IConfigDatabase.getAudio) so planners tune JSON w/o code.
      //  - No `switch` over category; dispatch is a single map (red line 2 not applicable to audio,
      //    but we keep the same data-driven discipline).


      _export("AudioCategory", AudioCategory = /*#__PURE__*/function (AudioCategory) {
        AudioCategory["Bgm"] = "bgm";
        AudioCategory["Sfx"] = "sfx";
        AudioCategory["Voice"] = "voice";
        AudioCategory["Ambient"] = "ambient";
        AudioCategory["Spatial"] = "3d";
        return AudioCategory;
      }({}));
      /** Minimal config source surface AudioSystem needs (structural, no cc). */

      /** Backend seam: engine implements this with cc.AudioSource; tests use MemoryAudioSink. */


      _export("AudioSystem", AudioSystem = class AudioSystem {
        constructor(sink) {
          this._sink = void 0;
          this._db = null;
          this._snapshots = new Map();
          this._activeSnapshot = 'calm';
          this._volumeScale = 1;
          this._listener = {
            x: 0,
            y: 0,
            z: 0
          };
          this._playing = new Set();
          this._initialized = false;
          this._sink = sink;
        }

        initialize(ctx) {
          this._db = ctx.get(_crd && IConfigDatabase === void 0 ? (_reportPossibleCrUseOfIConfigDatabase({
            error: Error()
          }), IConfigDatabase) : IConfigDatabase);

          this._snapshots.set('calm', {
            volumeScale: 1
          });

          this._snapshots.set('combat', {
            volumeScale: 0.9
          });

          this._snapshots.set('boss', {
            volumeScale: 1.2
          });

          this._activeSnapshot = 'calm';
          this._volumeScale = 1;

          this._playing.clear();

          this._initialized = true;
        } // --- Listener (3D audio) ---


        setListener(pos) {
          this._listener = {
            x: pos.x,
            y: pos.y,
            z: pos.z
          };

          this._sink.setListener(this._listener);
        } // --- Snapshot (mix preset) ---


        registerSnapshot(name, scale) {
          this._snapshots.set(name, {
            volumeScale: scale
          });
        }

        setSnapshot(name) {
          const s = this._snapshots.get(name);

          if (!s) return;
          this._activeSnapshot = name;
          this._volumeScale = s.volumeScale;

          this._sink.setSnapshot(name, this._volumeScale);
        }

        get activeSnapshot() {
          return this._activeSnapshot;
        }

        get initialized() {
          return this._initialized;
        }

        get playingCount() {
          return this._playing.size;
        } // --- Public play API (§5.8 sub-systems) ---


        play(event) {
          var _event$category;

          this._play(event.id, (_event$category = event.category) != null ? _event$category : AudioCategory.Sfx, event.worldPos);
        }

        playBgm(id) {
          this._play(id, AudioCategory.Bgm);
        }

        playSfx(id) {
          this._play(id, AudioCategory.Sfx);
        }

        playVoice(id) {
          this._play(id, AudioCategory.Voice);
        }

        playAmbient(id) {
          this._play(id, AudioCategory.Ambient);
        }

        play3d(id, worldPos) {
          this._play(id, AudioCategory.Spatial, worldPos);
        }

        stop(id) {
          this._sink.stop(id);

          this._playing.delete(id);
        } // --- ILifecycle ---


        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          for (const id of this._playing) this._sink.stop(id);

          this._playing.clear();

          this._activeSnapshot = 'calm';
          this._volumeScale = 1;
          this._listener = {
            x: 0,
            y: 0,
            z: 0
          };
          this._initialized = false;
        } // --- Internals ---


        _play(id, category, worldPos) {
          const cfg = this._resolveConfig(id, category);

          let volume = cfg.volume * this._volumeScale;

          if (category === AudioCategory.Spatial && worldPos) {
            volume *= this._attenuation(worldPos, cfg);
          }

          this._sink.play({ ...cfg,
            category,
            volume
          }, volume);

          this._playing.add(id);
        }

        _resolveConfig(id, category) {
          var _raw$volume, _raw$loop, _raw$minDistance, _raw$maxDistance;

          const raw = this._db ? this._db.getAudio(id) : undefined;
          return {
            id,
            category,
            volume: (_raw$volume = raw == null ? void 0 : raw.volume) != null ? _raw$volume : 1,
            loop: (_raw$loop = raw == null ? void 0 : raw.loop) != null ? _raw$loop : category === AudioCategory.Bgm || category === AudioCategory.Ambient,
            minDistance: (_raw$minDistance = raw == null ? void 0 : raw.minDistance) != null ? _raw$minDistance : 1,
            maxDistance: (_raw$maxDistance = raw == null ? void 0 : raw.maxDistance) != null ? _raw$maxDistance : 20
          };
        }

        _attenuation(pos, cfg) {
          const min = cfg.minDistance;
          const max = Math.max(cfg.minDistance + 0.0001, cfg.maxDistance);
          const dx = pos.x - this._listener.x;
          const dy = pos.y - this._listener.y;
          const dz = pos.z - this._listener.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist <= min) return 1;
          if (dist >= max) return 0;
          return 1 - (dist - min) / (max - min); // linear distance attenuation
        }

      });
      /** In-memory sink for tests / headless demo wiring (no cc). */


      _export("MemoryAudioSink", MemoryAudioSink = class MemoryAudioSink {
        constructor() {
          this.plays = [];
          this.stops = [];
          this.snapshots = [];
          this.listener = {
            x: 0,
            y: 0,
            z: 0
          };
        }

        play(config, effectiveVolume) {
          this.plays.push({
            id: config.id,
            category: config.category,
            effectiveVolume
          });
        }

        stop(id) {
          this.stops.push(id);
        }

        setSnapshot(name, volumeScale) {
          this.snapshots.push({
            name,
            scale: volumeScale
          });
        }

        setListener(pos) {
          this.listener = {
            x: pos.x,
            y: pos.y,
            z: pos.z
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=cd1b7c20a34853cf7cb31f4113b19a9a6a872ba5.js.map