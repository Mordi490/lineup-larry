import { Menu } from "@headlessui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { GiBowArrow } from "react-icons/gi";

/*
function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

// https://headlessui.com/react/menu#integrating-with-next-js
const MyLink = forwardRef((props, ref) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a ref={ref} {...rest}>
        {children}
      </a>
    </Link>
  );
});
*/

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
        <Link href={"/"}>
          <button>
            <h1 className="flex gap-2 text-4xl font-bold p-2">Lineup Larry</h1>
          </button>
        </Link>

        {/* right side */}
        <div className="flex gap-2 justify-end">
          {/* Conditional render logged in vs login */}
          {session?.user?.image ? (
            <>
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-sky-300 shadow-sm px-4 py-2 sm font-medium text-white hover:focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                  <Image
                    src={session.user.image}
                    height={64}
                    width={64}
                    alt="Discord profile picture"
                  />
                </Menu.Button>
                <Menu.Items className="absolute right-0 bg-white rounded-md shadow-lg w-48">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={`/${session.user?.id}/lineups`}
                        className={`${active && "bg-blue-500"}`}
                      >
                        Your Lineups
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={`/create`}
                        className={`${active && "bg-blue-500"}`}
                      >
                        Submit Lineup
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    <Link
                      href={`/user/${session.user?.id}`}
                      className="block px-4 py-2 text-sm text-white"
                    >
                      View Profile
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Link
                      href={`/api/auth/signout`}
                      className="block px-4 py-2 text-sm text-white"
                    >
                      Logout
                    </Link>
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </>
          ) : (
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
