export const AuditBadge = ({ label, on }: { label: string; on: boolean }) => (
  <div className="flex flex-col items-center w-15">
    <div
      className={
        "h-6 w-6 rounded-full border flex items-center justify-center " +
        (on
          ? "border-emerald-500 text-emerald-400"
          : "border-neutral-600 text-neutral-500")
      }
    >
      {/* check mark */}
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
    <div className="mt-1 text-xs text-neutral-300">{label}</div>
  </div>
);
