import { AppLoadingState } from "@/components/app-loading-state";

export default function RootLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-16 sm:px-10">
      <AppLoadingState />
    </main>
  );
}
