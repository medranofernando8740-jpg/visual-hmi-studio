import type { HmiVariable } from "@/types/hmi";

export type VarScope = Record<string, number | boolean | string>;

export function scopeFromVariables(vars: HmiVariable[]): VarScope {
  const scope: VarScope = {};
  for (const v of vars) {
    scope[sanitize(v.name)] = v.value;
  }
  return scope;
}

function sanitize(name: string) {
  return name.replace(/[^A-Za-z0-9_]/g, "_");
}

const cache = new Map<string, (...args: (number | boolean | string)[]) => unknown>();

/**
 * Evaluates a user expression such as `FAN_RUNNING == true` or
 * `TEMPERATURE * 1.8 + 32` against the current variable scope.
 * Returns undefined when the expression is invalid.
 */
export function evaluateExpression(expr: string, scope: VarScope): unknown {
  const source = (expr ?? "").trim();
  if (!source) return undefined;
  const names = Object.keys(scope);
  const key = names.join(",") + "|" + source;
  try {
    let fn = cache.get(key);
    if (!fn) {
      // eslint-disable-next-line no-new-func
      fn = new Function(
        ...names,
        `"use strict"; const abs=Math.abs, min=Math.min, max=Math.max, round=Math.round, floor=Math.floor, ceil=Math.ceil, sqrt=Math.sqrt; return (${source});`,
      ) as (...args: (number | boolean | string)[]) => unknown;
      cache.set(key, fn);
    }
    return fn(...names.map((n) => scope[n]));
  } catch {
    return undefined;
  }
}

export function evaluateCondition(expr: string | undefined, scope: VarScope): boolean {
  if (!expr || !expr.trim()) return true;
  return Boolean(evaluateExpression(expr, scope));
}

export function evaluateNumber(expr: string | undefined, scope: VarScope, fallback = 0): number {
  const raw = evaluateExpression(expr ?? "", scope);
  const n = typeof raw === "boolean" ? (raw ? 1 : 0) : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function isValidExpression(expr: string, scope: VarScope): boolean {
  if (!expr.trim()) return true;
  return evaluateExpression(expr, scope) !== undefined;
}
