import { FaDiscord } from "react-icons/fa";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@ui/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@ui/button";

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
          <DropdownMenu.Content
            loop
            sideOffset={4}
            className="rounded-xl bg-gray-800 p-2 text-lg"
          >
            <DropdownMenu.Item className="hover:bg-gray-700">
              <Link href={`/${session.user?.id}/lineups`}>Your Lineups</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="hover:bg-gray-700">
              <Link href={`/create`}>Submit Lineup</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="hover:bg-gray-700">
              <Link href={`/user/${session.user?.id}`}>View Profile</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-green-300 fill-green-300" />
            <DropdownMenu.Item className="hover:bg-gray-700">
              <Link href={`/api/auth/signout`}>Logout</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Arrow />
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ) : (
        <Button href="/api/auth/signin" aria-label="Login" intent={"primary"}>
          Login
          <span>
            <FaDiscord className="mt-1 ml-2" size={18} />
          </span>
        </Button>
      )}
    </div>
  );
};

export default NavbarProfileDropdown;