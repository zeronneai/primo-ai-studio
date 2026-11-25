import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

const PRIMO_LOGO_URL =
  "/media/replicame-ese-logo-sin-a-c3-b1adir-202605142001-xo3xpe.jpg";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primo-bg p-4 gap-6">
      <Link href="/" className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRIMO_LOGO_URL}
          alt="Primo AI Studio"
          className="h-9 w-auto rounded-md"
        />
        <span className="font-sans font-bold tracking-tight text-lg text-primo-navy">
          PRIMO AI STUDIO
        </span>
      </Link>
      <SignUp />
    </div>
  );
}
