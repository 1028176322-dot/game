// model_clip.ts - pure (cc-free) helpers for 3D character model assembly.
//
// Kept free of any `cc` import so it is unit-testable under node/vitest,
// mirroring the ModelRenderService -> AssetCache separation (engine-side logic
// is delegated, pure logic is tested directly).

export interface SocketNodeLike {
  name: string;
  children: SocketNodeLike[];
}

export function normalizeSocketName(name: string): string {
  return name
    .replace(/^mixamorig:/i, '')
    .replace(/[\s_]/g, '')
    .toLowerCase();
}

export function resolveSocketByName(
  root: SocketNodeLike,
  name: string,
  fallback?: string,
): SocketNodeLike | null {
  const want = normalizeSocketName(name);
  const fall = fallback ? normalizeSocketName(fallback) : null;
  let fallbackHit: SocketNodeLike | null = null;
  const stack: SocketNodeLike[] = [root];
  while (stack.length > 0) {
    const cur = stack.pop() as SocketNodeLike;
    const n = normalizeSocketName(cur.name);
    if (n === want) return cur;
    if (fall && n === fall) fallbackHit = cur;
    for (const child of cur.children) stack.push(child);
  }
  return fallbackHit;
}

export function playerClipName(action: string): string {
  return `player_${action}`;
}
