import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Monad NFT Lending',
  description: 'NFT-collateralized lending protocol on Monad',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-900">
          {children}
        </main>
      </body>
    </html>
  );
}


////////////////////////////////////////////////////////
/*
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import Layout from "@/components/Layout"
import { Providers } from "@/components/Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NFT LENDING ",
  description: "Mint your dmon NFT on the monad devnet network",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}

*/