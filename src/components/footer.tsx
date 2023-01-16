import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="max-w-7xl bg-gray-800 py-4 text-center">
      <Link href="/faq">
        <a>FAQ</a>
      </Link>
      <Link href="/about">
        <a>About</a>
      </Link>
      <Link href="/terms-of-service">
        <a>Terms of Service</a>
      </Link>
      <Link href="/contact">
        <a>Contact</a>
      </Link>
      <Link href="/privacy-policy">
        <a>Privacy Policy</a>
      </Link>
      <Link href="https://github.com/Mordi490/lineup-larry">
        <a className="mx-auto flex items-center">
          <span className="mx-2">
            <FaGithub />
          </span>
          GitHub
        </a>
      </Link>
    </footer>
  );
};

export default Footer;
