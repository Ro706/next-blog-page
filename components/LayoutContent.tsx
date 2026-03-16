"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import gsap from "gsap";

export default function LayoutContent({ 
  children, 
  session 
}: { 
  children: React.ReactNode,
  session: any
}) {
  const navRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      });
      gsap.from(mainRef.current, {
        opacity: 0,
        duration: 1,
        delay: 0.3
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <nav ref={navRef} className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                DevBlog
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              {session ? (
                <>
                  <Link href="/posts/create" className="text-gray-700 hover:text-blue-600 font-medium">
                    Write
                  </Link>
                  <div className="flex items-center space-x-3 ml-4 border-l pl-4">
                    <span className="text-sm text-gray-500">{session.user?.name}</span>
                    <button 
                      onClick={() => signOut()}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 font-medium">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main ref={mainRef} className="bg-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </>
  );
}
