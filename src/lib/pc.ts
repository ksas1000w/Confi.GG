import type { CategoryKey, CompatibilityStatus } from "@contracts/types";

export interface ConfigItem {
  uid: string;
  category: CategoryKey;
  componentId: number;
  model: string;
  shop: string;
  price: number;
  quantity: number;
  kitId?: number;
  kitName?: string;
  isKitHeader?: boolean;
  integrated?: boolean;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const fmtPrice = (n: number) =>
  `${n.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽`;

export const statusKey = (category: CategoryKey, id: number) => `${category}:${id}`;

export type StatusMap = Map<string, CompatibilityStatus>;

export const STATUS_ORDER: Record<CompatibilityStatus, number> = {
  Compatible: 0,
  Warning: 1,
  Incompatible: 2,
};

type Row = Record<string, unknown> & { id: number; model: string };

const dash = "—";
const v = (x: unknown, suffix = "") =>
  x === null || x === undefined || x === "" ? null : `${x}${suffix}`;

export function specChips(category: CategoryKey, r: Row): string[] {
  const c = (x: unknown, suffix = "") => v(x, suffix);
  switch (category) {
    case "processors":
      return [
        c(r.socket),
        r.cores ? `${r.cores} ядер / ${r.threads} потоков` : null,
        r.baseClock ? `${r.baseClock}–${r.boostClock ?? "?"} ГГц` : null,
        r.powerConsumption ? `TDP ${r.powerConsumption}W` : null,
        r.integratedGpu ? "iGPU" : null,
        c(r.memoryType),
      ].filter(Boolean) as string[];
    case "motherboards":
      return [
        c(r.socket),
        c(r.formFactor),
        c(r.chipset),
        c(r.memoryType),
        r.memorySlots ? `${r.memorySlots}×DIMM` : null,
        r.memorySpeedMax ? `${r.memorySpeedMax} МГц` : null,
        r.m2Slots ? `M.2×${r.m2Slots}` : null,
        r.sataPorts !== null && r.sataPorts !== undefined ? `SATA×${r.sataPorts}` : null,
        r.integratedCpuModel ? "со встроенным CPU" : null,
      ].filter(Boolean) as string[];
    case "graphics_cards":
      return [
        r.vram ? `${r.vram} ГБ ${r.vramType ?? ""}`.trim() : null,
        r.powerConsumption ? `${r.powerConsumption}W` : null,
        r.recommendedPsu ? `БП от ${r.recommendedPsu}W` : null,
        r.length ? `${r.length} мм` : null,
      ].filter(Boolean) as string[];
    case "ram":
      return [
        c(r.memoryType),
        r.capacity ? `${r.capacity} ГБ` : null,
        r.speed ? `${r.speed} МГц` : null,
        c(r.latency),
        r.modulesCount ? `${r.modulesCount} мод.` : null,
      ].filter(Boolean) as string[];
    case "storage":
      return [
        c(r.type),
        r.capacity ? `${r.capacity} ГБ` : null,
        c(r.interface),
        r.readSpeed ? `R ${r.readSpeed}` : null,
        r.writeSpeed ? `W ${r.writeSpeed}` : null,
      ].filter(Boolean) as string[];
    case "power_supplies":
      return [
        r.wattage ? `${r.wattage}W` : null,
        c(r.efficiencyRating),
        c(r.psuFormFactor),
        r.modular ? "модульный" : null,
      ].filter(Boolean) as string[];
    case "coolers":
      return [
        c(r.type),
        r.tdp ? `TDP ${r.tdp}W` : null,
        r.height ? `${r.height} мм` : null,
        c(r.socketCompatibility),
      ].filter(Boolean) as string[];
    case "cases":
      return [
        c(r.formFactor),
        r.supportedPsuFormFactors ? `БП: ${r.supportedPsuFormFactors}` : null,
        r.maxGpuLength ? `GPU ≤ ${r.maxGpuLength} мм` : null,
        r.maxCoolerHeight ? `кулер ≤ ${r.maxCoolerHeight} мм` : null,
      ].filter(Boolean) as string[];
    default:
      return [dash];
  }
}
