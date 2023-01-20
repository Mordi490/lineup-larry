import { Link } from "@ui/link";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="max-w-7xl bg-gray-800 py-4 text-center">
      <Link href="/faq">FAQ</Link>
      <Link href="/about">About</Link>
      <Link href="/terms-of-service">Terms of Service</Link>
      <Link href="/contact">Contact</Link>
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
    </footer>
  );
};

export default Footer;
