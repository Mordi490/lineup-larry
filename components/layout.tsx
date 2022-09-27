import { ReactNode } from "react";
import Footer from "../src/pages/footer";
import Nav from "./nav";

type Props = {
  children: ReactNode;
  title?: string;
  text?: string;
};

const Layout = ({ children, title, text }: Props) => {
  return (
    <div className="flex flex-col h-screen text-center">
      <Nav title={title} text={text} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
