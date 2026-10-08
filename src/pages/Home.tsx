import { useMemo, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { CATEGORIES, type CategoryKey, type CompatibilityStatus } from "@contracts/types";
import {
  fmtPrice,
  specChips,
  statusKey,
  uid,
  STATUS_ORDER,
  type ConfigItem,
  type StatusMap,
} from "@/lib/pc";

type Row = Record<string, unknown> & { id: number; model: string; manufacturer: string | null };

const EXTRA_CATEGORIES = ["Вентиляторы", "Сетевые адаптеры", "Звуковая карта", "Устройства расширения"];

const STATUS_TEXT: Record<CompatibilityStatus, string> = {
  Compatible: "совместимо",
  Warning: "предупреждение",
  Incompatible: "несовместимо",
};

function statusLed(s?: CompatibilityStatus) {
  if (!s) return "led led-idle";
  return s === "Compatible" ? "led led-ok" : s === "Warning" ? "led led-warn" : "led led-bad";
}
function rowTint(s?: CompatibilityStatus) {
  if (!s) return "";
  return s === "Compatible"
    ? "bg-[rgba(52,211,153,0.05)]"
    : s === "Warning"
      ? "bg-[rgba(251,191,36,0.07)]"
      : "bg-[rgba(248,113,113,0.07)]";
}

export default function Home() {
  const [category, setCategory] = useState<CategoryKey>("processors");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [shop, setShop] = useState("");
  const [price, setPrice] = useState("");
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [statuses, setStatuses] = useState<StatusMap>(new Map());
  const [issues, setIssues] = useState<string[]>([]);
  const [expandedKits, setExpandedKits] = useState<Set<string>>(new Set());

  const isKits = category === "kits";
  const listQuery = trpc.catalog.list.useQuery(
    { category: category as Exclude<CategoryKey, "kits"> },
    { enabled: !isKits },
  );
  const kitsQuery = trpc.catalog.kits.useQuery(undefined, { enabled: isKits });
  const checkMut = trpc.compatibility.check.useMutation();

  const rows = useMemo(() => {
    const data = (listQuery.data ?? []) as Row[];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((r) => r.model.toLowerCase().includes(q));
  }, [listQuery.data, search]);

  const catMeta = CATEGORIES.find((c) => c.key === category)!;

  const addItem = (row: Row) => {
    const p = parseFloat(price.replace(",", "."));
    setItems((prev) => [
      ...prev,
      {
        uid: uid(),
        category: category as CategoryKey,
        componentId: row.id,
        model: row.model,
        shop: shop.trim() || "—",
        price: Number.isFinite(p) ? p : 0,
        quantity: 1,
      },
    ]);
    setExpandedId(null);
    setShop("");
    setPrice("");
    setStatuses(new Map());
    setIssues([]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.uid === id);
      if (target?.isKitHeader) return prev.filter((i) => i.kitId !== target.kitId);
      return prev.filter((i) => i.uid !== id);
    });
    setStatuses(new Map());
    setIssues([]);
  };

  const resetAll = () => {
    setItems([]);
    setStatuses(new Map());
    setIssues([]);
  };

  const runCheck = () => {
    const flat = items.filter((i) => !i.isKitHeader);
    const first = (c: CategoryKey) => flat.find((i) => i.category === c)?.componentId;
    checkMut.mutate(
      {
        processorId: first("processors"),
        motherboardId: first("motherboards"),
        gpuId: first("graphics_cards"),
        psuId: first("power_supplies"),
        coolerId: first("coolers"),
        caseId: first("cases"),
        ramIds: flat.filter((i) => i.category === "ram").map((i) => i.componentId),
        storageIds: flat.filter((i) => i.category === "storage").map((i) => i.componentId),
      },
      {
        onSuccess: (res) => {
          setStatuses(new Map(res.statuses.map((s) => [statusKey(s.category, s.componentId), s.status])));
          setIssues(res.issues);
        },
      },
    );
  };

  const total = items.reduce(
    (sum, i) => sum + (i.isKitHeader ? i.price : i.kitId ? 0 : i.price * i.quantity),
    0,
  );

  const kitChildren = (kitId?: number) => items.filter((i) => i.kitId === kitId && !i.isKitHeader);
  const itemStatus = (i: ConfigItem) => statuses.get(statusKey(i.category, i.componentId));
  const kitStatus = (kitId?: number): CompatibilityStatus | undefined => {
    const sts = kitChildren(kitId)
      .map((i) => itemStatus(i))
      .filter(Boolean) as CompatibilityStatus[];
    if (!sts.length) return undefined;
    return sts.reduce((a, b) => (STATUS_ORDER[a] >= STATUS_ORDER[b] ? a : b));
  };

  const topLevel = items.filter((i) => !i.kitId || i.isKitHeader);

  return (
    <div className="flex h-full min-h-0">
      {/* ── Левая панель: категории ── */}
      <aside className="flex w-60 flex-none flex-col border-r border-[#1a2540] bg-[#0c1220]">
        <div className="p-3">
          <Link
            to="/admin"
            className="block w-full border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-3 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#22d3ee] transition-colors hover:bg-[#22d3ee]/20"
          >
            + Добавить комплектующие
          </Link>
        </div>
        <div className="px-3 pb-1">
          <div className="micro-label">Основные комплектующие</div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                setCategory(c.key);
                setExpandedId(null);
              }}
              className={`group flex w-full items-center gap-2 border-l-2 px-3 py-2 text-left transition-colors ${
                category === c.key
                  ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#dce4f5]"
                  : "border-transparent text-[#7c8aa8] hover:bg-[#111a2b] hover:text-[#dce4f5]"
              }`}
            >
              <span className="font-mono text-[9px] font-bold tracking-wider text-[#4a5a7a] group-hover:text-[#22d3ee] w-8 flex-none">
                {c.short}
              </span>
              <span className="text-[12.5px]">{c.label}</span>
            </button>
          ))}
          <div className="micro-label px-3 pb-1 pt-4">Доп. комплектующие</div>
          {EXTRA_CATEGORIES.map((name) => (
            <div
              key={name}
              className="flex w-full cursor-not-allowed items-center gap-2 border-l-2 border-transparent px-3 py-2 text-[#4a5a7a]"
              title="В веб-версии категория пока недоступна"
            >
              <span className="w-8 flex-none font-mono text-[9px] font-bold tracking-wider">···</span>
              <span className="text-[12.5px]">{name}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Центр: каталог ── */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-none items-center gap-3 border-b border-[#1a2540] bg-[#0c1220] px-4 py-2.5">
          <span className="micro-label">каталог /</span>
          <h1 className="font-mono text-[13px] font-bold tracking-[0.06em] text-[#dce4f5]">
            {catMeta.label}
          </h1>
          {!isKits && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="поиск по модели…"
              className="ml-auto w-56 border border-[#1a2540] bg-[#050810] px-3 py-1.5 font-mono text-[12px] text-[#dce4f5] placeholder-[#4a5a7a] outline-none focus:border-[#22d3ee]/60"
            />
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isKits ? (
            <KitList
              kits={(kitsQuery.data ?? []) as { kitId: number; kitName: string; description: string | null }[]}
              loading={kitsQuery.isLoading}
              onAdd={(kitId, kitName, totalPrice, kitShop, children) => {
                const kid = kitId;
                const header: ConfigItem = {
                  uid: uid(),
                  category: "kits",
                  componentId: kitId,
                  model: kitName,
                  shop: kitShop || "Комплект",
                  price: totalPrice,
                  quantity: 1,
                  kitId: kid,
                  kitName,
                  isKitHeader: true,
                };
                const childItems: ConfigItem[] = children.map((ch) => ({
                  uid: uid(),
                  category: ch.category as CategoryKey,
                  componentId: ch.componentId,
                  model: ch.model,
                  shop: kitShop || "Комплект",
                  price: 0,
                  quantity: ch.quantity,
                  kitId: kid,
                  kitName,
                  integrated: ch.type === "integrated_motherboard",
                }));
                // убираем конфликтующие позиции
                const replaced = new Set(childItems.map((c) => c.category));
                setItems((prev) => [
                  ...prev.filter((i) => i.kitId || !replaced.has(i.category) || i.category === "ram" || i.category === "storage"),
                  header,
                  ...childItems,
                ]);
                setStatuses(new Map());
                setIssues([]);
                setExpandedKits((s) => new Set(s).add(header.uid));
              }}
            />
          ) : listQuery.isLoading ? (
            <div className="p-6 font-mono text-[12px] text-[#7c8aa8]">загрузка каталога…</div>
          ) : rows.length === 0 ? (
            <div className="m-6 border border-dashed border-[#1a2540] p-8 text-center font-mono text-[12px] text-[#4a5a7a]">
              ничего не найдено
            </div>
          ) : (
            <ul>
              {rows.map((r) => {
                const expanded = expandedId === r.id;
                return (
                  <li key={r.id} className="border-b border-[#1a2540]/70">
                    <button
                      onClick={() => setExpandedId(expanded ? null : r.id)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#111a2b] ${expanded ? "bg-[#111a2b]" : ""}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate text-[13px] font-medium text-[#dce4f5]">{r.model}</span>
                          <span className="flex-none font-mono text-[10px] uppercase tracking-wider text-[#4a5a7a]">
                            {r.manufacturer ?? ""}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {specChips(category, r).map((chip, i) => (
                            <span
                              key={i}
                              className="border border-[#1a2540] bg-[#050810] px-1.5 py-0.5 font-mono text-[10px] text-[#7c8aa8]"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`flex-none font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          expanded ? "text-[#22d3ee]" : "text-[#4a5a7a]"
                        }`}
                      >
                        {expanded ? "− закрыть" : "+ добавить"}
                      </span>
                    </button>
                    {expanded && (
                      <div className="flex flex-wrap items-center gap-2 border-t border-[#1a2540]/70 bg-[#0c1220] px-4 py-2.5">
                        <span className="micro-label">магазин</span>
                        <input
                          value={shop}
                          onChange={(e) => setShop(e.target.value)}
                          placeholder="DNS, Ситилинк…"
                          className="w-40 border border-[#1a2540] bg-[#050810] px-2 py-1.5 text-[12px] text-[#dce4f5] placeholder-[#4a5a7a] outline-none focus:border-[#22d3ee]/60"
                        />
                        <span className="micro-label">цена ₽</span>
                        <input
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0"
                          inputMode="numeric"
                          className="w-28 border border-[#1a2540] bg-[#050810] px-2 py-1.5 font-mono text-[12px] text-[#dce4f5] placeholder-[#4a5a7a] outline-none focus:border-[#22d3ee]/60"
                        />
                        <button
                          onClick={() => addItem(r)}
                          className="ml-auto border border-[#22d3ee]/50 bg-[#22d3ee]/15 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#22d3ee] transition-colors hover:bg-[#22d3ee]/25"
                        >
                          В сборку →
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      {/* ── Правая панель: сборка ── */}
      <aside className="flex w-[400px] flex-none flex-col border-l border-[#1a2540] bg-[#0c1220]">
        <div className="flex flex-none items-center gap-2 border-b border-[#1a2540] px-4 py-2.5">
          <span className="led led-accent" />
          <span className="micro-label">собранная конфигурация</span>
          <span className="ml-auto font-mono text-[11px] text-[#7c8aa8]">
            {topLevel.length} поз.
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {topLevel.length === 0 ? (
            <div className="m-4 border border-dashed border-[#1a2540] p-6 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#4a5a7a]">
                сборка пуста
              </div>
              <div className="mt-1 text-[12px] text-[#7c8aa8]">
                выберите комплектующие из каталога слева
              </div>
            </div>
          ) : (
            <ul>
              {topLevel.map((i) => {
                if (i.isKitHeader) {
                  const st = kitStatus(i.kitId);
                  const expanded = expandedKits.has(i.uid);
                  const children = kitChildren(i.kitId);
                  return (
                    <li key={i.uid} className={`border-b border-[#1a2540]/70 ${rowTint(st)}`}>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <button
                          onClick={() =>
                            setExpandedKits((s) => {
                              const n = new Set(s);
                              if (n.has(i.uid)) n.delete(i.uid);
                              else n.add(i.uid);
                              return n;
                            })
                          }
                          className="flex-none font-mono text-[11px] text-[#22d3ee]"
                        >
                          {expanded ? "▾" : "▸"}
                        </button>
                        <span className={statusLed(st)} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-semibold text-[#22d3ee]">{i.model}</div>
                          <div className="font-mono text-[10px] text-[#4a5a7a]">
                            комплект · {children.length} компонентов · {i.shop}
                          </div>
                        </div>
                        <span className="flex-none font-mono text-[12px] text-[#dce4f5]">{fmtPrice(i.price)}</span>
                        <button
                          onClick={() => removeItem(i.uid)}
                          className="flex-none px-1 font-mono text-[13px] text-[#4a5a7a] hover:text-[#f87171]"
                          title="Удалить комплект"
                        >
                          ×
                        </button>
                      </div>
                      {expanded && (
                        <ul className="border-t border-[#1a2540]/50">
                          {children.map((ch) => {
                            const cst = itemStatus(ch);
                            return (
                              <li
                                key={ch.uid}
                                className={`flex items-center gap-2 border-b border-[#1a2540]/40 py-1.5 pl-9 pr-3 ${rowTint(cst)}`}
                              >
                                <span className={statusLed(cst)} />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-[12px] text-[#dce4f5]">
                                    {ch.model}
                                    {ch.quantity > 1 && <span className="text-[#7c8aa8]"> ×{ch.quantity}</span>}
                                  </div>
                                  <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#4a5a7a]">
                                    {ch.integrated ? "MB + CPU + охлаждение" : CATEGORIES.find((c) => c.key === ch.category)?.label}
                                  </div>
                                </div>
                                {cst && (
                                  <span className="flex-none font-mono text-[9.5px] uppercase tracking-wider text-[#7c8aa8]">
                                    {STATUS_TEXT[cst]}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }
                const st = itemStatus(i);
                return (
                  <li key={i.uid} className={`flex items-center gap-2 border-b border-[#1a2540]/70 px-3 py-2 ${rowTint(st)}`}>
                    <span className={statusLed(st)} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] text-[#dce4f5]">{i.model}</div>
                      <div className="font-mono text-[10px] text-[#4a5a7a]">
                        {CATEGORIES.find((c) => c.key === i.category)?.label} · {i.shop}
                        {st && <span> · {STATUS_TEXT[st]}</span>}
                      </div>
                    </div>
                    <span className="flex-none font-mono text-[12px] text-[#dce4f5]">{fmtPrice(i.price)}</span>
                    <button
                      onClick={() => removeItem(i.uid)}
                      className="flex-none px-1 font-mono text-[13px] text-[#4a5a7a] hover:text-[#f87171]"
                      title="Удалить"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex-none border-t border-[#1a2540] bg-[#050810] p-3">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="micro-label">итого</span>
            <span className="font-mono text-[20px] font-bold tracking-tight text-[#22d3ee]">
              {fmtPrice(total)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runCheck}
              disabled={checkMut.isPending || topLevel.length === 0}
              className="flex-1 border border-[#22d3ee] bg-[#22d3ee] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#050810] transition-colors hover:bg-[#22d3ee]/85 disabled:cursor-not-allowed disabled:border-[#1a2540] disabled:bg-[#111a2b] disabled:text-[#4a5a7a]"
            >
              {checkMut.isPending ? "проверка…" : "Проверить совместимость"}
            </button>
            <button
              onClick={resetAll}
              className="border border-[#1a2540] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#7c8aa8] transition-colors hover:border-[#f87171]/50 hover:text-[#f87171]"
            >
              Сброс
            </button>
          </div>
          {issues.length > 0 && (
            <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto">
              {issues.map((issue, idx) => (
                <div key={idx} className="alert-card px-2.5 py-1.5 text-[11.5px] leading-snug text-[#f0b9b9]">
                  {issue}
                </div>
              ))}
            </div>
          )}
          {issues.length === 0 && statuses.size > 0 && (
            <div className="mt-3 flex items-center gap-2 border border-[#34d399]/30 bg-[#34d399]/10 px-2.5 py-1.5">
              <span className="led led-ok" />
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#34d399]">
                конфликтов не найдено
              </span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─── Список комплектов ─────────────────────────────────────────

function KitList({
  kits,
  loading,
  onAdd,
}: {
  kits: { kitId: number; kitName: string; description: string | null }[];
  loading: boolean;
  onAdd: (
    kitId: number,
    kitName: string,
    totalPrice: number,
    shop: string,
    children: { type: string; componentId: number; quantity: number; model: string; category: string }[],
  ) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [shop, setShop] = useState("");
  const [price, setPrice] = useState("");
  const compsQuery = trpc.catalog.kitComponents.useQuery(
    { kitId: openId ?? -1 },
    { enabled: openId !== null },
  );

  if (loading) return <div className="p-6 font-mono text-[12px] text-[#7c8aa8]">загрузка комплектов…</div>;

  return (
    <ul className="p-3">
      {kits.map((k) => {
        const open = openId === k.kitId;
        return (
          <li key={k.kitId} className="mb-2 border border-[#1a2540] bg-[#0c1220]">
            <button
              onClick={() => setOpenId(open ? null : k.kitId)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#111a2b]"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-[#22d3ee]">{k.kitName}</div>
                {k.description && (
                  <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#7c8aa8]">{k.description}</div>
                )}
              </div>
              <span className={`flex-none font-mono text-[11px] font-semibold uppercase tracking-wider ${open ? "text-[#22d3ee]" : "text-[#4a5a7a]"}`}>
                {open ? "− закрыть" : "+ состав"}
              </span>
            </button>
            {open && (
              <div className="border-t border-[#1a2540] px-4 py-3">
                {compsQuery.isLoading ? (
                  <div className="font-mono text-[11px] text-[#7c8aa8]">загрузка состава…</div>
                ) : (
                  <ul className="mb-3 space-y-1">
                    {(compsQuery.data ?? []).map((c, i) => (
                      <li key={i} className="flex items-center gap-2 font-mono text-[11.5px] text-[#7c8aa8]">
                        <span className="led led-idle" />
                        <span className="uppercase tracking-wider text-[#4a5a7a]">[{c.type}]</span>
                        <span className="text-[#dce4f5]">{c.model}</span>
                        {c.quantity > 1 && <span>×{c.quantity}</span>}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="micro-label">магазин</span>
                  <input
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                    placeholder="Комплект"
                    className="w-36 border border-[#1a2540] bg-[#050810] px-2 py-1.5 text-[12px] text-[#dce4f5] placeholder-[#4a5a7a] outline-none focus:border-[#22d3ee]/60"
                  />
                  <span className="micro-label">цена комплекта ₽</span>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    inputMode="numeric"
                    className="w-28 border border-[#1a2540] bg-[#050810] px-2 py-1.5 font-mono text-[12px] text-[#dce4f5] placeholder-[#4a5a7a] outline-none focus:border-[#22d3ee]/60"
                  />
                  <button
                    onClick={() => {
                      const p = parseFloat(price.replace(",", "."));
                      onAdd(k.kitId, k.kitName, Number.isFinite(p) ? p : 0, shop.trim(), compsQuery.data ?? []);
                      setShop("");
                      setPrice("");
                    }}
                    disabled={!compsQuery.data}
                    className="ml-auto border border-[#22d3ee]/50 bg-[#22d3ee]/15 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#22d3ee] transition-colors hover:bg-[#22d3ee]/25 disabled:opacity-40"
                  >
                    В сборку →
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
