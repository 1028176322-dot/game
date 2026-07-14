System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd;

  function normalizeSocketName(name) {
    return name.replace(/^mixamorig:/i, '').replace(/[\s_]/g, '').toLowerCase();
  }

  function resolveSocketByName(root, name, fallback) {
    const want = normalizeSocketName(name);
    const fall = fallback ? normalizeSocketName(fallback) : null;
    let fallbackHit = null;
    const stack = [root];

    while (stack.length > 0) {
      const cur = stack.pop();
      const n = normalizeSocketName(cur.name);
      if (n === want) return cur;
      if (fall && n === fall) fallbackHit = cur;

      for (const child of cur.children) stack.push(child);
    }

    return fallbackHit;
  }

  function playerClipName(action) {
    return `player_${action}`;
  }

  _export({
    normalizeSocketName: normalizeSocketName,
    resolveSocketByName: resolveSocketByName,
    playerClipName: playerClipName
  });

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "10309fXN3lNG4CuDa/wZBlf", "model_clip", undefined); // model_clip.ts - pure (cc-free) helpers for 3D character model assembly.
      //
      // Kept free of any `cc` import so it is unit-testable under node/vitest,
      // mirroring the ModelRenderService -> AssetCache separation (engine-side logic
      // is delegated, pure logic is tested directly).


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3b25c0d52b8ecdf531e5636f5490457a1e1780c0.js.map