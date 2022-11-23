import { AiOutlineMenu } from "react-icons/ai";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useSession } from "next-auth/react";

const NavbarHamburgerMenu = () => {
  const { data: session } = useSession();
  return (
    <div className="h-12">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <AiOutlineMenu size={48} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="text-lg" sideOffset={6}>
          {/* cond render for some logged in vs not logged in options */}
          {session?.user?.id ? (
            <Link href={`/${session.user?.id}/lineups`}>
              <a>Your Lineups</a>
            </Link>
          ) : null}
          <DropdownMenu.Item></DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

export default NavbarHamburgerMenu;
