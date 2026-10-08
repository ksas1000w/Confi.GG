import { getDb } from "./connection";
import {
  manufacturers,
  sockets,
  memoryTypes,
  formFactors,
  psuFormFactors,
  processors,
  motherboards,
  ram,
  graphicsCards,
  storage,
  powerSupplies,
  coolers,
  cases,
  kits,
  kitComponents,
} from "@db/schema";
import { eq } from "drizzle-orm";

export async function listComponents(category: string) {
  const db = getDb();
  switch (category) {
    case "processors":
      return db
        .select({
          id: processors.processorId,
          model: processors.model,
          manufacturer: manufacturers.manufacturerName,
          socket: sockets.socketName,
          cores: processors.cores,
          threads: processors.threads,
          baseClock: processors.baseClock,
          boostClock: processors.boostClock,
          tdp: processors.tdp,
          powerConsumption: processors.powerConsumption,
          integratedGpu: processors.integratedGpu,
          memoryType: memoryTypes.typeName,
          maxMemory: processors.maxMemory,
        })
        .from(processors)
        .leftJoin(manufacturers, eq(processors.manufacturerId, manufacturers.manufacturerId))
        .leftJoin(sockets, eq(processors.socketId, sockets.socketId))
        .leftJoin(memoryTypes, eq(processors.memoryTypeId, memoryTypes.memoryTypeId));
    case "motherboards":
      return db
        .select({
          id: motherboards.motherboardId,
          model: motherboards.model,
          manufacturer: manufacturers.manufacturerName,
          socket: sockets.socketName,
          formFactor: formFactors.factorName,
          chipset: motherboards.chipset,
          memoryType: memoryTypes.typeName,
          memorySlots: motherboards.memorySlots,
          maxMemory: motherboards.maxMemory,
          memorySpeedMax: motherboards.memorySpeedMax,
          sataPorts: motherboards.sataPorts,
          m2Slots: motherboards.m2Slots,
          integratedCpuModel: motherboards.integratedCpuModel,
          integratedCpuDescription: motherboards.integratedCpuDescription,
          hasIntegratedCooling: motherboards.hasIntegratedCooling,
        })
        .from(motherboards)
        .leftJoin(manufacturers, eq(motherboards.manufacturerId, manufacturers.manufacturerId))
        .leftJoin(sockets, eq(motherboards.socketId, sockets.socketId))
        .leftJoin(formFactors, eq(motherboards.formFactorId, formFactors.formFactorId))
        .leftJoin(memoryTypes, eq(motherboards.memoryTypeId, memoryTypes.memoryTypeId));
    case "graphics_cards":
      return db
        .select({
          id: graphicsCards.gpuId,
          model: graphicsCards.model,
          manufacturer: manufacturers.manufacturerName,
          vram: graphicsCards.vram,
          vramType: graphicsCards.vramType,
          powerConsumption: graphicsCards.powerConsumption,
          recommendedPsu: graphicsCards.recommendedPsu,
          length: graphicsCards.length,
        })
        .from(graphicsCards)
        .leftJoin(manufacturers, eq(graphicsCards.manufacturerId, manufacturers.manufacturerId));
    case "ram":
      return db
        .select({
          id: ram.ramId,
          model: ram.model,
          manufacturer: manufacturers.manufacturerName,
          memoryType: memoryTypes.typeName,
          capacity: ram.capacity,
          speed: ram.speed,
          latency: ram.latency,
          modulesCount: ram.modulesCount,
        })
        .from(ram)
        .leftJoin(manufacturers, eq(ram.manufacturerId, manufacturers.manufacturerId))
        .leftJoin(memoryTypes, eq(ram.memoryTypeId, memoryTypes.memoryTypeId));
    case "storage":
      return db
        .select({
          id: storage.storageId,
          model: storage.model,
          manufacturer: manufacturers.manufacturerName,
          type: storage.type,
          capacity: storage.capacity,
          interface: storage.interface,
          readSpeed: storage.readSpeed,
          writeSpeed: storage.writeSpeed,
        })
        .from(storage)
        .leftJoin(manufacturers, eq(storage.manufacturerId, manufacturers.manufacturerId));
    case "power_supplies":
      return db
        .select({
          id: powerSupplies.psuId,
          model: powerSupplies.model,
          manufacturer: manufacturers.manufacturerName,
          wattage: powerSupplies.wattage,
          efficiencyRating: powerSupplies.efficiencyRating,
          psuFormFactor: psuFormFactors.factorName,
          modular: powerSupplies.modular,
        })
        .from(powerSupplies)
        .leftJoin(manufacturers, eq(powerSupplies.manufacturerId, manufacturers.manufacturerId))
        .leftJoin(psuFormFactors, eq(powerSupplies.psuFormFactorId, psuFormFactors.psuFormFactorId));
    case "coolers":
      return db
        .select({
          id: coolers.coolerId,
          model: coolers.model,
          manufacturer: manufacturers.manufacturerName,
          type: coolers.type,
          socketCompatibility: coolers.socketCompatibility,
          tdp: coolers.tdp,
          height: coolers.height,
        })
        .from(coolers)
        .leftJoin(manufacturers, eq(coolers.manufacturerId, manufacturers.manufacturerId));
    case "cases":
      return db
        .select({
          id: cases.caseId,
          model: cases.model,
          manufacturer: manufacturers.manufacturerName,
          formFactor: formFactors.factorName,
          supportedPsuFormFactors: cases.supportedPsuFormFactors,
          maxGpuLength: cases.maxGpuLength,
          maxCoolerHeight: cases.maxCoolerHeight,
        })
        .from(cases)
        .leftJoin(manufacturers, eq(cases.manufacturerId, manufacturers.manufacturerId))
        .leftJoin(formFactors, eq(cases.formFactorId, formFactors.formFactorId));
    default:
      return [];
  }
}

