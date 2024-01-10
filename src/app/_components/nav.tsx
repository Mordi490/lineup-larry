import { GiBowArrow } from "react-icons/gi";
import NavbarHamburgerMenu from "./navbarHamburgerMenu";
import NavbarProfileDropdown from "./navbarProfileDropdown";
import Link from "next/link";
import { getServerAuthSession } from "../../server/auth";
import { Button } from "./button";
import { FaDiscord } from "react-icons/fa";

type Props = {
  text?: string;
};

const Nav = async ({ text }: Props) => {
  const session = await getServerAuthSession();
  return (
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
          {session?.user ? (
            <>
              <div className="sm:hidden">
                <NavbarHamburgerMenu user={session?.user} />
              </div>
              <div className="hidden sm:block sm:text-left">
                <NavbarProfileDropdown user={session?.user} />
              </div>
            </>
          ) : (
            <Button intent={"primary"}>
              Sign In
              <span>
                <FaDiscord />
              </span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
