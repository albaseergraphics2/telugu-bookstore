import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Poppins } from 'next/font/google';
import BootstrapClient from "./bootstrap";
import MobileBottomBar from "./components/MobileBottomBar";
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Toaster } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/next';
import Provider from "./provider";
import LoadUser from "./components/LoadUser";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});
export const metadata = {
  title: 'Telugu Bookstore',
  description: 'Islamic Books Online & Offline Store',
  manifest: "/manifest.json",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Provider>
          <LoadUser />
          <BootstrapClient />
          <Navbar />
          <main className="min-h-screen">
            {children}
            <Toaster
              position="top-right"
              containerStyle={{
                top: "75px",
                right: "20px",
              }}
              toastOptions={{
                duration: 2500,
                style: {
                  background: "#404040",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "14px",
                }
              }}
            />
            <Analytics />
          </main>
          <Footer />
          <MobileBottomBar />
        </Provider>
      </body>
    </html>
  )
};