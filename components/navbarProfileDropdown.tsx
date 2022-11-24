import { FaDiscord } from "react-icons/fa";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

const NavbarProfileDropdown = () => {
  const { data: session } = useSession();

  return (
    <div>
      {session?.user?.image ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Image
              src={session.user.image}
              width={48}
              height={48}
              className="rounded-full"
              alt="Discord profile picture"
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content loop sideOffset={6} className="text-lg">
            <DropdownMenu.Item className="bg-yellow-300">
              <Link href={`/${session.user?.id}/lineups`}>
                <a>Your Lineups</a>
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <Link href={`/create`}>
                <a>Submit Lineup</a>
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <Link href={`/user/${session.user?.id}`}>
                <a>View Profile</a>
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-green-300 fill-green-300" />
            <DropdownMenu.Item>
              <Link href={`/api/auth/signout`}>
                <a>Logout</a>
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Arrow />
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ) : (
        <Link href="/api/auth/signin">
          <a>
            <button
              id="tailwind_crack_pipe_fix"
              className="inline-flex items-center justify-center gap-2 font-bold text-black"
            >
              Login
              <span>
                <FaDiscord className="mt-1" />
              </span>
            </button>
          </a>
        </Link>
      )}
    </div>
  );
};

export default NavbarProfileDropdown;
