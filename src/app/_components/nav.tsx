"use client";

import { GiBowArrow } from "react-icons/gi";
import NavbarHamburgerMenu from "./navbarHamburgerMenu";
import NavbarProfileDropdown from "./navbarProfileDropdown";
import Link from "next/link";

type Props = {
  text?: string;
};

const Nav = ({ text }: Props) => {
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
          <div className="sm:hidden">
            <NavbarHamburgerMenu />
          </div>
          <div className="hidden sm:block sm:text-left">
            <NavbarProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
