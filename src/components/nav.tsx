import Head from "next/head";
import { Link } from "@ui/link";
import { GiBowArrow } from "react-icons/gi";
import NavbarHamburgerMenu from "./navbarHamburgerMenu";
import NavbarProfileDropdown from "./navbarProfileDropdown";

type Props = {
  title?: string;
  text?: string;
  description?: string;
  name?: string;
};

const Nav = ({ title, text, description, name }: Props) => {
  return (
    <>
      <Head>
        {title?.length ? (
          <title className="capitalize">{title}</title>
        ) : (
          <title className="capitalize">Lineup Larry</title>
        )}
        {description?.length ? (<meta name={name} content={description} />) : (<meta name="description" content="Site to view & create Valorant lineups" />)}
      </Head>

      <nav className="bg-gray-800 p-2">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between text-center">
            {/* left side */}
            <Link href={"/"}>
              <span>
                <GiBowArrow
                  size={48}
                  color="cyan"
                  aria-label="Lineup Larry logo"
                />
              </span>
            </Link>

            {/* center */}
            <div className="hidden sm:block">
              <Link href={"/"}>
                <h1 className="flex text-4xl font-bold">
                  {text?.length ? <p>{text}</p> : <p>Lineup Larry</p>}
                </h1>
              </Link>
            </div>

            {/* right side */}
            <div className="sm:hidden">
              <NavbarHamburgerMenu />
            </div>
            <div className="hidden sm:block sm:text-left">
              <NavbarProfileDropdown />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Nav;
