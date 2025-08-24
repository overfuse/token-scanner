import { memo, useCallback, useMemo } from "react";
import { TableVirtuoso } from "react-virtuoso";
import numeral from "numeral";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AuditBadge } from "./AuditBadge";
import { TokenCell } from "./table/TokenCell";

export interface ScannerTableRow {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenBaseSymbol?: string;
  chain: string;
  chainId: number;
  exchange: string;
  priceUsd: number;
  priceFlash?: "up" | "down" | null;
  priceFlashAt?: number;
  volumeUsd: number;
  mcap: number;
  mcapChangePc?: number;
  priceChangePcs: { "5m": number; "1h": number; "6h": number; "24h": number };
  transactions: { buys: number; sells: number };
  audit: {
    mintable: boolean;
    freezable: boolean;
    honeypot: boolean;
    contractVerified: boolean;
    renounced: boolean;
    liquidityLocked: boolean;
  };
  tokenCreatedTimestamp: Date;
  liquidity: { current: number; changePc: number };
}

export interface ScannerTableProps {
  title: string;
  rows: ScannerTableRow[];
  isLoading?: boolean;
  onEndReached?: () => void;
  isFetchingMore?: boolean;
}

function formatUsd(n: number) {
  if (!Number.isFinite(n)) return "-";
  if (n >= 1_000_000_000) return `$${numeral(n).format("0.00a").toUpperCase()}`;
  if (n >= 10_000) return `$${numeral(n).format("0.0a").toUpperCase()}`;
  return `$${numeral(n).format("0,0.0000")}`;
}

function formatCount(n: number) {
  if (!Number.isFinite(n)) return "-";
  if (n >= 1_000) return numeral(n).format("0.00a").toUpperCase();
  return numeral(n).format("0,0");
}

