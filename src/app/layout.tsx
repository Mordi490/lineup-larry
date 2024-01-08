import { ReactNode } from "react";
import Footer from "./_components/footer";
import Nav from "./_components/nav";
import PlausibleProvider from "next-plausible";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import { cookies } from "next/headers";
import { TRPCReactProvider } from "../trpc/react";
import Head from "next/head";
import { Metadata } from "next";

type Props = {
  children: ReactNode;
  text?: string;
};

export const metadata: Metadata = {
  title: "Lineup Larry",
  description: "View & create Valorant lineups",
  //icons: [{ rel: "icon", url: "/favicon.ico" }], // dunno if needed
};

const Layout = ({ children, text }: Props) => {
  return (
    <html lang="en">
      <body className="font-sans">
        <TRPCReactProvider cookies={cookies().toString()}>
          <Head>
            <PlausibleProvider
              domain="lineuplarry.com"
              enabled={true}
              trackLocalhost={true}
            />
          </Head>
          <div className="flex h-screen flex-col">
            <Nav text={text} />
            <main className="flex-grow bg-gray-700 py-2">{children}</main>
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </TRPCReactProvider>
      </body>
    </html>
  );
};

export default Layout;
