import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-800 pt-4">
      <div className="grid grid-cols-3">
        <div>
          <Link href="/faq">
            <a>FAQ</a>
          </Link>
          <Link href="/about">
            <a>About</a>
          </Link>
        </div>
        <div>
          <Link href="/terms-of-service">
            <a>Terms of Service</a>
          </Link>
          <Link href="/contact">
            <a>Contact</a>
          </Link>
        </div>
        <div>
          <Link href="/privacy-policy">
            <a>Privacy Policy</a>
          </Link>
          <Link href="https://github.com/Mordi490/lineup-larry">
            <a>GitHub</a>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
