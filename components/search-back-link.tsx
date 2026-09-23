"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { rememberedSearch, searchReturnHref, searchReturnSnapshot, subscribeSearchReturn } from "@/lib/search-return";

export function SearchBackLink({
  className,
  children,
  restore = true,
}: {
  className?: string;
  children: ReactNode;
  restore?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const stored = useSyncExternalStore(subscribeSearchReturn, searchReturnSnapshot, () => "");
  const shouldRestore = restore || pathname !== "/";
  const href = searchReturnHref(shouldRestore ? stored : "");

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const shouldRestore = restore || window.location.pathname !== "/";
        if (!shouldRestore) return;
        event.preventDefault();
        router.push(searchReturnHref(rememberedSearch()), { scroll: false });
      }}
    >
      {children}
    </Link>
  );
}
