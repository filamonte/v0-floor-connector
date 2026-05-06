import Link from "next/link";

export const earlyAccessLockedTitle = "Locked during early access";
export const earlyAccessLockedMessage =
  "You can keep building real records. Sending externally and processing payments unlock after activation.";

type EarlyAccessLockNoticeProps = {
  className?: string;
  showLink?: boolean;
};

export function EarlyAccessLockNotice({
  className = "",
  showLink = true
}: EarlyAccessLockNoticeProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="font-semibold text-amber-950">{earlyAccessLockedTitle}</p>
      <p className="mt-1">{earlyAccessLockedMessage}</p>
      {showLink ? (
        <Link
          href="/setup/pending-activation"
          className="mt-3 inline-flex items-center rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-100"
        >
          View activation status
        </Link>
      ) : null}
    </div>
  );
}
