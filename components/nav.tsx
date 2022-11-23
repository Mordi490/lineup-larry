import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { GiBowArrow } from "react-icons/gi";
import NavbarHamburgerMenu from "./navbarHamburgerMenu";
import NavbarProfileDropdown from "./navbarProfileDropdown";

type Props = {
  title?: string;
  text?: string;
};

const Nav = ({ title, text }: Props) => {
  return (
    <>
      <Head>
        {title?.length ? <title>{title}</title> : <title>Lineup Larry</title>}
      </Head>

      <nav className="bg-gray-800 px-2 py-2">
        <div className="flex items-center justify-between text-center">
          {/* left side */}
          <Link href={"/"}>
            <a>
              <GiBowArrow size={48} color="cyan" />
            </a>
          </Link>

          {/* center */}
          <div className="hidden sm:block">
            <Link href={"/"}>
              <a>
                <h1 className="flex text-4xl font-bold">
                  {text?.length ? <p>{text}</p> : <p>Lineup Larry</p>}
                </h1>
              </a>
            </Link>
          </div>

          {/* right side */}
          {/* show on smallest screen size, hide for the rest */}
          <div className="sm:hidden">
            <NavbarHamburgerMenu />
          </div>
          <div className="hidden sm:block sm:text-left">
            {/* Conditional render logged in vs login, also for larger screens */}
            <NavbarProfileDropdown />
          </div>
          {/* End of top level flex container */}
        </div>
      </nav>
    </>
  );
};

export default Nav;
