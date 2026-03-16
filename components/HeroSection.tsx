"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        delay: 0.5
      });
      
      gsap.from(".hero-text", {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.8
      });

      gsap.from(".hero-underline", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1.2,
        ease: "power2.inOut",
        delay: 1.2
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={heroRef} className="mb-12 overflow-hidden">
      <h1 className="hero-title text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
        Welcome to <span className="text-blue-600 relative inline-block">
          DevBlog
          <span className="hero-underline absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full"></span>
        </span>
      </h1>
      <p className="hero-text mt-6 text-xl text-gray-600 max-w-2xl">
        A space for developers to share insights, tutorials, and the latest trends in software engineering.
      </p>
    </header>
  );
}
