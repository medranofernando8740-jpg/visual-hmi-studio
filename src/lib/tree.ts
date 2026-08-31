import type { HmiElement } from "@/types/hmi";

let idCounter = 0;

/**
 * Deterministic sequential ids so server-rendered and hydrated markup match.
 */
export function uid(prefix = "el") {
  idCounter += 1;
  return `${prefix}_${idCounter.toString(36)}`;
}


export function findElement(elements: HmiElement[], id: string): HmiElement | undefined {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      const hit = findElement(el.children, id);
      if (hit) return hit;
    }
  }
  return undefined;
}

export function findParent(
  elements: HmiElement[],
  id: string,
  parent: HmiElement | null = null,
): HmiElement | null | undefined {
  for (const el of elements) {
    if (el.id === id) return parent;
    if (el.children) {
      const hit = findParent(el.children, id, el);
      if (hit !== undefined) return hit;
    }
  }
  return undefined;
}

export function mapElement(
  elements: HmiElement[],
  id: string,
  fn: (el: HmiElement) => HmiElement,
): HmiElement[] {
  return elements.map((el) => {
    if (el.id === id) return fn(el);
    if (el.children) return { ...el, children: mapElement(el.children, id, fn) };
    return el;
  });
}

export function removeElement(elements: HmiElement[], id: string): HmiElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => (el.children ? { ...el, children: removeElement(el.children, id) } : el));
}

export function flatten(elements: HmiElement[], depth = 0): { el: HmiElement; depth: number }[] {
  const out: { el: HmiElement; depth: number }[] = [];
  for (const el of elements) {
    out.push({ el, depth });
    if (el.children?.length) out.push(...flatten(el.children, depth + 1));
  }
  return out;
}

/** Absolute canvas position of an element, accumulating group offsets. */
export function absolutePosition(elements: HmiElement[], id: string): { x: number; y: number } {
  const walk = (
    list: HmiElement[],
    ox: number,
    oy: number,
  ): { x: number; y: number } | undefined => {
    for (const el of list) {
      if (el.id === id) return { x: ox + el.x, y: oy + el.y };
      if (el.children) {
        const hit = walk(el.children, ox + el.x, oy + el.y);
        if (hit) return hit;
      }
    }
    return undefined;
  };
  return walk(elements, 0, 0) ?? { x: 0, y: 0 };
}

export function cloneWithNewIds(el: HmiElement): HmiElement {
  const copy: HmiElement = { ...el, id: uid(el.kind) };
  if (el.children) copy.children = el.children.map(cloneWithNewIds);
  return copy;
}
