"use client";

type DevQaToolsProps = {
  signOutAction: () => void | Promise<void>;
};

export function DevQaTools({ signOutAction }: DevQaToolsProps) {
  return (
    <div className="fixed bottom-3 left-3 z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-slate-300 bg-white/95 px-2.5 py-2 shadow-sm">
      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">
        DEV MODE
      </span>
      <form
        action={signOutAction}
        onSubmit={() => {
          window.localStorage.clear();
          window.sessionStorage.clear();
        }}
      >
        <button
          type="submit"
          className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-500"
        >
          Reset session
        </button>
      </form>
    </div>
  );
}
