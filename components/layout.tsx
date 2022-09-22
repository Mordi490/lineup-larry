import { ReactNode } from "react";
import Footer from "../src/pages/footer";
import Nav from "./nav";

type Props = {
  children: ReactNode;
  title?: string;
};

const Layout = ({ children, title }: Props) => {
  return (
    <div className="flex flex-col h-screen text-center">
      <Nav title={title} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
