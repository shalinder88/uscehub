/**
 * Platform v2 foundation barrel.
 *
 * Importers should prefer:
 *   import { PATHWAY_KEYS, getPathway } from "@/lib/platform-v2";
 *
 * over deep paths. Keeps the public surface stable while the
 * internal layout evolves.
 */

export * from "./tokens";
export * from "./pathways";
