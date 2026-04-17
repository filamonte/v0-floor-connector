type SettingsFeedbackProps = {
  error?: string;
  message?: string;
};

export function SettingsFeedback({ error, message }: SettingsFeedbackProps) {
  if (!error && !message) {
    return null;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {message}
        </div>
      ) : null}
    </div>
  );
}
