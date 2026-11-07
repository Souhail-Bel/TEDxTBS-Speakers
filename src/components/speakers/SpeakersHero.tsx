"use client";

export function SpeakersHero() {
  return (
    <section className="relative h-[210px] w-full overflow-hidden border-b border-[#261617] bg-[#080808] sm:h-[235px]">
      {/* Stage Photography Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.01]"
        style={{ backgroundImage: "url('/images/hero-stage.jpg')" }}
        aria-hidden="true"
      />

      {/* Cinematic Vignette & Readability Overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 52% 70% at 50% 46%, rgba(8,8,8,0.68) 0%, rgba(8,8,8,0.28) 65%, rgba(8,8,8,0.58) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/25 to-black/30"
        aria-hidden="true"
      />

      {/* Crisp Vector Red Particle-Wave Accent on Right */}
      <svg
        viewBox="0 0 600 240"
        fill="none"
        className="pointer-events-none absolute right-0 bottom-0 h-full w-[55%] opacity-55 mix-blend-screen"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-ribbon" x1="0" y1="200" x2="600" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E31B2B" stopOpacity="0" />
            <stop offset="45%" stopColor="#E31B2B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FF1428" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path d="M40 235 C 210 195, 340 95, 610 55" stroke="url(#hero-ribbon)" strokeWidth="1.4" />
        <path d="M80 240 C 240 205, 365 112, 610 74" stroke="url(#hero-ribbon)" strokeWidth="1.1" opacity="0.75" />
        <path d="M120 242 C 270 212, 390 128, 610 92" stroke="url(#hero-ribbon)" strokeWidth="0.9" opacity="0.55" />
        <circle cx="430" cy="96" r="1.8" fill="#FF1428" opacity="0.8" />
        <circle cx="485" cy="72" r="1.4" fill="#FF7583" opacity="0.75" />
        <circle cx="535" cy="58" r="2" fill="#FF1428" opacity="0.85" />
        <circle cx="380" cy="128" r="1.5" fill="#E31B2B" opacity="0.7" />
      </svg>

      {/* Centered Hero Title & Subtitle */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-3 text-center">
        <h1 className="text-3xl font-bold tracking-[-0.025em] text-[#F5F5F5] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-[38px] sm:leading-tight">
          Speakers <span className="text-[#E31B2B]">Management</span>
        </h1>
        <p className="mt-1.5 text-sm font-normal tracking-[0.02em] text-[#D8D2D2] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-[16px]">
          Organize. Track. Inspire.
        </p>
      </div>
    </section>
  );
}
