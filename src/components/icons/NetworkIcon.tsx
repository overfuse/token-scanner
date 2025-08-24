import { useMemo, useState, memo } from "react";
import clsx from "clsx";

type Props = {
  slug: string; // e.g. "ethereum", "bsc", "solana", "base"
  size?: number;
  className?: string;
  alt?: string;
};

function networkUrls(slug: string): string[] {
  const s = slug.toLowerCase();
  return [
    `https://icons.llamao.fi/icons/chains/rsz_${s}.jpg`,
    `https://icons.llamao.fi/icons/chains/rsz_${s}.png`,
  ];
}

export const NetworkIcon = memo(function ({
  slug,
  size = 24,
  className,
  alt,
}: Props) {
  const [idx, setIdx] = useState(0);
  const urls = useMemo(() => networkUrls(slug), [slug]);
  const onError = () => idx < urls.length - 1 && setIdx((i) => i + 1);

  return (
    <img
      src={urls[idx]}
      alt={alt ?? `${slug} network icon`}
      width={size}
      height={size}
      onError={onError}
      loading="lazy"
      decoding="async"
      className={clsx("inline-block rounded", className)}
      style={{ width: size, height: size }}
      title={slug}
    />
  );
});