function formatAge(d: Date) {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export const ScannerTable = memo(function ScannerTable({
  title,
  rows,
  isLoading,
  onEndReached,
  isFetchingMore,
}: ScannerTableProps) {
  const columns = useMemo<ColumnDef<ScannerTableRow>[]>(
    () => [
      {
        id: "token",
        header: "Token",
        enableSorting: false,
        cell: TokenCell,
      },
      {
        id: "priceUsd",
        header: () => <div className="text-right">Price</div>,
        accessorKey: "priceUsd",
        enableSorting: false,
        cell: ({ row, getValue }) => {
          const flash = row.original.priceFlash;
          const flashAt = row.original.priceFlashAt ?? 0;
          const active = flash && Date.now() - flashAt < 800;
          const bg = active
            ? flash === "up"
              ? "bg-emerald-900/30"
              : "bg-rose-900/30"
            : "";
          return (
            <div className={"text-right transition-colors duration-300 " + bg}>
              {formatUsd(Number(getValue()))}
            </div>
          );
        },
      },
      {
        id: "age",
        header: () => <div className="text-right">Age</div>,
        enableSorting: false,
        accessorFn: (r) => r.tokenCreatedTimestamp.getTime(),
        cell: ({ row }) => (
          <div className="text-right text-neutral-400">
            {formatAge(row.original.tokenCreatedTimestamp)}
          </div>
        ),
      },
      {
        id: "volumeUsd",
        header: () => <div className="text-right">Volume</div>,
        accessorKey: "volumeUsd",
        enableSorting: false,
        cell: ({ getValue }) => (
          <div className="text-right">{formatUsd(Number(getValue()))}</div>
        ),
      },
      {
        id: "tx",
        header: () => <div className="text-right">Transactions</div>,
        enableSorting: false,
        accessorFn: (r) =>
          (r.transactions?.buys ?? 0) + (r.transactions?.sells ?? 0),
        cell: ({ row }) => {
          const buys = row.original.transactions?.buys ?? 0;
          const sells = row.original.transactions?.sells ?? 0;
          const total = buys + sells;
          return (
            <div className="text-right">
              <div className="font-semibold text-neutral-100">
                {formatCount(total)}
              </div>
              <div className="text-xs">
                <span className="text-emerald-400">{formatCount(buys)}</span>
                <span className="mx-1 text-neutral-500">/</span>
                <span className="text-rose-400">{formatCount(sells)}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "mcap",
        header: () => <div className="text-right">Marketcap</div>,
        accessorKey: "mcap",
        enableSorting: false,
        cell: ({ row }) => {
          const mcap = Number(row.original.mcap);
          const mcapPc = Number(row.original.mcapChangePc ?? 0);
          return (
            <div className="text-right">
              <div>{formatUsd(mcap)}</div>
              <div
                className={`text-xs ${
                  mcapPc >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {numeral(mcapPc).format("0.0a")}%
              </div>
            </div>
          );
        },
      },
      {
        id: "liq",
        header: () => <div className="text-right">Liquidity</div>,
        enableSorting: false,
        accessorFn: (r) => r.liquidity.current,
        cell: ({ row }) => {
          const cur = row.original.liquidity?.current ?? 0;
          const chg = row.original.liquidity?.changePc ?? 0;
          return (
            <div className="text-right">
              <div>{formatUsd(cur)}</div>
              <div
                className={`text-xs ${
                  chg >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {numeral(chg).format("0.0a")}%
              </div>
            </div>
          );
        },
      },
      {
        id: "chg5m",
        header: () => <div className="text-right">5m</div>,
        enableSorting: false,
        accessorFn: (r) => r.priceChangePcs["5m"],
        cell: ({ getValue }) => {
          const v = Number(getValue());
          return (
            <div
              className={`text-right ${
                v >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {numeral(v).format("0.0a")}%
            </div>
          );
        },
      },
      {
        id: "chg1h",
        header: () => <div className="text-right">1h</div>,
        enableSorting: false,
        accessorFn: (r) => r.priceChangePcs["1h"],
        cell: ({ getValue }) => {
          const v = Number(getValue());
          return (
            <div
              className={`text-right ${
                v >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {numeral(v).format("0.0a")}%
            </div>
          );
        },
      },
      {
        id: "chg6h",
        header: () => <div className="text-right">6h</div>,
        enableSorting: false,
        accessorFn: (r) => r.priceChangePcs["6h"],
        cell: ({ getValue }) => {
          const v = Number(getValue());
          return (
            <div
              className={`text-right ${
                v >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {numeral(v).format("0.0a")}%
            </div>
          );
        },
      },
      {
        id: "chg24h",
        header: () => <div className="text-right">24h</div>,
        enableSorting: false,
        accessorFn: (r) => r.priceChangePcs["24h"],
        cell: ({ getValue }) => {
          const v = Number(getValue());
          return (
            <div
              className={`text-right ${
                v >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {numeral(v).format("0.0a")}%
            </div>
          );
        },
      },
      {
        id: "audit",
        header: () => <div>Audit</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const a = row.original.audit;
          return (
            <div className="flex items-center">
              <AuditBadge label="Verified" on={a.contractVerified} />
              <AuditBadge label="Minted" on={a.mintable} />
              <AuditBadge label="Freezable" on={a.freezable} />
              <AuditBadge label="Honeypot" on={a.honeypot} />
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Disable features you don't need
    enableColumnResizing: false,
    enableSorting: false,
    enableColumnFilters: false,
    // Use stable row ID
    getRowId: (row) => row.id,
    // Optimize re-renders
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  });

  const tableRows = table.getRowModel().rows;
  const virtuosoComponents = useMemo(
    () => ({
      TableRow: (props: any) => (
        <tr
          {...props}
          className={
            (props.className ?? "") +
            " text-sm hover:bg-neutral-900/60 odd:bg-neutral-950 even:bg-neutral-900"
          }
        />
      ),
      TableHead: (props: any) => (
        <thead
          {...props}
          className={(props.className ?? "") + " sticky top-0 z-10"}
        />
      ),
    }),
    []
  );
  const renderHeader = useCallback(
    () => (
      <>
        {table.getHeaderGroups().map((hg) => (
          <tr
            key={hg.id}
            className="text-xs text-neutral-400 bg-neutral-950 select-none"
          >
            {hg.headers.map((header) => {
              const alignRight = [
                "priceUsd",
                "mcap",
                "mcapPc",
                "volumeUsd",
                "chg5m",
                "chg1h",
                "chg6h",
                "chg24h",
                "age",
              ].includes(header.column.id);
              return (
                <th
                  key={header.id}
                  className={
                    (alignRight ? "text-right " : "text-left ") + "px-3 py-2"
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </>
    ),
    [table]
  );

  return (
    <div className="flex flex-col h-full items-stretch bg-neutral-900 rounded-md border border-neutral-800">
      <div className="text-center px-3 py-2 border-b border-neutral-800 text-neutral-200 text-sm font-semibold">
        {title}
      </div>
      <TableVirtuoso
        data={tableRows}
        computeItemKey={(_, row) => row.original.id}
        endReached={() => onEndReached?.()}
        fixedHeaderContent={renderHeader}
        components={virtuosoComponents}
        itemContent={(_, row) => (
          <>
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.column.id + row.original.id}
                className={
                  ([
                    "priceUsd",
                    "mcap",
                    "mcapPc",
                    "volumeUsd",
                    "chg5m",
                    "chg1h",
                    "chg6h",
                    "chg24h",
                    "age",
                  ].includes(cell.column.id)
                    ? "text-right "
                    : "text-left ") +
                  "px-3 py-2 border-b border-neutral-800 align-middle text-xs font-mono"
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </>
        )}
      />
      {isLoading ? (
        <div className="p-3 text-xs text-neutral-400">Loading...</div>
      ) : null}
      {isFetchingMore ? (
        <div className="p-3 text-xs text-neutral-400">Loading more…</div>
      ) : null}
    </div>
  );
});
