"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const curtainLeftRef = useRef<HTMLDivElement>(null);
  const curtainRightRef = useRef<HTMLDivElement>(null);

  const letters = "DevBlog".split("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Sophisticated Curtain Split Exit
          const exitTl = gsap.timeline({ onComplete });
          
          exitTl.to([boxRef.current, textRef.current], {
            y: -50,
            opacity: 0,
            duration: 0.5,
            ease: "power4.in"
          })
          .to(curtainLeftRef.current, {
            xPercent: -100,
            duration: 0.8,
            ease: "expo.inOut"
          }, "-=0.2")
          .to(curtainRightRef.current, {
            xPercent: 100,
            duration: 0.8,
            ease: "expo.inOut"
          }, "<");
        }
      });

      // Initial state setup
      gsap.set(boxRef.current, { 
        scale: 0, 
        rotationX: -90, 
        rotationY: -90,
        z: 500,
        opacity: 0 
      });
      gsap.set(lettersRef.current, { 
        opacity: 0, 
        scale: 2,
        z: 100,
        filter: "blur(10px)"
      });

      // 1. 3D Box Entrance
      tl.to(boxRef.current, {
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        z: 0,
        opacity: 1,
        duration: 1.2,
        ease: "expo.out"
      });

      // 2. Box "Pulse & Scan" - Box moves across letters
      tl.to(boxRef.current, {
        x: 280, // Adjust based on text width
        duration: 1.5,
        ease: "power4.inOut",
        onUpdate: function() {
          // Dynamic interaction: As the box passes letters, reveal them
          const boxX = gsap.getProperty(boxRef.current, "x") as number;
          lettersRef.current.forEach((letter, i) => {
            const letterX = letter.offsetLeft - 120; // Offset relative to start
            if (boxX > letterX && gsap.getProperty(letter, "opacity") === 0) {
              gsap.to(letter, {
                opacity: 1,
                scale: 1,
                z: 0,
                filter: "blur(0px)",
                duration: 0.4,
                ease: "back.out(2)"
              });
            }
          });
        }
      }, "-=0.2");

      // 3. Box transforms into a "Logo Accent"
      tl.to(boxRef.current, {
        width: "4px",
        height: "60px",
        borderRadius: "2px",
        backgroundColor: "#2563eb",
        x: 320,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
      });

      // 4. Subtle background glow
      tl.to(containerRef.current, {
        backgroundColor: "#f8fafc",
        duration: 1
      }, "-=1");

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden perspective-1000"
      style={{ perspective: "1000px" }}
    >
      {/* Curtain Layers */}
      <div ref={curtainLeftRef} className="absolute inset-y-0 left-0 w-1/2 bg-white z-50 border-r border-gray-100"></div>
      <div ref={curtainRightRef} className="absolute inset-y-0 right-0 w-1/2 bg-white z-50 border-l border-gray-100"></div>

      <div className="relative flex items-center z-[60]">
        {/* The 3D Box / Scanner */}
        <div 
          ref={boxRef}
          className="absolute -left-32 w-16 h-16 bg-blue-600 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.4)]"
        ></div>

        {/* The Text */}
        <div ref={textRef} className="flex space-x-1 select-none">
          {letters.map((char, i) => (
            <span
              key={i}
              ref={(el) => { if (el) lettersRef.current[i] = el; }}
              className={`text-6xl md:text-8xl font-black tracking-tighter inline-block ${
                i < 3 ? "text-gray-900" : "text-blue-600"
              }`}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
