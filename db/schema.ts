import {
  mysqlTable,
  varchar,
  text,
  int,
  bigint,
  boolean,
  decimal,
  foreignKey,
} from "drizzle-orm/mysql-core";

const fk = (name: string) =>
  bigint(name, { mode: "number", unsigned: true });

const pk = (name: string) => 
  bigint(name, { mode: "number", unsigned: true }).primaryKey().autoincrement();


export const manufacturers = mysqlTable("manufacturers", {
  manufacturerId: pk("manufacturer_id"),
  manufacturerName: varchar("manufacturer_name", { length: 100 }).notNull().unique(),
});

export const sockets = mysqlTable("sockets", {
  socketId: pk("socket_id"),
  socketName: varchar("socket_name", { length: 50 }).notNull().unique(),
});

export const memoryTypes = mysqlTable("memory_types", {
  memoryTypeId: pk("memory_type_id"),
  typeName: varchar("type_name", { length: 20 }).notNull().unique(),
});

export const formFactors = mysqlTable("form_factors", {
  formFactorId: pk("form_factor_id"),
  factorName: varchar("factor_name", { length: 20 }).notNull().unique(),
});

export const psuFormFactors = mysqlTable("psu_form_factors", {
  psuFormFactorId: pk("psu_form_factor_id"),
  factorName: varchar("factor_name", { length: 20 }).notNull().unique(),
});


export const processors = mysqlTable("processors", {
  processorId: pk("processor_id"),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturerId: fk("manufacturer_id").references(() => manufacturers.manufacturerId),
  socketId: fk("socket_id").references(() => sockets.socketId),
  cores: int("cores"),
  threads: int("threads"),
  baseClock: decimal("base_clock", { precision: 4, scale: 2 }),
  boostClock: decimal("boost_clock", { precision: 4, scale: 2 }),
  tdp: int("tdp"),
  integratedGpu: boolean("integrated_gpu").default(false),
  memoryTypeId: fk("memory_type_id").references(() => memoryTypes.memoryTypeId),
  maxMemory: int("max_memory"),
  powerConsumption: int("power_consumption"),
});

export const motherboards = mysqlTable("motherboards", {
  motherboardId: pk("motherboard_id"),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturerId: fk("manufacturer_id").references(() => manufacturers.manufacturerId),
  socketId: fk("socket_id").references(() => sockets.socketId),
  formFactorId: fk("form_factor_id").references(() => formFactors.formFactorId),
  chipset: varchar("chipset", { length: 50 }),
  memoryTypeId: fk("memory_type_id").references(() => memoryTypes.memoryTypeId),
  memorySlots: int("memory_slots"),
  maxMemory: int("max_memory"),
  memorySpeedMax: int("memory_speed_max"),
  sataPorts: int("sata_ports"),
  m2Slots: int("m2_slots"),
  pcieSlots: int("pcie_slots"),
  builtinWifi: boolean("builtin_wifi").default(false),
  builtinEthernet: boolean("builtin_ethernet").default(true),
  integratedCpuModel: varchar("integrated_cpu_model", { length: 100 }),
  integratedCpuDescription: varchar("integrated_cpu_description", { length: 500 }),
  hasIntegratedCooling: boolean("has_integrated_cooling").default(false),
  coolingDescription: varchar("cooling_description", { length: 300 }),
});

export const ram = mysqlTable("ram", {
  ramId: pk("ram_id"),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturerId: fk("manufacturer_id").references(() => manufacturers.manufacturerId),
  memoryTypeId: fk("memory_type_id").references(() => memoryTypes.memoryTypeId),
  capacity: int("capacity"),
  speed: int("speed"),
  latency: varchar("latency", { length: 20 }),
  modulesCount: int("modules_count"),
});

export const graphicsCards = mysqlTable("graphics_cards", {
  gpuId: pk("gpu_id"),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturerId: fk("manufacturer_id").references(() => manufacturers.manufacturerId),
  vram: int("vram"),
  vramType: varchar("vram_type", { length: 10 }),
  baseClock: int("base_clock"),
  boostClock: int("boost_clock"),
  powerConsumption: int("power_consumption"),
  recommendedPsu: int("recommended_psu"),
  length: int("length"),
});

export const storage = mysqlTable("storage", {
  storageId: pk("storage_id"),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturerId: fk("manufacturer_id").references(() => manufacturers.manufacturerId),
  type: varchar("type", { length: 10 }),
  capacity: int("capacity"),
  interface: varchar("interface", { length: 20 }),
  readSpeed: int("read_speed"),
  writeSpeed: int("write_speed"),
});

export const powerSupplies = mysqlTable("power_supplies", {
  psuId: pk("psu_id"),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturerId: fk("manufacturer_id").references(() => manufacturers.manufacturerId),
  wattage: int("wattage"),
  efficiencyRating: varchar("efficiency_rating", { length: 10 }),
  psuFormFactorId: fk("psu_form_factor_id"),
  modular: boolean("modular").default(false),
}, (t) => [
  foreignKey({
    name: "psu_ff_fk",
    columns: [t.psuFormFactorId],
    foreignColumns: [psuFormFactors.psuFormFactorId],
  }),
]);

export const coolers = mysqlTable("coolers", {
  coolerId: pk("cooler_id"),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturerId: fk("manufacturer_id").references(() => manufacturers.manufacturerId),
  type: varchar("type", { length: 20 }),
  socketCompatibility: varchar("socket_compatibility", { length: 255 }),
  tdp: int("tdp"),
  noiseLevel: decimal("noise_level", { precision: 4, scale: 2 }),
  height: int("height"),
});

export const cases = mysqlTable("cases", {
  caseId: pk("case_id"),
  model: varchar("model", { length: 100 }).notNull(),
  manufacturerId: fk("manufacturer_id").references(() => manufacturers.manufacturerId),
  formFactorId: fk("form_factor_id").references(() => formFactors.formFactorId),
  supportedPsuFormFactors: varchar("supported_psu_form_factors", { length: 100 }),
  maxPsuLength: int("max_psu_length"),
  maxGpuLength: int("max_gpu_length"),
  maxCoolerHeight: int("max_cooler_height"),
  driveBays35: int("drive_bays_35"),
  driveBays25: int("drive_bays_25"),
  builtinPsu: boolean("builtin_psu").default(false),
  builtinPsuWattage: int("builtin_psu_wattage"),
});


export const kits = mysqlTable("kits", {
  kitId: pk("kit_id"),
  kitName: varchar("kit_name", { length: 200 }).notNull(),
  description: text("description"),
  compatibilityChecked: boolean("compatibility_checked").default(false),
  compatibilityNotes: text("compatibility_notes"),
});

export const kitComponents = mysqlTable("kit_components", {
  kitComponentId: pk("kit_component_id"),
  kitId: fk("kit_id").references(() => kits.kitId),
  componentType: varchar("component_type", { length: 50 }).notNull(),
  componentId: bigint("component_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").default(1),
});
