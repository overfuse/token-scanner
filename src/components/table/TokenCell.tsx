import { memo } from "react";
import { getSlugByRouter } from "../../utils/dexMap";
import { getNetworkSlug } from "../../utils/chainMap";
import { ProtocolIcon } from "../icons/ProtocolIcon";
import { NetworkIcon } from "../icons/NetworkIcon";
import type { ScannerTableRow } from "../ScannerTable";
import FallbackIcon from "../icons/FallbackIcon";

export const TokenCell = memo(function TokenCell({
  row: {
    index,
    original: { tokenBaseSymbol, chainId, exchange, tokenSymbol },
  },
}: {
  row: {
    index: number;
    original: ScannerTableRow;
  };
}) {
  const rank = index + 1;
  const base = tokenBaseSymbol ?? "";
  const protocolSlug = getSlugByRouter(chainId, exchange) ?? "";
  const networkSlug = getNetworkSlug(chainId) ?? "";
  return (
    <div className="min-w-0 flex flex-col gap-1 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium truncate">
          <span className="text-neutral-400">#{rank}</span> {tokenSymbol}{" "}
          <span className="text-neutral-400">/ {base}</span>
        </span>
      </div>
      <div className="text-neutral-500 flex items-center gap-2">
        <NetworkIcon slug={networkSlug} size={16} className="rounded-full" />
        {protocolSlug ? (
          <ProtocolIcon
            slug={protocolSlug}
            size={16}
            className="rounded-full"
          />
        ) : (
          <FallbackIcon size={16} className="rounded-full" title={exchange} />
        )}
      </div>
    </div>
  );
});
