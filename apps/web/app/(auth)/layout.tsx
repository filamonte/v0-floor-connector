import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return children;
}
