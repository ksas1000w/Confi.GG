import { getDb } from "../queries/connection";
import {
  processors,
  motherboards,
  ram,
  graphicsCards,
  storage,
  powerSupplies,
  coolers,
  cases,
  sockets,
  memoryTypes,
  formFactors,
  psuFormFactors,
} from "@db/schema";
import { eq, inArray } from "drizzle-orm";
import type {
  CheckInput,
  CheckResult,
  CompatibilityStatus,
  StatusEntry,
} from "@contracts/types";


const SOCKET_MEMORY_SUPPORT: Record<string, string[]> = {
  LGA1851: ["DDR5"],
  LGA1700: ["DDR4", "DDR5"],
  LGA1200: ["DDR4"],
  LGA1151V2: ["DDR4"],
  LGA1151: ["DDR4"],
  LGA1155: ["DDR3"],
  LGA1156: ["DDR3"],
  LGA775: ["DDR3"],
  LGA2011: ["DDR3"],
  "LGA2011-3": ["DDR3", "DDR4"],
  LGA2066: ["DDR4"],
  STR5: ["DDR4"],
  AM5: ["DDR5"],
  AM4: ["DDR4"],
  "FM2+": ["DDR3"],
};

const CASE_MB_COMPATIBILITY: Record<string, string[]> = {
  "Mini-ITX": ["Mini-ITX"],
  "Micro-ATX": ["Micro-ATX", "Mini-ITX"],
  ATX: ["ATX", "Micro-ATX", "Mini-ITX"],
  EATX: ["EATX", "ATX", "Micro-ATX", "Mini-ITX"],
};

function socketSupportsMemoryType(socket: string, memoryType: string): boolean {
  const norm = socket.toUpperCase().replace(/[\s-]/g, "");
  for (const [key, types] of Object.entries(SOCKET_MEMORY_SUPPORT)) {
    if (key.toUpperCase().replace(/[\s-]/g, "") === norm) {
      return types.includes(memoryType.toUpperCase());
    }
  }
  return false;
}

function processorHasIGpu(model: string, dbFlag: boolean | null): boolean {
  if (dbFlag) return true;
  const m = model.toUpperCase().replace(/\s/g, "");
  if (m.includes("INTEL")) return !(m.includes("F") || m.includes("XEON"));
  if (m.includes("AMD")) {
    return /G|A4|A6|A8|A10/.test(m);
  }
  return false;
}

