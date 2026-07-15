import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  CATEGORY_META,
  LEVEL_COLOR,
  RISKS,
  type OceanRisk,
  type RiskCategory,
  type RiskLevel,
} from "@/lib/odis-data";

const OceanMap = lazy(() => import("@/components/OceanMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "ODIS Command Center — Ocean Digital Immune System",
      },
      {
        name: "description",
        content:
          "Live predictive heat map of ocean health: harmful algal blooms, coral bleaching, plastic accumulation, oil spills and IUU fishing — hours to days before they surface.",
      },
    ],
  }),
  component: Dashboard,
});

const CATEGORY_ORDER: RiskCategory[] = [
  "algal_bloom",
  "coral_bleaching",
  "plastic",
  "oil_spill",
  "illegal_fishing",
  "sewage",
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function useClientOnly() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

function Dashboard() {
  const [activeCats, setActiveCats] = useState<Set<RiskCategory>>(
    () => new Set(CATEGORY_ORDER),
  );
  const [minLevel, setMinLevel] = useState<RiskLevel>("healthy");
  const [selectedId, setSelectedId] = useState<string | null>(RISKS[0].id);
  const mounted = useClientOnly();
  const now = useClock();

  const filtered = useMemo(() => {
    const levelRank = { healthy: 0, warning: 1, critical: 2 } as const;
    return RISKS.filter(
      (r) => activeCats.has(r.category) && levelRank[r.level] >= levelRank[minLevel],
    );
  }, [activeCats, minLevel]);

  const selected =
    filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? RISKS[0];

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);

  const stats = useMemo(() => {
    const critical = RISKS.filter((r) => r.level === "critical").length;
    const warning = RISKS.filter((r) => r.level === "warning").length;
    const healthy = RISKS.filter((r) => r.level === "healthy").length;
    const avg =
      RISKS.reduce((a, r) => a + r.probability, 0) / RISKS.length;
    return { critical, warning, healthy, avg: Math.round(avg) };
  }, []);

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar now={now} stats={stats} />

      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-[320px_1fr_360px]">
        {/* Left: filters + threat inventory */}
        <aside className="panel hidden flex-col overflow-hidden border-r lg:flex">
          <SectionLabel>Threat filters</SectionLabel>
          <div className="flex flex-col gap-1 px-4 pb-4">
            {CATEGORY_ORDER.map((cat) => {
              const on = activeCats.has(cat);
              const count = RISKS.filter((r) => r.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const next = new Set(activeCats);
                    if (on) next.delete(cat);
                    else next.add(cat);
                    setActiveCats(next);
                  }}
                  className={`group flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                    on
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="font-mono text-base leading-none"
                      style={{ color: on ? "var(--cyan-glow)" : undefined }}
                    >
                      {CATEGORY_META[cat].icon}
                    </span>
                    <span>{CATEGORY_META[cat].label}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <SectionLabel>Severity floor</SectionLabel>
          <div className="grid grid-cols-3 gap-1 px-4 pb-4">
            {(["healthy", "warning", "critical"] as RiskLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setMinLevel(lvl)}
                className={`rounded-md border px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                  minLevel === lvl
                    ? "border-primary/50 bg-primary/15 text-foreground"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                  style={{ background: LEVEL_COLOR[lvl] }}
                />
                {lvl.slice(0, 4)}
              </button>
            ))}
          </div>

          <SectionLabel>Active alerts · {filtered.length}</SectionLabel>
          <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
            {filtered
              .slice()
              .sort((a, b) => b.probability - a.probability)
              .map((r) => (
                <AlertRow
                  key={r.id}
                  risk={r}
                  active={selectedId === r.id}
                  onClick={() => setSelectedId(r.id)}
                />
              ))}
          </div>
        </aside>

        {/* Center: map */}
        <section className="relative min-h-0 border-l border-r border-border/40">
          <div className="absolute inset-0">
            {mounted ? (
              <Suspense fallback={<MapSkeleton />}>
                <OceanMap
                  risks={filtered}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelectedId}
                />
              </Suspense>
            ) : (
              <MapSkeleton />
            )}
          </div>

          {/* Overlays */}
          <div className="pointer-events-none absolute inset-0 scanlines opacity-30" />

          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cyan-glow">
            <span className="inline-flex h-2 w-2 animate-[flicker_1.4s_ease-in-out_infinite] rounded-full bg-[color:var(--cyan-glow)]" />
            LIVE · NASA GIBS + AIS + ARGO fusion
          </div>

          <Legend />
        </section>

        {/* Right: selected detail */}
        <aside className="panel hidden flex-col overflow-hidden border-l lg:flex">
          {selected ? <DetailPanel risk={selected} /> : null}
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      <div className="border-t border-border/40 bg-background lg:hidden">
        {selected ? <DetailPanel risk={selected} compact /> : null}
      </div>
    </main>
  );
}

