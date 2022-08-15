import { useSession } from "next-auth/react";
import { GiBowArrow } from "react-icons/gi";
import Link from "next/link";
import Image from "next/image";
import { FaDiscord } from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { forwardRef } from "react";
import { NextComponentType } from "next";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

// https://headlessui.com/react/menu#integrating-with-next-js
// eslint-disable-next-line react/display-name
const NextLink = forwardRef((props, ref) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a ref={ref as any} {...rest}>
        {children}
      </a>
    </Link>
  );
});

const Nav = () => {
  const { data: session } = useSession();

  return (
    <nav className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between text-center py-4 space-x-4">
        {/* left side */}
        <Link href={"/"}>
          <button>
            <GiBowArrow size={64} color="cyan" />
          </button>
        </Link>

        {/* center */}
        <h1 className="flex gap-2 text-4xl font-bold">Lineup Larry</h1>

        {/* right side */}
        <div className="flex gap-2 justify-end">
          {/* if logged in */}
          {session && (
            <>
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 sm font-medium text-white hover:focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                  <Image
                    src={session?.user?.image}
                    height={64}
                    width={64}
                    alt="Discord profile picture"
                  />
                </Menu.Button>
                <Menu.Items className="absolute right-0 bg-white rounded-md shadow-lg border w-48">
                  <Menu.Item>
                    <NextLink
                      href={`/${session.user?.id}/lineups`}
                      className="block px-4 py-2 text-sm text-white"
                    >
                      Your Lineups
                    </NextLink>
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <NextLink
                        href={`/create`}
                        className="block px-4 py-2 text-sm text-white"
                      >
                        Submit Lineup
                      </NextLink>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    <NextLink
                      href={`/user/${session.user?.id}`}
                      className="block px-4 py-2 text-sm text-white"
                    >
                      View Profile
                    </NextLink>
                  </Menu.Item>
                  <Menu.Item>
                    <NextLink
                      href={`/api/auth/signout`}
                      className="block px-4 py-2 text-sm text-white"
                    >
                      Logout
                    </NextLink>
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </>
          )}

          {/* not logged in */}
          {session == null && (
            <Link href="/api/auth/signin">
              <button className="flex gap-2 rounded-full bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100">
                Login via Discord
                {/* TODO: center the discord icon */}
                <span className="">
                  <FaDiscord />
                </span>
              </button>
            </Link>
          )}
        </div>
      </div>
      <hr className="py-4" />
    </nav>
  );
};

export default Nav;
