import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-left">
          <p className="logo">Telugu Bookstore</p>
          <p>© 2026 All Rights Reserved - Al Baseer Graphics</p>
        </div>

        <div className="footer-right">
          <Link href="/aboutus" className="footer-link">
            About Us
          </Link>

          <Link href="/printing-services" className="footer-link">
            Printing Services
          </Link>

          <Link href="/contactus" className="footer-link">
            Contact Us
          </Link>

          <Link href="/policies" className="footer-link">
            Policies
          </Link>
        </div>

      </div>
    </footer>
  );
}