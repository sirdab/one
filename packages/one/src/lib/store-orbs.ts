const ORBS: readonly string[] = [
  new URL("../assets/orbs/store-00.webp", import.meta.url).href,
  new URL("../assets/orbs/store-01.webp", import.meta.url).href,
  new URL("../assets/orbs/store-02.webp", import.meta.url).href,
  new URL("../assets/orbs/store-03.webp", import.meta.url).href,
  new URL("../assets/orbs/store-04.webp", import.meta.url).href,
  new URL("../assets/orbs/store-05.webp", import.meta.url).href,
  new URL("../assets/orbs/store-06.webp", import.meta.url).href,
  new URL("../assets/orbs/store-07.webp", import.meta.url).href,
  new URL("../assets/orbs/store-08.webp", import.meta.url).href,
  new URL("../assets/orbs/store-09.webp", import.meta.url).href,
  new URL("../assets/orbs/store-10.webp", import.meta.url).href,
  new URL("../assets/orbs/store-11.webp", import.meta.url).href,
  new URL("../assets/orbs/store-12.webp", import.meta.url).href,
  new URL("../assets/orbs/store-13.webp", import.meta.url).href,
  new URL("../assets/orbs/store-14.webp", import.meta.url).href,
  new URL("../assets/orbs/store-15.webp", import.meta.url).href,
];

export const STORE_ORB_COUNT = ORBS.length;

export function hashString(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 ^ h1) >>> 0;
}

export function storeOrbPath(index: number): string {
  return ORBS[index % STORE_ORB_COUNT] ?? ORBS[0]!;
}

export function storeOrbFor(seed: string): string {
  return storeOrbPath(hashString(seed) % STORE_ORB_COUNT);
}

export function dealStoreOrbs(ids: readonly string[]): Map<string, string> {
  const taken = new Set<number>();
  const dealt = new Map<string, string>();
  for (const id of ids) {
    const own = hashString(id) % STORE_ORB_COUNT;
    let slot = own;
    for (let step = 0; step < STORE_ORB_COUNT; step += 1) {
      const candidate = (own + step) % STORE_ORB_COUNT;
      if (!taken.has(candidate)) {
        slot = candidate;
        break;
      }
    }
    taken.add(slot);
    dealt.set(id, storeOrbPath(slot));
  }
  return dealt;
}
