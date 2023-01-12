// src/pages/_app.tsx
import type { AppType } from "next/dist/shared/lib/utils";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import PlausibleProvider from "next-plausible";
import { Toaster } from "react-hot-toast";
import { type Session } from "next-auth";
import { api } from "../utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <PlausibleProvider domain="lineuplarry.com">
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
        <Toaster position="bottom-right" />
      </PlausibleProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
