
"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  const isTelugu = language === "te";

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-left">
          <p className="logo">Telugu Bookstore</p>

          <p className="tag">
            {isTelugu
              ? "© 2026 అన్ని హక్కులు Al Baseer Graphics కు ప్రత్యేకించబడ్డాయి"
              : "© 2026 All Rights Reserved - Al Baseer Graphics"}
          </p>
        </div>

        <div className="footer-right">
          <Link href="/aboutus" className="footer-link">
            {isTelugu ? "మా గురించి" : "About Us"}
          </Link>

          <Link href="/printing-services" className="footer-link">
            {isTelugu ? "ప్రింటింగ్ సేవలు" : "Printing Services"}
          </Link>

          <Link href="/contactus" className="footer-link">
            {isTelugu ? "మమ్మల్ని సంప్రదించండి" : "Contact Us"}
          </Link>

          <Link href="/policies" className="footer-link">
            {isTelugu ? "విధానాలు" : "Policies"}
          </Link>
        </div>

      </div>
    </footer>
  );
}
