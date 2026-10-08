export * from "./errors";


export const CATEGORIES = [
  { key: "processors", label: "Процессор (CPU)", short: "CPU", multi: false },
  { key: "motherboards", label: "Материнская плата", short: "MB", multi: false },
  { key: "graphics_cards", label: "Видеокарта (GPU)", short: "GPU", multi: false },
  { key: "ram", label: "Оперативная память (RAM)", short: "RAM", multi: true },
  { key: "storage", label: "Накопитель (SSD/HDD)", short: "SSD", multi: true },
  { key: "power_supplies", label: "Блок питания (PSU)", short: "PSU", multi: false },
  { key: "coolers", label: "Охлаждение", short: "FAN", multi: false },
  { key: "cases", label: "Корпус", short: "CASE", multi: false },
  { key: "kits", label: "Комплект", short: "KIT", multi: false },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export type CompatibilityStatus = "Compatible" | "Warning" | "Incompatible";

export interface CheckInput {
  processorId?: number;
  motherboardId?: number;
  gpuId?: number;
  psuId?: number;
  coolerId?: number;
  caseId?: number;
  ramIds: number[];
  storageIds: number[];
}

export interface StatusEntry {
  category: CategoryKey;
  componentId: number;
  status: CompatibilityStatus;
}

export interface CheckResult {
  issues: string[];
  statuses: StatusEntry[];
}
