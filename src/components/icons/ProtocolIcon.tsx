import { useMemo, memo } from "react";
import clsx from "clsx";

type Props = {
  slug: string; // e.g. "uniswap", "pump", "raydium"
  size?: number;
  className?: string;
};

function getLogoUrl(slug: string, px: number): string {
  const s = slug.toLowerCase();
  return `https://icons.llamao.fi/icons/protocols/${s}?w=${px}&h=${px}`;
}

export const ProtocolIcon = memo(function ({
  slug,
  size = 24,
  className,
}: Props) {
  const logoUrl = useMemo(() => getLogoUrl(slug, size), [slug, size]);
  return (
    <img
      src={logoUrl}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={clsx("inline-block rounded", className)}
      style={{ width: size, height: size }}
      title={slug}
    />
  );
});
