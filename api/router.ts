import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  processors,
  motherboards,
  ram,
  graphicsCards,
  storage,
  powerSupplies,
  coolers,
  cases,
} from "@db/schema";
import { eq } from "drizzle-orm";
import {
  listComponents,
  listKits,
  getKitComponents,
  listReferences,
} from "./queries/catalog";
import { checkCompatibility } from "./services/compatibility";
import type { CheckInput } from "@contracts/types";

const categoryEnum = z.enum([
  "processors",
  "motherboards",
  "graphics_cards",
  "ram",
  "storage",
  "power_supplies",
  "coolers",
  "cases",
]);

const checkInputSchema = z.object({
  processorId: z.number().optional(),
  motherboardId: z.number().optional(),
  gpuId: z.number().optional(),
  psuId: z.number().optional(),
  coolerId: z.number().optional(),
  caseId: z.number().optional(),
  ramIds: z.array(z.number()),
  storageIds: z.array(z.number()),
});

// Поля для добавления комплектующих (соответствуют DatabaseManagementWindow)
const num = z.number().nullable().optional();
const str = z.string().nullable().optional();

const addSchemas = {
  processors: z.object({
    model: z.string().min(1),
    manufacturerId: num, socketId: num, cores: num, threads: num,
    baseClock: num, boostClock: num, tdp: num, integratedGpu: z.boolean().optional(),
    memoryTypeId: num, maxMemory: num, powerConsumption: num,
  }),
  motherboards: z.object({
    model: z.string().min(1),
    manufacturerId: num, socketId: num, formFactorId: num, chipset: str,
    memoryTypeId: num, memorySlots: num, maxMemory: num, memorySpeedMax: num,
    sataPorts: num, m2Slots: num, pcieSlots: num,
    builtinWifi: z.boolean().optional(), builtinEthernet: z.boolean().optional(),
  }),
  graphics_cards: z.object({
    model: z.string().min(1),
    manufacturerId: num, vram: num, vramType: str, baseClock: num, boostClock: num,
    powerConsumption: num, recommendedPsu: num, length: num,
  }),
  ram: z.object({
    model: z.string().min(1),
    manufacturerId: num, memoryTypeId: num, capacity: num, speed: num,
    latency: str, modulesCount: num,
  }),
  storage: z.object({
    model: z.string().min(1),
    manufacturerId: num, type: str, capacity: num, interface: str,
    readSpeed: num, writeSpeed: num,
  }),
  power_supplies: z.object({
    model: z.string().min(1),
    manufacturerId: num, wattage: num, efficiencyRating: str,
    psuFormFactorId: num, modular: z.boolean().optional(),
  }),
  coolers: z.object({
    model: z.string().min(1),
    manufacturerId: num, type: str, socketCompatibility: str, tdp: num,
    noiseLevel: num, height: num,
  }),
  cases: z.object({
    model: z.string().min(1),
    manufacturerId: num, formFactorId: num, supportedPsuFormFactors: str,
    maxPsuLength: num, maxGpuLength: num, maxCoolerHeight: num,
    driveBays35: num, driveBays25: num,
  }),
} as const;

const tables = {
  processors: { table: processors, idCol: processors.processorId },
  motherboards: { table: motherboards, idCol: motherboards.motherboardId },
  graphics_cards: { table: graphicsCards, idCol: graphicsCards.gpuId },
  ram: { table: ram, idCol: ram.ramId },
  storage: { table: storage, idCol: storage.storageId },
  power_supplies: { table: powerSupplies, idCol: powerSupplies.psuId },
  coolers: { table: coolers, idCol: coolers.coolerId },
  cases: { table: cases, idCol: cases.caseId },
} as const;

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  catalog: createRouter({
    list: publicQuery
      .input(z.object({ category: categoryEnum }))
      .query(({ input }) => listComponents(input.category)),
    kits: publicQuery.query(() => listKits()),
    kitComponents: publicQuery
      .input(z.object({ kitId: z.number() }))
      .query(({ input }) => getKitComponents(input.kitId)),
  }),

  references: createRouter({
    all: publicQuery.query(() => listReferences()),
  }),

  compatibility: createRouter({
    check: publicQuery
      .input(checkInputSchema)
      .mutation(({ input }) => checkCompatibility(input as CheckInput)),
  }),

  admin: createRouter({
    add: publicQuery
      .input(z.object({ category: categoryEnum, data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => {
        const schema = addSchemas[input.category];
        const data = schema.parse(input.data);
        const db = getDb();
        const { table } = tables[input.category];
        await db.insert(table as any).values(data as any);
        return { ok: true };
      }),
    remove: publicQuery
      .input(z.object({ category: categoryEnum, id: z.number() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        const { table, idCol } = tables[input.category];
        await db.delete(table as any).where(eq(idCol as any, input.id));
        return { ok: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
