"use client";

import { AiOutlineMenu } from "react-icons/ai";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { User } from "next-auth";

const NavbarHamburgerMenu = ({ user }: { user: User }) => {
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
          {user ? (
            <DropdownMenu.Item>
              <Link
                className="rounded-xl p-1 hover:bg-gray-700"
                href={`/${user?.id}/lineups`}
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

          {user.id ? (
            <DropdownMenu.Item>
              <Link
                className="rounded-xl p-1 hover:bg-gray-700"
                href={`/create`}
              >
                Submit Lineup
              </Link>
            </DropdownMenu.Item>
          ) : null}

          {user.id ? (
            <DropdownMenu.Item>
              <Link
                className="rounded-xl p-1 hover:bg-gray-700"
                href={`/user/${user.id}`}
              >
                View Profile
              </Link>
            </DropdownMenu.Item>
          ) : null}

          {/* expect for one, to login */}
          {user.id ? (
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
