"use client"
import React, { useEffect, useRef } from 'react';
import gsap from "gsap"
// interface HeroProps{
//     loading:boolean;
// }

const Hero = () => {
    // GSAP refs
      const heroBadgeRef = useRef<HTMLSpanElement>(null);
      const heroTitleRef = useRef<HTMLHeadingElement>(null);
      const heroSubRef   = useRef<HTMLParagraphElement>(null);
      const heroOrb1Ref  = useRef<HTMLDivElement>(null);
      const heroOrb2Ref  = useRef<HTMLDivElement>(null);
      const heroOrb3Ref  = useRef<HTMLDivElement>(null);
      const underlineRef = useRef<HTMLSpanElement>(null);
        useEffect(() => {
    // if (loading) return;

    const raf = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(heroBadgeRef.current,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 }
        )
        .fromTo(heroTitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.3"
        )
        .fromTo(heroSubRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(underlineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.6, ease: "power2.inOut" },
          "-=0.2"
        );

        gsap.to(heroOrb1Ref.current, { y: -24, scale: 1.06, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.to(heroOrb2Ref.current, { y: 18, x: -14, scale: 0.95, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.5 });
        gsap.to(heroOrb3Ref.current, { y: -14, x: 10, duration: 11, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3 });
      });

      return () => ctx.revert();
    });

    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <section className="relative bg-linear-to-br from-blue-50 via-indigo-50 to-sky-100 overflow-hidden py-20 px-6 text-center h-125">
        <div className="pointer-events-none absolute inset-0">
          <div ref={heroOrb1Ref} className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
          <div ref={heroOrb2Ref} className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-orange-200/25 rounded-full blur-3xl" />
          <div ref={heroOrb3Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <span
            ref={heroBadgeRef}
            style={{ opacity: 0 }}
            className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Live Auctions
          </span>

          <h1
            ref={heroTitleRef}
            style={{ opacity: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4"
          >
            Bid. Win. Own.{" "}
            <span className="text-blue-600 relative inline-block">
              Discover exciting
              <span
                ref={underlineRef}
                className="absolute -bottom-1 left-0 w-full h-[3px] bg-blue-400/50 rounded-full"
                style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
              />
            </span>{" "}
            auctions daily.
          </h1>

          <p
            ref={heroSubRef}
            style={{ opacity: 0 }}
            className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8"
          >
            Simple, fast, and secure bidding on unique items.
            <br className="hidden sm:block" />
            Join thousands of collectors worldwide.
          </p>
        </div>
      </section>
  )
}

export default Hero
