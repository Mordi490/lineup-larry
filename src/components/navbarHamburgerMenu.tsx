import { AiOutlineMenu } from "react-icons/ai";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useSession } from "next-auth/react";

const NavbarHamburgerMenu = () => {
  const { data: session } = useSession();
  return (
    <div className="h-12">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger aria-label="Menu button">
          <AiOutlineMenu size={48}/>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className="flex flex-col rounded-lg text-lg"
          id="dropdown_bg_color"
          sideOffset={10}
        >
          {/* cond render for some logged in vs not logged in options */}
          {session?.user?.id ? (
            <DropdownMenu.Item>
              <Link
                className="hover:bg-red-400"
                href={`/${session.user?.id}/lineups`}
              >
                <a>Your Lineups</a>
              </Link>
            </DropdownMenu.Item>
          ) : null}

          <DropdownMenu.Item>
            <Link href={`/lineups`}>
              <a>View Lineups</a>
            </Link>
          </DropdownMenu.Item>

          {session?.user?.id ? (
            <DropdownMenu.Item>
              <Link href={`/create`}>
                <a>Submit Lineup</a>
              </Link>
            </DropdownMenu.Item>
          ) : null}

          {session?.user?.id ? (
            <DropdownMenu.Item>
              <Link href={`/user/${session.user?.id}`}>
                <a>View Profile</a>
              </Link>
            </DropdownMenu.Item>
          ) : null}

          {/* expect for one, to login */}
          {session?.user?.id ? (
            <DropdownMenu.Item>
              <Link href={`/api/auth/signout`}>
                <a>Logout</a>
              </Link>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item>
              <Link href={`/api/auth/signin`}>
                <a>Login</a>
              </Link>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

export default NavbarHamburgerMenu;
