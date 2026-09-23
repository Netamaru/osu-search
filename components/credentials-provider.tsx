"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { CredentialsModal } from "@/components/credentials-modal";
import {
  credentialHeaders,
  credentialsSnapshot,
  storedCredentials,
  subscribeCredentials,
} from "@/lib/browser-credentials";
import type { ClientCredentials } from "@/lib/credentials";

type CredentialsContextValue = {
  ready: boolean;
  credentials: ClientCredentials | null;
  headers: HeadersInit;
  openModal: () => void;
};

const CredentialsContext = createContext<CredentialsContextValue | null>(null);

function subscribeReady() {
  return () => {};
}

export function CredentialsProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribeCredentials, credentialsSnapshot, () => "");
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const credentials = useMemo(() => storedCredentials(raw), [raw]);
  const headers = useMemo(() => credentialHeaders(credentials), [credentials]);
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ ready, credentials, headers, openModal }),
    [ready, credentials, headers, openModal],
  );

  return (
    <CredentialsContext.Provider value={value}>
      {children}
      {open ? <CredentialsModal credentials={credentials} onClose={closeModal} /> : null}
    </CredentialsContext.Provider>
  );
}

export function useCredentials() {
  const value = useContext(CredentialsContext);
  if (!value) throw new Error("useCredentials must be used within CredentialsProvider");
  return value;
}

export function ApiClientButton() {
  const { credentials, openModal } = useCredentials();
  return (
    <button type="button" className="label hover:text-fg" onClick={openModal}>
      {credentials ? "API client" : "Add API client"}
    </button>
  );
}
