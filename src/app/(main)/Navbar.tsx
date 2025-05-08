import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import Image from "next/image"; // Make sure this is imported
import apcLogo from "@/assets/logo.png"; 
export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 py-3">
        <Link href="/">
          <Image
            src={apcLogo}
            alt="APC Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <SearchField />
        <UserButton className="sm:ms-auto" />
      </div>
    </header>
  );
}