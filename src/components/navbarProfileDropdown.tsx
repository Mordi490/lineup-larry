import { FaDiscord } from "react-icons/fa";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@ui/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@ui/button";
import ErrImg from "../../public/on_err_img_profile.png";

const NavbarProfileDropdown = () => {
  const { data: session } = useSession();

  // might just create a svg instead
  return (
    <nav>
      {session?.user?.image ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Image
              placeholder="blur"
              blurDataURL="https://i.pinimg.com/736x/2e/ad/53/2ead53f5d9c64c6987ff27141023b96b.jpg"
              onError={() => ErrImg}
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
        <Button aria-label="Login" intent={"primary"}>
          <Link href="/api/auth/signin" className="flex justify-center">
            Login
            <span>
              <FaDiscord className="mt-1 ml-2" size={20} />
            </span>
          </Link>
        </Button>
      )}
    </nav>
  );
};

export default NavbarProfileDropdown;