export async function checkCompatibility(input: CheckInput): Promise<CheckResult> {
  const db = getDb();
  const issues: string[] = [];
  const statuses = new Map<string, CompatibilityStatus>();

  const setStatus = (
    category: StatusEntry["category"],
    id: number | undefined,
    status: CompatibilityStatus,
  ) => {
    if (id === undefined) return;
    const key = `${category}:${id}`;
    const prev = statuses.get(key);
    if (prev === "Incompatible") return;
    if (prev === "Warning" && status === "Compatible") return;
    statuses.set(key, status);
  };

  const cpu = input.processorId
    ? (await db.select().from(processors).where(eq(processors.processorId, input.processorId)))[0]
    : undefined;
  const mb = input.motherboardId
    ? (await db.select().from(motherboards).where(eq(motherboards.motherboardId, input.motherboardId)))[0]
    : undefined;
  const gpu = input.gpuId
    ? (await db.select().from(graphicsCards).where(eq(graphicsCards.gpuId, input.gpuId)))[0]
    : undefined;
  const psu = input.psuId
    ? (await db.select().from(powerSupplies).where(eq(powerSupplies.psuId, input.psuId)))[0]
    : undefined;
  const cooler = input.coolerId
    ? (await db.select().from(coolers).where(eq(coolers.coolerId, input.coolerId)))[0]
    : undefined;
  const pcCase = input.caseId
    ? (await db.select().from(cases).where(eq(cases.caseId, input.caseId)))[0]
    : undefined;
  const ramModules = input.ramIds.length
    ? await db.select().from(ram).where(inArray(ram.ramId, input.ramIds))
    : [];
  const storageDevices = input.storageIds.length
    ? await db.select().from(storage).where(inArray(storage.storageId, input.storageIds))
    : [];

  const socketName = async (id: number | null | undefined) =>
    id == null ? "" : ((await db.select().from(sockets).where(eq(sockets.socketId, id)))[0]?.socketName ?? "");
  const memTypeName = async (id: number | null | undefined) =>
    id == null ? "" : ((await db.select().from(memoryTypes).where(eq(memoryTypes.memoryTypeId, id)))[0]?.typeName ?? "");
  const ffName = async (id: number | null | undefined) =>
    id == null ? "" : ((await db.select().from(formFactors).where(eq(formFactors.formFactorId, id)))[0]?.factorName ?? "");
  const psuFfName = async (id: number | null | undefined) =>
    id == null ? "" : ((await db.select().from(psuFormFactors).where(eq(psuFormFactors.psuFormFactorId, id)))[0]?.factorName ?? "");

  const cpuSocket = cpu ? await socketName(cpu.socketId) : "";
  const mbSocket = mb ? await socketName(mb.socketId) : "";
  const mbMemType = mb ? await memTypeName(mb.memoryTypeId) : "";
  const mbFormFactor = mb ? await ffName(mb.formFactorId) : "";
  const caseFormFactor = pcCase ? await ffName(pcCase.formFactorId) : "";

  if (cpu && mb && cpuSocket !== mbSocket) {
    issues.push(
      `Несовместимость сокетов: процессор (${cpuSocket}) и материнская плата (${mbSocket})`,
    );
    setStatus("processors", cpu.processorId, "Incompatible");
    setStatus("motherboards", mb.motherboardId, "Incompatible");
  } else if (cpu && mb) {
    setStatus("processors", cpu.processorId, "Compatible");
    setStatus("motherboards", mb.motherboardId, "Compatible");
  }

  for (const module of ramModules) {
    if (!mb) continue;
    const ramMemType = await memTypeName(module.memoryTypeId);
    const ramSpeed = module.speed ?? 0;
    const mbSpeed = mb.memorySpeedMax ?? 0;

    const socketOk = cpu ? socketSupportsMemoryType(cpuSocket, ramMemType) : true;
    const typeMismatch = mbMemType !== ramMemType;

    if (typeMismatch || !socketOk) {
      issues.push(`ОЗУ «${module.model}» несовместимо с материнской платой или процессором`);
      setStatus("ram", module.ramId, "Incompatible");
      setStatus("motherboards", mb.motherboardId, "Incompatible");
      if (cpu && !socketOk) {
        issues.push(`Сокет ${cpuSocket} не поддерживает тип памяти ${ramMemType}`);
        setStatus("processors", cpu.processorId, "Incompatible");
      }
    } else if (ramSpeed > mbSpeed && mbSpeed > 0) {
      issues.push(
        `Частота ОЗУ (${ramSpeed} МГц) выше, чем поддержка платы (${mbSpeed} МГц)`,
      );
      setStatus("ram", module.ramId, "Warning");
      setStatus("motherboards", mb.motherboardId, "Warning");
    } else {
      setStatus("ram", module.ramId, "Compatible");
      setStatus("motherboards", mb.motherboardId, "Compatible");
    }
  }

  if (pcCase) {
    if (mb && mbFormFactor && caseFormFactor) {
      const supported = CASE_MB_COMPATIBILITY[caseFormFactor] ?? [];
      if (!supported.includes(mbFormFactor)) {
        issues.push(
          `Материнская плата (${mbFormFactor}) несовместима с корпусом (${caseFormFactor})`,
        );
        setStatus("cases", pcCase.caseId, "Incompatible");
        setStatus("motherboards", mb.motherboardId, "Incompatible");
      }
    }
    if (gpu && (pcCase.maxGpuLength ?? 0) > 0 && (gpu.length ?? 0) > (pcCase.maxGpuLength ?? 0)) {
      issues.push(
        `Видеокарта слишком длинная (${gpu.length} мм) для корпуса (максимум ${pcCase.maxGpuLength} мм)`,
      );
      setStatus("cases", pcCase.caseId, "Incompatible");
      setStatus("graphics_cards", gpu.gpuId, "Incompatible");
    }
    if (cooler && (pcCase.maxCoolerHeight ?? 0) > 0 && (cooler.height ?? 0) > (pcCase.maxCoolerHeight ?? 0)) {
      issues.push(
        `Кулер слишком высокий (${cooler.height} мм) для корпуса (максимум ${pcCase.maxCoolerHeight} мм)`,
      );
      setStatus("cases", pcCase.caseId, "Incompatible");
      setStatus("coolers", cooler.coolerId, "Incompatible");
    }
    if (psu && pcCase.supportedPsuFormFactors) {
      const psuFf = await psuFfName(psu.psuFormFactorId);
      if (psuFf && !pcCase.supportedPsuFormFactors.toUpperCase().includes(psuFf.toUpperCase())) {
        issues.push(
          `Блок питания (${psuFf}) несовместим с корпусом (поддерживает: ${pcCase.supportedPsuFormFactors})`,
        );
        setStatus("cases", pcCase.caseId, "Incompatible");
        setStatus("power_supplies", psu.psuId, "Incompatible");
      }
    }
    setStatus("cases", pcCase.caseId, "Compatible");
  }

  if (psu) {
    const totalPower = (cpu?.powerConsumption ?? 0) + (gpu?.powerConsumption ?? 0) + 100;
    if ((psu.wattage ?? 0) < totalPower) {
      issues.push(
        `Мощности блока питания (${psu.wattage}W) может не хватить для системы (рекомендуется ${totalPower}W)`,
      );
      setStatus("power_supplies", psu.psuId, "Incompatible");
    } else {
      setStatus("power_supplies", psu.psuId, "Compatible");
    }
  }

  if (cpu && !gpu) {
    if (processorHasIGpu(cpu.model, cpu.integratedGpu)) {
      setStatus("processors", cpu.processorId, "Compatible");
    } else {
      issues.push(
        "У процессора нет встроенной графики, а видеокарта отсутствует — добавьте видеокарту или выберите процессор со встроенной графикой.",
      );
      setStatus("processors", cpu.processorId, "Incompatible");
    }
  } else if (gpu) {
    setStatus("graphics_cards", gpu.gpuId, "Compatible");
  }

  if (cpu && cooler) {
    const supported = (cooler.socketCompatibility ?? "")
      .split(/[,;]/)
      .map((s) => s.trim().toUpperCase());
    if (!supported.includes(cpuSocket.toUpperCase())) {
      issues.push(`Кулер не поддерживает сокет процессора (${cpuSocket}).`);
      setStatus("processors", cpu.processorId, "Incompatible");
      setStatus("coolers", cooler.coolerId, "Incompatible");
    }
    const cpuTdp = cpu.powerConsumption ?? 0;
    const coolerTdp = cooler.tdp ?? 0;
    if (coolerTdp < cpuTdp) {
      issues.push(`TDP процессора ${cpuTdp}W превышает возможности кулера ${coolerTdp}W.`);
      setStatus("processors", cpu.processorId, "Incompatible");
      setStatus("coolers", cooler.coolerId, "Incompatible");
    } else if (coolerTdp < cpuTdp + 20) {
      issues.push(`Кулер может работать на пределе: CPU ${cpuTdp}W, кулер ${coolerTdp}W.`);
      setStatus("coolers", cooler.coolerId, "Warning");
    } else {
      setStatus("coolers", cooler.coolerId, "Compatible");
    }
  }

  if (mb && storageDevices.length) {
    const m2Slots = mb.m2Slots ?? 0;
    const sataPorts = mb.sataPorts ?? 0;
    let m2Count = 0;
    let sataCount = 0;
    for (const drive of storageDevices) {
      const iface = (drive.interface ?? "").toUpperCase();
      if (iface.includes("M.2") || iface.includes("NVME")) {
        m2Count++;
        if (m2Slots === 0) {
          issues.push(
            `M.2 накопитель «${drive.model}» несовместим — на материнской плате нет M.2 слотов`,
          );
          setStatus("storage", drive.storageId, "Incompatible");
          setStatus("motherboards", mb.motherboardId, "Incompatible");
        } else if (m2Count > m2Slots) {
          issues.push(
            `Количество M.2 накопителей (${m2Count}) превышает количество M.2 слотов на материнской плате (${m2Slots})`,
          );
          setStatus("storage", drive.storageId, "Incompatible");
        } else {
          setStatus("storage", drive.storageId, "Compatible");
        }
      } else if (iface.includes("SATA")) {
        sataCount++;
        if (sataCount > sataPorts) {
          issues.push(
            `Количество SATA накопителей (${sataCount}) превышает количество SATA портов на материнской плате (${sataPorts})`,
          );
          setStatus("storage", drive.storageId, "Incompatible");
        } else {
          setStatus("storage", drive.storageId, "Compatible");
        }
      } else {
        setStatus("storage", drive.storageId, "Compatible");
      }
    }
  }

  const statusesArr: StatusEntry[] = [...statuses.entries()].map(([key, status]) => {
    const [category, id] = key.split(":");
    return { category: category as StatusEntry["category"], componentId: Number(id), status };
  });

  return { issues, statuses: statusesArr };
}