const CHAINID_TO_SLUG: Record<number, string> = {
  1: "ethereum",
  56: "bsc", // Binance Smart Chain
  8453: "base",
  900: "solana",
};

export function getNetworkSlug(chainId: number | null | undefined): string | null {
  if (!chainId) return null;
  return CHAINID_TO_SLUG[chainId] ?? null;
}
