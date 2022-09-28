import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { GiBowArrow } from "react-icons/gi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Head from "next/head";

type Props = {
  title?: string;
  text?: string;
};

const Nav = ({ title, text }: Props) => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        {title?.length ? <title>{title}</title> : <title>Lineup Larry</title>}
      </Head>

      <nav className="bg-gray-800">
        <div className="flex items-center justify-between text-center py-4 ">
          {/* left side */}
          <Link href={"/"}>
            <a>
              <GiBowArrow size={64} color="cyan" />
            </a>
          </Link>

          {/* center */}
          <Link href={"/"}>
            <a>
              <h1 className="flex gap-2 text-4xl font-bold p-2">
                {text?.length ? <p>{text}</p> : <p>Lineup Larry</p>}
              </h1>
            </a>
          </Link>

          {/* right side */}
          <div className="fixed inline-block text-left">
            {/* Conditional render logged in vs login */}
            {session?.user?.image ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Image
                    src={session.user.image}
                    width={64}
                    height={64}
                    className="rounded-full"
                    alt="Discord profile picture"
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content loop sideOffset={6} className="text-xl">
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
                  <DropdownMenu.Separator className="my-1 h-px fill-green-300 bg-green-300s" />
                  <DropdownMenu.Item>
                    <Link href={`/api/auth/signout`}>
                      <a>Logout</a>
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Arrow className="" />
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <Link href="/api/auth/signin">
                <a>
                  <button className="flex gap-2 rounded-full bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100">
                    Login via Discord
                    {/* TODO: center the discord icon */}
                    <span className="">
                      <FaDiscord />
                    </span>
                  </button>
                </a>
              </Link>
            )}
          </div>
          {/* End of top level flex container */}
        </div>
      </nav>
    </>
  );
};

export default Nav;
