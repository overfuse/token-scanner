import { memo, useId } from "react";

export interface FiltersState {
  chain?: "ETH" | "SOL" | "BASE" | "BSC" | null;
  minVol24H?: number | null;
  maxAge?: number | null;
  minMcap?: number | null;
  isNotHP?: boolean | null;
}

export interface FiltersProps {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  realtime?: boolean;
  onChangeRealtime?: (next: boolean) => void;
}

export const Filters = memo(function Filters({
  value,
  onChange,
  realtime,
  onChangeRealtime,
}: FiltersProps) {
  const rtId = useId();
  const hpId = useId();
  return (
    <div className="flex flex-wrap flex-shrink-0 h-fit items-end gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-md">
      <div>
        <label className="block text-xs text-neutral-400">Chain</label>
        <select
          className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-sm"
          value={value.chain ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              chain: (e.target.value || null) as FiltersState["chain"],
            })
          }
        >
          <option value="">All</option>
          <option value="ETH">ETH</option>
          <option value="SOL">SOL</option>
          <option value="BASE">BASE</option>
          <option value="BSC">BSC</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-neutral-400">Volume 24h</label>
        <select
          className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-sm"
          value={value.minVol24H ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              minVol24H: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">Any</option>
          <option value={1000}>{">$1K in the last 24h"}</option>
          <option value={5000}>{">$5K"}</option>
          <option value={10000}>{">$10K"}</option>
          <option value={50000}>{">$50K"}</option>
          <option value={100000}>{">$100K"}</option>
          <option value={250000}>{">$250K"}</option>
          <option value={500000}>{">$500K"}</option>
          <option value={1000000}>{">$1M"}</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-neutral-400">Age</label>
        <select
          className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-sm"
          value={value.maxAge ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              maxAge: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">Any</option>
          <option value={3600}>1 hour</option>
          <option value={10800}>3 hours</option>
          <option value={21600}>6 hours</option>
          <option value={43200}>12 hours</option>
          <option value={86400}>24 hours</option>
          <option value={259200}>3 days</option>
          <option value={604800}>7 days</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          id={hpId}
          type="checkbox"
          className="accent-emerald-500"
          checked={Boolean(value.isNotHP)}
          onChange={(e) => onChange({ ...value, isNotHP: e.target.checked })}
        />
        <label htmlFor={hpId} className="text-sm text-neutral-300 select-none">
          Exclude honeypots
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id={rtId}
          type="checkbox"
          className="accent-emerald-500"
          checked={Boolean(realtime)}
          onChange={(e) => onChangeRealtime?.(e.target.checked)}
        />
        <label htmlFor={rtId} className="text-sm text-neutral-300 select-none">
          Realtime updates
        </label>
      </div>
    </div>
  );
});
