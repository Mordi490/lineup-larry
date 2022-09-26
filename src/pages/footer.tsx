import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-800 mt-4">
      <div>
        <ul>
          <li>
            <Link href="/about">
              <a>About</a>
            </Link>
          </li>
          <li>
            <Link href="/terms-of-service">
              <a>Terms of Service</a>
            </Link>
          </li>
          <li>
            <Link href="/contact">
              <a>Contact</a>
            </Link>
          </li>
          <li>
            <Link href="/faq">
              <a>FAQ</a>
            </Link>
          </li>
          <li>
            <Link href="/privacy-policy">
              <a>Privacy Policy</a>
            </Link>
          </li>
          <li>
            <Link href="https://github.com/Mordi490/lineup-larry">
              <a>GitHub</a>
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
