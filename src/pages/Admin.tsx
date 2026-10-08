import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { CATEGORIES, type CategoryKey } from "@contracts/types";

type RefKind = "manufacturers" | "sockets" | "memoryTypes" | "formFactors" | "psuFormFactors";

interface FieldDef {
  name: string;
  label: string;
  kind: "text" | "number" | "checkbox" | "select";
  ref?: RefKind;
  required?: boolean;
}

const FIELDS: Record<Exclude<CategoryKey, "kits">, FieldDef[]> = {
  processors: [
    { name: "model", label: "Модель", kind: "text", required: true },
    { name: "manufacturerId", label: "Производитель", kind: "select", ref: "manufacturers" },
    { name: "socketId", label: "Сокет", kind: "select", ref: "sockets" },
    { name: "cores", label: "Ядра", kind: "number" },
    { name: "threads", label: "Потоки", kind: "number" },
    { name: "baseClock", label: "Базовая частота, ГГц", kind: "number" },
    { name: "boostClock", label: "Турбо частота, ГГц", kind: "number" },
    { name: "tdp", label: "TDP, W", kind: "number" },
    { name: "integratedGpu", label: "Встроенная графика", kind: "checkbox" },
    { name: "memoryTypeId", label: "Тип памяти", kind: "select", ref: "memoryTypes" },
    { name: "maxMemory", label: "Макс. память, ГБ", kind: "number" },
    { name: "powerConsumption", label: "Потребление, W", kind: "number" },
  ],
  motherboards: [
    { name: "model", label: "Модель", kind: "text", required: true },
    { name: "manufacturerId", label: "Производитель", kind: "select", ref: "manufacturers" },
    { name: "socketId", label: "Сокет", kind: "select", ref: "sockets" },
    { name: "formFactorId", label: "Форм-фактор", kind: "select", ref: "formFactors" },
    { name: "chipset", label: "Чипсет", kind: "text" },
    { name: "memoryTypeId", label: "Тип памяти", kind: "select", ref: "memoryTypes" },
    { name: "memorySlots", label: "Слотов памяти", kind: "number" },
    { name: "maxMemory", label: "Макс. память, ГБ", kind: "number" },
    { name: "memorySpeedMax", label: "Макс. частота памяти, МГц", kind: "number" },
    { name: "sataPorts", label: "SATA портов", kind: "number" },
    { name: "m2Slots", label: "M.2 слотов", kind: "number" },
    { name: "pcieSlots", label: "PCIe слотов", kind: "number" },
    { name: "builtinWifi", label: "Wi-Fi на борту", kind: "checkbox" },
    { name: "builtinEthernet", label: "Ethernet на борту", kind: "checkbox" },
  ],
  graphics_cards: [
    { name: "model", label: "Модель", kind: "text", required: true },
    { name: "manufacturerId", label: "Производитель", kind: "select", ref: "manufacturers" },
    { name: "vram", label: "Видеопамять, ГБ", kind: "number" },
    { name: "vramType", label: "Тип памяти (GDDR6…)", kind: "text" },
    { name: "baseClock", label: "Базовая частота, МГц", kind: "number" },
    { name: "boostClock", label: "Турбо частота, МГц", kind: "number" },
    { name: "powerConsumption", label: "Потребление, W", kind: "number" },
    { name: "recommendedPsu", label: "Рекомендуемый БП, W", kind: "number" },
    { name: "length", label: "Длина, мм", kind: "number" },
  ],
  ram: [
    { name: "model", label: "Модель", kind: "text", required: true },
    { name: "manufacturerId", label: "Производитель", kind: "select", ref: "manufacturers" },
    { name: "memoryTypeId", label: "Тип памяти", kind: "select", ref: "memoryTypes" },
    { name: "capacity", label: "Объём, ГБ", kind: "number" },
    { name: "speed", label: "Частота, МГц", kind: "number" },
    { name: "latency", label: "Тайминги (CL16…)", kind: "text" },
    { name: "modulesCount", label: "Модулей в комплекте", kind: "number" },
  ],
  storage: [
    { name: "model", label: "Модель", kind: "text", required: true },
    { name: "manufacturerId", label: "Производитель", kind: "select", ref: "manufacturers" },
    { name: "type", label: "Тип (SSD/HDD)", kind: "text" },
    { name: "capacity", label: "Объём, ГБ", kind: "number" },
    { name: "interface", label: "Интерфейс (SATA / M.2 NVMe)", kind: "text" },
    { name: "readSpeed", label: "Скорость чтения, МБ/с", kind: "number" },
    { name: "writeSpeed", label: "Скорость записи, МБ/с", kind: "number" },
  ],
  power_supplies: [
    { name: "model", label: "Модель", kind: "text", required: true },
    { name: "manufacturerId", label: "Производитель", kind: "select", ref: "manufacturers" },
    { name: "wattage", label: "Мощность, W", kind: "number" },
    { name: "efficiencyRating", label: "Сертификат (80+ Bronze…)", kind: "text" },
    { name: "psuFormFactorId", label: "Форм-фактор", kind: "select", ref: "psuFormFactors" },
    { name: "modular", label: "Модульный", kind: "checkbox" },
  ],
  coolers: [
    { name: "model", label: "Модель", kind: "text", required: true },
    { name: "manufacturerId", label: "Производитель", kind: "select", ref: "manufacturers" },
    { name: "type", label: "Тип (Air/Liquid)", kind: "text" },
    { name: "socketCompatibility", label: "Сокеты (через запятую)", kind: "text" },
    { name: "tdp", label: "Рассеиваемая мощность, W", kind: "number" },
    { name: "noiseLevel", label: "Шум, дБ", kind: "number" },
    { name: "height", label: "Высота, мм", kind: "number" },
  ],
  cases: [
    { name: "model", label: "Модель", kind: "text", required: true },
    { name: "manufacturerId", label: "Производитель", kind: "select", ref: "manufacturers" },
    { name: "formFactorId", label: "Форм-фактор платы", kind: "select", ref: "formFactors" },
    { name: "supportedPsuFormFactors", label: "Форм-факторы БП (через запятую)", kind: "text" },
    { name: "maxPsuLength", label: "Макс. длина БП, мм", kind: "number" },
    { name: "maxGpuLength", label: "Макс. длина GPU, мм", kind: "number" },
    { name: "maxCoolerHeight", label: "Макс. высота кулера, мм", kind: "number" },
    { name: "driveBays35", label: 'Отсеков 3.5"', kind: "number" },
    { name: "driveBays25", label: 'Отсеков 2.5"', kind: "number" },
  ],
};

