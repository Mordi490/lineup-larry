import { ReactNode } from "react";
import Footer from "./footer";
import Nav from "./nav";

type Props = {
  children: ReactNode;
  title?: string;
  text?: string;
};

const Layout = ({ children, title, text }: Props) => {
  return (
    <div className="flex h-screen flex-col" id="layout_div">
      <Nav title={title} text={text} />
      <main className="flex-grow bg-gray-700 py-2">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
