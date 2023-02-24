import { ReactNode } from "react";
import Footer from "./footer";
import Nav from "./nav";

type Props = {
  children: ReactNode;
  title?: string;
  text?: string;
  description?: string;
  name?: string;
};

const Layout = ({ children, title, text, description, name }: Props) => {
  return (
    <div className="flex h-screen flex-col">
      <Nav title={title} text={text} description={description} name={name} />
      <main className="flex-grow bg-gray-700 py-2">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
