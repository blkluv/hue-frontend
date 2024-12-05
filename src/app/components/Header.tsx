"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-gray-100">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold">Hue</h1>
        <nav className="flex gap-4">
          <Link href="/upload" className="hover:text-gray-600">
            Upload
          </Link>
          <Link href="/listen" className="hover:text-gray-600">
            Listen
          </Link>
          <Link href="/lookup" className="hover:text-gray-600">
            Lookup
          </Link>
        </nav>
      </div>
      <ConnectButton />
    </header>
  );
}