export async function listKits() {
  const db = getDb();
  return db.select().from(kits);
}

// Разворачивает комплект в список компонентов с моделями
export async function getKitComponents(kitId: number) {
  const db = getDb();
  const rows = await db.select().from(kitComponents).where(eq(kitComponents.kitId, kitId));

  const result: {
    type: string;
    componentId: number;
    quantity: number;
    model: string;
    category: string;
  }[] = [];

  const categoryOf = (type: string) =>
    type === "integrated_motherboard" ? "motherboards" : type === "gpu" ? "graphics_cards"
    : type === "psu" ? "power_supplies" : type === "case" ? "cases"
    : type === "processor" ? "processors" : type === "motherboard" ? "motherboards"
    : type === "ram" ? "ram" : type === "storage" ? "storage"
    : type === "cooler" ? "coolers" : type;

  for (const row of rows) {
    const category = categoryOf(row.componentType);
    let model = "—";
    const id = row.componentId;
    switch (category) {
      case "processors":
        model = (await db.select().from(processors).where(eq(processors.processorId, id)))[0]?.model ?? "—";
        break;
      case "motherboards": {
        const mb = (await db.select().from(motherboards).where(eq(motherboards.motherboardId, id)))[0];
        model = mb
          ? row.componentType === "integrated_motherboard" && mb.integratedCpuModel
            ? `${mb.model} (${mb.integratedCpuModel})`
            : mb.model
          : "—";
        break;
      }
      case "graphics_cards":
        model = (await db.select().from(graphicsCards).where(eq(graphicsCards.gpuId, id)))[0]?.model ?? "—";
        break;
      case "ram":
        model = (await db.select().from(ram).where(eq(ram.ramId, id)))[0]?.model ?? "—";
        break;
      case "storage":
        model = (await db.select().from(storage).where(eq(storage.storageId, id)))[0]?.model ?? "—";
        break;
      case "power_supplies":
        model = (await db.select().from(powerSupplies).where(eq(powerSupplies.psuId, id)))[0]?.model ?? "—";
        break;
      case "coolers":
        model = (await db.select().from(coolers).where(eq(coolers.coolerId, id)))[0]?.model ?? "—";
        break;
      case "cases":
        model = (await db.select().from(cases).where(eq(cases.caseId, id)))[0]?.model ?? "—";
        break;
    }
    result.push({
      type: row.componentType,
      componentId: id,
      quantity: row.quantity ?? 1,
      model,
      category,
    });
  }
  return result;
}

export async function listReferences() {
  const db = getDb();
  const [m, s, mt, ff, pff] = await Promise.all([
    db.select().from(manufacturers).orderBy(manufacturers.manufacturerName),
    db.select().from(sockets).orderBy(sockets.socketName),
    db.select().from(memoryTypes).orderBy(memoryTypes.typeName),
    db.select().from(formFactors).orderBy(formFactors.factorName),
    db.select().from(psuFormFactors).orderBy(psuFormFactors.factorName),
  ]);
  return { manufacturers: m, sockets: s, memoryTypes: mt, formFactors: ff, psuFormFactors: pff };
}