function TopBar({
  now,
  stats,
}: {
  now: Date;
  stats: { critical: number; warning: number; healthy: number; avg: number };
}) {
  return (
    <header className="panel relative z-10 flex items-center justify-between gap-6 border-b px-5 py-3">
      <div className="flex items-center gap-4">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
          <span className="font-display text-lg font-bold text-cyan-glow text-glow">
            ◐
          </span>
          <span className="pointer-events-none absolute inset-0 rounded-md border border-cyan-glow/30 [animation:pulse-ring_2.8s_ease-out_infinite]" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold tracking-wide">
            ODIS <span className="text-muted-foreground font-normal">/ Ocean Digital Immune System</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            v0.9 — predictive early-warning grid
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <Stat label="Critical" value={stats.critical} color="var(--status-critical)" />
        <Stat label="Warning" value={stats.warning} color="var(--status-warning)" />
        <Stat label="Healthy" value={stats.healthy} color="var(--status-healthy)" />
        <div className="h-8 w-px bg-border" />
        <Stat label="Fleet risk index" value={`${stats.avg}%`} color="var(--cyan-glow)" />
      </div>

      <div className="text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <div>{now.toISOString().slice(0, 10)}</div>
        <div className="text-cyan-glow">{now.toISOString().slice(11, 19)} UTC</div>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="text-right">
      <div
        className="font-display text-xl font-semibold leading-none"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pb-2 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-px flex-1 bg-border/60" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-border/60" />
    </div>
  );
}

function AlertRow({
  risk,
  active,
  onClick,
}: {
  risk: OceanRisk;
  active: boolean;
  onClick: () => void;
}) {
  const color = LEVEL_COLOR[risk.level];
  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-md border px-3 py-2 text-left transition ${
        active
          ? "border-primary/50 bg-primary/10"
          : "border-transparent hover:border-border/70 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="truncate text-xs font-medium text-foreground">
            {risk.name}
          </span>
        </div>
        <span
          className="font-mono text-[11px] font-semibold"
          style={{ color }}
        >
          {risk.probability}%
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{CATEGORY_META[risk.category].short} · {risk.region}</span>
        <span>ETA {risk.eta}</span>
      </div>
    </button>
  );
}

function DetailPanel({ risk, compact }: { risk: OceanRisk; compact?: boolean }) {
  const color = LEVEL_COLOR[risk.level];
  return (
    <div className={`flex flex-col ${compact ? "max-h-[42vh]" : "h-full"} overflow-y-auto`}>
      <div className="border-b border-border/50 px-5 py-4">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color }}
        >
          {risk.level} · {CATEGORY_META[risk.category].label}
        </div>
        <h2 className="mt-2 font-display text-lg font-semibold leading-tight text-foreground">
          {risk.name}
        </h2>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
          {risk.region} · {risk.lat.toFixed(2)}°, {risk.lng.toFixed(2)}°
        </div>
      </div>

      <div className="relative px-5 py-5">
        <div className="flex items-baseline gap-3">
          <span
            className="font-display text-5xl font-bold leading-none"
            style={{ color, textShadow: `0 0 24px ${color}` }}
          >
            {risk.probability}%
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            prediction<br />confidence
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${risk.probability}%`,
              background: `linear-gradient(90deg, transparent, ${color})`,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>ETA {risk.eta}</span>
          <span>Model v0.9 · fusion-lstm</span>
        </div>
      </div>

      <div className="px-5 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Signal fusion
      </div>
      <div className="grid grid-cols-2 gap-2 px-5 pb-5">
        {risk.signals.map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-border/60 bg-muted/30 p-3"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="font-display text-sm font-semibold text-foreground">
                {s.value}
              </span>
              {typeof s.delta === "number" && (
                <span
                  className="font-mono text-[10px]"
                  style={{
                    color:
                      s.delta > 0
                        ? "var(--status-warning)"
                        : "var(--status-healthy)",
                  }}
                >
                  {s.delta > 0 ? "▲" : "▼"} {Math.abs(s.delta)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-5 mb-5 rounded-md border border-cyan-glow/20 bg-primary/5 p-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-glow">
          AI narrative
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {risk.narrative}
        </p>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border/50 bg-surface/60 px-5 py-3">
        <button className="flex-1 rounded-md border border-cyan-glow/40 bg-primary/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-cyan-glow hover:bg-primary/25">
          Dispatch alert
        </button>
        <button className="flex-1 rounded-md border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
          Export brief
        </button>
      </div>
    </div>
  );
}

function Legend() {
  const items: { level: RiskLevel; label: string }[] = [
    { level: "healthy", label: "Healthy" },
    { level: "warning", label: "Warning" },
    { level: "critical", label: "Emergency" },
  ];
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 panel rounded-md px-3 py-2">
      <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        Health index
      </div>
      <div className="flex items-center gap-3">
        {items.map((i) => (
          <div key={i.level} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{
                background: LEVEL_COLOR[i.level],
                boxShadow: `0 0 8px ${LEVEL_COLOR[i.level]}`,
              }}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/80">
              {i.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[oklch(0.12_0.03_240)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,color-mix(in_oklch,var(--cyan-glow)_15%,transparent),transparent_60%)]" />
      <div className="absolute inset-0 scanlines opacity-40" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-glow/80">
        acquiring satellite feed…
      </div>
    </div>
  );
}
