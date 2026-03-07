import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ORDOverlay, OverlayPatch } from "../../generated/spec/v1/types";

type Primitive = string | number | boolean | null | undefined;

export type DeepPartial<T> =
  T extends Primitive
    ? T
    : T extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;

interface CreateOverlayPatchOptions {
  omitData?: boolean;
}

const repositoryRoot = resolve(__dirname, "../../../");

const defaultOverlay: ORDOverlay = {
  ordOverlay: "0.1",
  patches: [
    {
      action: "merge",
      selector: {
        jsonPath: "$",
      },
      data: {},
    },
  ],
};

const defaultPatchTemplate: DeepPartial<OverlayPatch> = {
  action: "merge",
  data: {},
};

export async function loadJsonFixture<T = unknown>(relativePath: string): Promise<T> {
  const content = await readFile(resolve(repositoryRoot, relativePath), "utf8");
  return JSON.parse(content) as T;
}

export function createOrdOverlay(overrides: DeepPartial<ORDOverlay> = {}): ORDOverlay {
  return deepMerge(defaultOverlay, overrides) as ORDOverlay;
}

export function createOverlayPatch(
  overrides: DeepPartial<OverlayPatch> = {},
  options: CreateOverlayPatchOptions = {},
): OverlayPatch {
  const patch = deepMerge(defaultPatchTemplate, overrides) as OverlayPatch;

  if (options.omitData) {
    delete (patch as { data?: unknown }).data;
  }

  return patch;
}

export async function captureWarnings<T>(run: () => Promise<T> | T): Promise<{ result: T; warnings: string[] }> {
  const warnings: string[] = [];
  const originalWarn = console.warn;

  console.warn = (message?: unknown): void => {
    warnings.push(String(message));
  };

  try {
    const result = await run();
    return { result, warnings };
  } finally {
    console.warn = originalWarn;
  }
}

function deepMerge<T>(base: T, override: DeepPartial<T>): T {
  if (override === undefined) {
    return clone(base);
  }

  if (Array.isArray(override)) {
    return clone(override) as unknown as T;
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const result: Record<string, unknown> = { ...base };

    Object.entries(override).forEach(([key, value]) => {
      if (value === undefined) {
        delete result[key];
        return;
      }

      const current = result[key];
      result[key] = key in result ? deepMerge(current, value) : clone(value);
    });

    return result as T;
  }

  return clone(override) as unknown as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  const cloneFn = (globalThis as { structuredClone?: <U>(input: U) => U }).structuredClone;
  if (typeof cloneFn === "function") {
    return cloneFn(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}
