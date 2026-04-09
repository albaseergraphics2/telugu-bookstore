import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-left">
          <p className="logo">Telugu Bookstore</p>
          <p>© 2026 All Rights Reserved - albaseergraphics</p>
        </div>

        <div className="footer-right">
          {/* <Link href="/policies" className="footer-link">
            Policies
          </Link> */}
          <Link href="/aboutus" className="footer-link">
            About Us
          </Link>

          <Link href="/aboutus" className="footer-link">
            Contact Us
          </Link>
        </div>

      </div>
    </footer>
  );
}