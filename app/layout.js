import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Poppins } from 'next/font/google';
import BootstrapClient from "./bootstrap";
import MobileBottomBar from "./components/MobileBottomBar";
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Toaster } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/next';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const metadata = {
  title: 'Telugu Bookstore',
  description: 'Islamic Books Online & Offline Store',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <BootstrapClient />
        <Navbar />
        <main className="min-h-screen">
          {children}
          <Toaster position="top-center" />
          <Analytics />
        </main>
        <Footer />
        <MobileBottomBar />
      </body>
    </html>
  )
};