import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from 'next/image'
import { Suspense } from "react";
import { getCurrentUser } from "../services/clerk";
import { canAccessAdminPages } from "@/permissions/general";

export default function ConsumerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
function Navbar() {
  return (
    <header className="flex h-16 shadow bg-background z-10">
      <nav className="flex gap-4 container">
        <Link
          className="mr-auto text-lg hover:underline flex items-center px-2"
          href="/"
        >
          <Image src="/images/logo.png" alt="Coode Logo" width={45} height={45} />
          <span className="text-2xl font-semibold pl-0.5">Coode</span>
        </Link>
        <Suspense>
          <SignedIn>
            <AdminLink />
            <Link
              className="group hover:text-gray-900 text-gray-600 flex items-center px-2"
              href="/courses"
            >
              <span className="group-hover:border-b group-hover:border-gray-900 text-sm font-semibold">
                My Courses
              </span>
            </Link>
            <Link
              className="group hover:text-gray-900 text-gray-600 flex items-center px-2"
              href="/purchases"
            >
              <span className="group-hover:border-b group-hover:border-gray-900 text-sm font-semibold">
                Purchased History
              </span>
            </Link>
            <div className="size-8 self-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: "100%", height: "100%" },
                  },
                }}
              />
            </div>
          </SignedIn>
        </Suspense>
        <Suspense>
          <SignedOut>
            <Button className="self-center rounded-3xl w-25 h-10" asChild>
              <SignInButton>Sign In</SignInButton>
            </Button>
          </SignedOut>
        </Suspense>
      </nav>
    </header>
  );
}

async function AdminLink() {
  const user = await getCurrentUser();
  if (!canAccessAdminPages(user)) return null;

  return (
    <Link
      className="group hover:text-gray-900 text-gray-600 flex items-center px-2"
      href="/admin"
    >
      <span className="group-hover:border-b group-hover:border-gray-900 text-sm font-semibold">
        Admin
      </span>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center text-sm text-gray-600">
          ©2025 All rights reserved.
        </div>
      </div>
    </footer>
  );
}
