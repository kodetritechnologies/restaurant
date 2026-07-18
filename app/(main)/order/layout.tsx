import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function OrderRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
