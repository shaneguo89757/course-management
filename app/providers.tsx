"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { register as registerServiceWorker } from "./register-sw";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 註冊 Service Worker
    // registerServiceWorker();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
} 