import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from 'next/image'
import { Badge } from "@/components/ui/badge";

export default function AdminLayout({
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
    <header className="flex justify-center items-center h-16 shadow bg-background z-10">
      <nav className="flex gap-4 container">
        <div className="mr-auto flex items-center gap-2">
          <Link
            className="mr-auto text-lg hover:underline flex items-center"
            href="/"
          >
            <Image
              src="/images/logo.png"
              alt="Coode Logo"
              width={45}
              height={45}
            />
            <span className="text-2xl font-semibold pl-0.5">Coode</span>
          </Link>
          <Badge className="px-2">Admin</Badge>
        </div>
        <Link
          className="group hover:text-gray-900 text-gray-600 flex items-center px-2"
          href="/admin/courses"
        >
          <span className="group-hover:border-b group-hover:border-gray-900 text-sm font-semibold">Courses</span>
        </Link>
        <Link
          className="group hover:text-gray-900 text-gray-600 flex items-center px-2"
          href="/admin/products"
        >
           <span className="group-hover:border-b group-hover:border-gray-900 text-sm font-semibold">Products</span>
        </Link>
        <Link
          className="group hover:text-gray-900 text-gray-600 flex items-center px-2"
          href="/admin/sales"
        >
           <span className="group-hover:border-b group-hover:border-gray-900 text-sm font-semibold">Sales</span>
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
      </nav>
    </header>
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
