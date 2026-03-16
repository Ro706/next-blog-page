"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import gsap from "gsap";
import Preloader from "./Preloader";

export default function LayoutContent({ 
  children, 
  session 
}: { 
  children: React.ReactNode,
  session: any
}) {
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(true);
  const [isAppVisible, setIsAppVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const handlePreloaderComplete = () => {
    setIsPreloaderVisible(false);
    setIsAppVisible(true);
  };

  useEffect(() => {
    if (isAppVisible) {
      const ctx = gsap.context(() => {
        // Nav animation
        const tl = gsap.timeline();
        tl.from(navRef.current, {
          y: -100,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out"
        })
        .from(".nav-item", {
          y: -20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)"
        }, "-=0.4");

        // Main content animation
        gsap.from(mainRef.current, {
          opacity: 0,
          y: 30,
          duration: 1,
          delay: 0.2,
          ease: "power2.out"
        });
      });
      return () => ctx.revert();
    }
  }, [isAppVisible]);

  return (
    <>
      {isPreloaderVisible && <Preloader onComplete={handlePreloaderComplete} />}
      
      <div className={`transition-opacity duration-1000 ${isAppVisible ? "opacity-100" : "opacity-0"}`}>
        <nav ref={navRef} className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link href="/" className="nav-item text-2xl font-bold text-blue-600 hover:scale-105 transition-transform duration-300 mt-1">
                  DevBlog
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <Link href="/" className="nav-item text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Home
                </Link>
                {session ? (
                  <>
                    <Link href="/dashboard" className="nav-item text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/posts/create" className="nav-item text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Write
                    </Link>
                    <div className="nav-item flex items-center space-x-3 ml-4 border-l pl-4">
                      <span className="text-sm text-gray-500 font-medium">{session.user?.name}</span>
                      <button 
                        onClick={() => signOut()}
                        className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="nav-item text-gray-700 hover:text-blue-600 font-medium">
                      Sign In
                    </Link>
                    <Link href="/auth/signup" className="nav-item bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95">
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
      </div>
    </>
  );
}
