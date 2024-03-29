import { AiOutlineMenu } from "react-icons/ai";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@ui/link";
import { useSession } from "next-auth/react";

const NavbarHamburgerMenu = () => {
  const { data: session } = useSession();
  return (
    <nav className="h-12">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger aria-label="Menu button">
          <AiOutlineMenu size={48} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className="flex flex-col rounded bg-gray-800 py-2 px-4 text-lg"
          sideOffset={10}
        >
          {/* cond render for some logged in vs not logged in options */}
          {session?.user?.id ? (
            <DropdownMenu.Item>
              <Link
                className="rounded-xl p-1 hover:bg-gray-700"
                href={`/${session.user?.id}/lineups`}
              >
                Your Lineups
              </Link>
            </DropdownMenu.Item>
          ) : null}

          <DropdownMenu.Item>
            <Link
              className="rounded-xl p-1 hover:bg-gray-700"
              href={`/lineups`}
            >
              View Lineups
            </Link>
          </DropdownMenu.Item>

          {session?.user?.id ? (
            <DropdownMenu.Item>
              <Link
                className="rounded-xl p-1 hover:bg-gray-700"
                href={`/create`}
              >
                Submit Lineup
              </Link>
            </DropdownMenu.Item>
          ) : null}

          {session?.user?.id ? (
            <DropdownMenu.Item>
              <Link
                className="rounded-xl p-1 hover:bg-gray-700"
                href={`/user/${session.user?.id}`}
              >
                View Profile
              </Link>
            </DropdownMenu.Item>
          ) : null}

          {/* expect for one, to login */}
          {session?.user?.id ? (
            <DropdownMenu.Item>
              <Link
                className="rounded-xl p-1 hover:bg-gray-700"
                href={`/api/auth/signout`}
              >
                Logout
              </Link>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item>
              <Link
                className="rounded-xl p-1 hover:bg-gray-700"
                href={`/api/auth/signin`}
              >
                Login
              </Link>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </nav>
  );
};

export default NavbarHamburgerMenu;
