type SettingsFeedbackProps = {
  error?: string;
  message?: string;
};

function getSafeFeedbackMessage(value: string) {
  const decoded = value.replaceAll("+", " ");
  const lowerValue = decoded.toLowerCase();
  const looksTechnical =
    decoded.includes("\n") ||
    lowerValue.includes("stack") ||
    lowerValue.includes("supabase") ||
    lowerValue.includes("postgres") ||
    lowerValue.includes("setupintent") ||
    lowerValue.includes("stripe_") ||
    lowerValue.includes("violates row-level security") ||
    lowerValue.includes("duplicate key");

  return looksTechnical
    ? "We could not complete that action. Review the fields and try again, or use Need help if it keeps happening."
    : decoded;
}

export function SettingsFeedback({ error, message }: SettingsFeedbackProps) {
  if (!error && !message) {
    return null;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {getSafeFeedbackMessage(error)}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {getSafeFeedbackMessage(message)}
        </div>
      ) : null}
    </div>
  );
}
