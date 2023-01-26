import { Link } from "@ui/link";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="flex items-center justify-around bg-gray-800 p-2">
      <div className="flex max-w-7xl flex-grow justify-between">
        <div className="flex flex-col space-y-4">
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
        </div>

        <div className="flex flex-col space-y-4">
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="flex flex-col space-y-4">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link
            className="mx-auto flex items-center"
            href="https://github.com/Mordi490/lineup-larry"
          >
            <span className="mx-2">
              <FaGithub />
            </span>
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