type AdminCategory = Exclude<CategoryKey, "kits">;
const ADMIN_CATEGORIES = CATEGORIES.filter((c) => c.key !== "kits") as {
  key: AdminCategory;
  label: string;
  short: string;
}[];

const REF_ID: Record<RefKind, string> = {
  manufacturers: "manufacturerId",
  sockets: "socketId",
  memoryTypes: "memoryTypeId",
  formFactors: "formFactorId",
  psuFormFactors: "psuFormFactorId",
};
const REF_NAME: Record<RefKind, string> = {
  manufacturers: "manufacturerName",
  sockets: "socketName",
  memoryTypes: "typeName",
  formFactors: "factorName",
  psuFormFactors: "factorName",
};

export default function Admin() {
  const [category, setCategory] = useState<AdminCategory>("processors");
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const refsQuery = trpc.references.all.useQuery();
  const listQuery = trpc.catalog.list.useQuery({ category });
  const addMut = trpc.admin.add.useMutation();
  const removeMut = trpc.admin.remove.useMutation();

  const fields = FIELDS[category];
  const refs = refsQuery.data;

  const refOptions = (kind: RefKind) => {
    if (!refs) return [];
    const arr = refs[kind] as unknown as Record<string, unknown>[];
    return arr.map((o) => ({
      id: Number(o[REF_ID[kind]]),
      name: String(o[REF_NAME[kind]]),
    }));
  };

  const setVal = (name: string, v: string | boolean) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  const submit = () => {
    setNotice(null);
    const data: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = values[f.name];
      if (f.kind === "checkbox") {
        data[f.name] = raw === true;
      } else if (f.kind === "number" || f.kind === "select") {
        const s = String(raw ?? "").trim();
        data[f.name] = s === "" ? null : Number(s.replace(",", "."));
      } else {
        const s = String(raw ?? "").trim();
        data[f.name] = s === "" ? null : s;
      }
    }
    if (!String(values.model ?? "").trim()) {
      setNotice({ ok: false, text: "Заполните поле «Модель»." });
      return;
    }
    addMut.mutate(
      { category, data },
      {
        onSuccess: () => {
          setNotice({ ok: true, text: `«${values.model}» добавлено в базу.` });
          setValues({});
          listQuery.refetch();
        },
        onError: (e) => setNotice({ ok: false, text: `Ошибка: ${e.message}` }),
      },
    );
  };

  const rows = useMemo(
    () => (listQuery.data ?? []) as { id: number; model: string; manufacturer: string | null }[],
    [listQuery.data],
  );

  return (
    <div className="flex h-full min-h-0">
      {/* левая колонка: выбор типа + форма */}
      <div className="flex w-[520px] flex-none flex-col border-r border-[#1a2540] bg-[#0c1220]">
        <div className="flex-none border-b border-[#1a2540] px-4 py-2.5">
          <span className="micro-label">управление базой данных /</span>
          <h1 className="mt-0.5 font-mono text-[13px] font-bold tracking-[0.06em] text-[#dce4f5]">
            Добавление комплектующих
          </h1>
        </div>
        <div className="flex-none flex-wrap flex gap-1 border-b border-[#1a2540] p-2">
          {ADMIN_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                setCategory(c.key);
                setValues({});
                setNotice(null);
              }}
              className={`border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                category === c.key
                  ? "border-[#22d3ee]/60 bg-[#22d3ee]/15 text-[#22d3ee]"
                  : "border-[#1a2540] text-[#7c8aa8] hover:text-[#dce4f5]"
              }`}
            >
              {c.short}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#7c8aa8]">
            тип: <span className="text-[#22d3ee]">{ADMIN_CATEGORIES.find((c) => c.key === category)?.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {fields.map((f) => (
              <label key={f.name} className={f.kind === "checkbox" ? "col-span-2 flex items-center gap-2" : "block"}>
                {f.kind === "checkbox" ? (
                  <>
                    <input
                      type="checkbox"
                      checked={values[f.name] === true}
                      onChange={(e) => setVal(f.name, e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#22d3ee]"
                    />
                    <span className="text-[12px] text-[#dce4f5]">{f.label}</span>
                  </>
                ) : (
                  <>
                    <span className="micro-label mb-1 block">
                      {f.label}
                      {f.required && <span className="text-[#f87171]"> *</span>}
                    </span>
                    {f.kind === "select" ? (
                      <select
                        value={String(values[f.name] ?? "")}
                        onChange={(e) => setVal(f.name, e.target.value)}
                        className="w-full border border-[#1a2540] bg-[#050810] px-2 py-1.5 text-[12px] text-[#dce4f5] outline-none focus:border-[#22d3ee]/60"
                      >
                        <option value="">— не выбрано —</option>
                        {f.ref && refOptions(f.ref).map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={String(values[f.name] ?? "")}
                        onChange={(e) => setVal(f.name, e.target.value)}
                        inputMode={f.kind === "number" ? "decimal" : undefined}
                        className="w-full border border-[#1a2540] bg-[#050810] px-2 py-1.5 text-[12px] text-[#dce4f5] outline-none focus:border-[#22d3ee]/60"
                      />
                    )}
                  </>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex-none border-t border-[#1a2540] bg-[#050810] p-3">
          {notice && (
            <div
              className={`mb-2 px-2.5 py-1.5 text-[12px] ${
                notice.ok
                  ? "border border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]"
                  : "alert-card text-[#f0b9b9]"
              }`}
            >
              {notice.text}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setValues({})}
              className="border border-[#1a2540] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#7c8aa8] hover:text-[#dce4f5]"
            >
              Отмена
            </button>
            <button
              onClick={submit}
              disabled={addMut.isPending}
              className="border border-[#34d399] bg-[#34d399] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#050810] transition-colors hover:bg-[#34d399]/85 disabled:opacity-50"
            >
              {addMut.isPending ? "сохранение…" : "Добавить"}
            </button>
          </div>
        </div>
      </div>

      {/* правая колонка: текущее содержимое таблицы */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-none items-center gap-2 border-b border-[#1a2540] bg-[#0c1220] px-4 py-2.5">
          <span className="led led-accent" />
          <span className="micro-label">в таблице сейчас</span>
          <span className="ml-auto font-mono text-[11px] text-[#7c8aa8]">{rows.length} записей</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {listQuery.isLoading ? (
            <div className="p-6 font-mono text-[12px] text-[#7c8aa8]">загрузка…</div>
          ) : (
            <ul>
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 border-b border-[#1a2540]/70 px-4 py-2 hover:bg-[#111a2b]"
                >
                  <span className="flex-none font-mono text-[10px] text-[#4a5a7a]">#{r.id}</span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#dce4f5]">{r.model}</span>
                  <span className="flex-none font-mono text-[10px] uppercase tracking-wider text-[#4a5a7a]">
                    {r.manufacturer ?? ""}
                  </span>
                  <button
                    onClick={() =>
                      removeMut.mutate(
                        { category, id: r.id },
                        { onSuccess: () => listQuery.refetch() },
                      )
                    }
                    className="flex-none border border-[#1a2540] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#7c8aa8] transition-colors hover:border-[#f87171]/60 hover:text-[#f87171]"
                  >
                    удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
