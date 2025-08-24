import clsx from "clsx";

function FallbackIcon({
  size = 16,
  className,
  title,
}: {
  size: number;
  className?: string;
  title?: string;
}) {
  return (
    <img
      src="https://app.dexcelerate.com/fallback.svg"
      width={size}
      height={size}
      className={clsx("inline-block rounded", className)}
      style={{ width: size, height: size }}
      title={title}
    />
  );
}

export default FallbackIcon;
