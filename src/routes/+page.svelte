<script lang="ts">
  import GlitterBackground from "$lib/components/GlitterBackground.svelte";
  import { onMount } from "svelte";


  let visible = $state(false);

  onMount(() => {
    visible = true;

    const parallaxImages = document.querySelectorAll<HTMLImageElement>('.parallax-img');

    function onScroll() {
      for (const img of parallaxImages) {
        const section = img.closest('section');
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        const progress = -rect.top / window.innerHeight;
        const offset = progress * 20;
        img.style.transform = `translateY(${offset}%)`;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<GlitterBackground />

<div
  class="transition-all duration-1000 {visible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-5'}"
>
  <!-- Hero -->
  <section class="min-h-screen flex flex-col justify-center px-6 md:px-16 py-20">
    <div class="max-w-7xl mx-auto w-full">
      <p class="text-xs tracking-[0.4em] text-white/80 uppercase mb-6">
        A night of sparkle & sound
      </p>
      <h1 class="text-[clamp(4rem,15vw,12rem)] font-black uppercase leading-[0.85] tracking-[-0.04em] neon-text">
        Glitter<br />Me Softly
      </h1>
      <div class="mt-8 flex flex-col md:flex-row md:items-end gap-6 md:gap-16">
        <p class="text-white/80 text-sm md:text-base max-w-xs leading-relaxed">
          Four decades of light. One night of sound. Dress reflective. Dance until dawn.
        </p>
        <a
          href="/register"
          class="btn-glow btn-glow-base inline-block py-3 px-8 text-xs no-underline"
        >
          Get your pass ✦
        </a>
      </div>
    </div>
  </section>

  <!-- Hard Facts -->
  <section class="px-6 md:px-16 py-20 md:py-32">
    <div class="max-w-7xl mx-auto">
      <p class="text-xs tracking-[0.4em] text-white/80 uppercase mb-12">
        The details
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 md:gap-y-16">
        <div>
          <span class="text-xs tracking-[0.3em] text-white/40 uppercase">Date</span>
          <div class="text-[clamp(2.5rem,6vw,5rem)] font-black text-neon-pink uppercase leading-[0.85] mt-2">
            24.04.2026
          </div>
               <p class="text-white/80 text-sm mt-3">The shinier the better</p>
        </div>
        <div>
          <span class="text-xs tracking-[0.3em] text-white/40 uppercase">Location</span>
          <div class="text-[clamp(2.5rem,6vw,5rem)] font-black text-white uppercase leading-[0.85] mt-2">
            DAKS
          </div>
          <p class="text-white/80 text-sm mt-3">Spittelauerlände 12, Vienna</p>
        </div>
        <div>
          <span class="text-xs tracking-[0.3em] text-white/40 uppercase">Doors</span>
          <div class="text-[clamp(2.5rem,6vw,5rem)] font-black text-white uppercase leading-[0.85] mt-2">
            18:00
          </div>
               <p class="text-white/80 text-sm mt-3">The shinier the better</p>
        </div>
        <div>
          <span class="text-xs tracking-[0.3em] text-white/40 uppercase">Dress code</span>
          <div class="text-[clamp(2.5rem,6vw,5rem)] font-black text-white uppercase leading-[0.85] mt-2">
            Reflective
          </div>
          <p class="text-white/80 text-sm mt-3">The shinier the better</p>
        </div>
        <!-- <div>
          <span class="text-xs tracking-[0.3em] text-white/40 uppercase">BPM</span>
          <div class="text-[clamp(2.5rem,6vw,5rem)] font-black text-white uppercase leading-[0.85] mt-2">
            128 — 145
          </div>
        </div> -->
      </div>
    </div>
  </section>

  <!-- Beats — image section -->
  <section class="relative h-screen overflow-hidden">
    <img
      src="/images/beats.jpg"
      alt="DJ and beats"
      class="parallax-img absolute inset-0 w-full h-[120%] object-cover grayscale -top-[10%]"
      style="will-change: transform;"
    />
    <div class="absolute inset-0 bg-neon-pink/20 mix-blend-color pointer-events-none"></div>
    <div class="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>
    <div class="relative z-10 h-full flex items-end px-6 md:px-16 py-12 md:py-20">
      <div class="max-w-7xl mx-auto w-full">
        <h3 class="text-[clamp(2rem,5vw,4.5rem)] font-black text-white uppercase leading-[0.85] mb-4">
          Beats<br />all night
        </h3>
        <p class="text-white/60 text-sm leading-relaxed max-w-sm">
          Live DJ spinning house, techno, and everything that makes you move.
          Bass so deep your soul will vibrate. No requests. Just surrender.
        </p>
      </div>
    </div>
  </section>

  <!-- Glitter — plain text section -->
  <section class="relative z-10 min-h-screen flex items-end bg-bg-dark px-6 md:px-16 py-12 md:py-20">
    <div class="max-w-7xl mx-auto w-full flex flex-col items-end text-right">
      <h3 class="text-[clamp(2.5rem,6vw,5rem)] font-black text-neon-pink uppercase leading-[0.85] mb-4">
        Glitter<br />station
      </h3>
      <p class="text-white/60 text-sm leading-relaxed max-w-sm">
        Get glittered up at our sparkle station. Face gems, body glitter,
        neon paint — go full rave mode. Come bare, leave shining.
      </p>
    </div>
  </section>

  <!-- Drinks — image section -->
  <section class="relative h-screen overflow-hidden">
    <img
      src="/images/drinks.jpg"
      alt="Drinks and vibes"
      class="parallax-img absolute inset-0 w-full h-[120%] object-cover grayscale -top-[10%]"
      style="will-change: transform;"
    />
    <div class="absolute inset-0 bg-neon-pink/20 mix-blend-color pointer-events-none"></div>
    <div class="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>
    <div class="relative z-10 h-full flex items-end px-6 md:px-16 py-12 md:py-20">
      <div class="max-w-7xl mx-auto w-full">
        <h3 class="text-[clamp(2rem,5vw,4.5rem)] font-black text-white uppercase leading-[0.85] mb-4">
          Drinks<br />& vibes
        </h3>
        <p class="text-white/60 text-sm leading-relaxed max-w-sm">
          Neon cocktails, glow-in-the-dark drinks, and good energy.
          Dress code: the more reflective, the better.
        </p>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="px-6 md:px-16 py-32 text-center">
    <div class="max-w-7xl mx-auto">
      <p class="text-xs tracking-[0.4em] text-white/30 uppercase mb-6">Secure your spot</p>
      <h2 class="text-[clamp(2rem,6vw,5rem)] font-black text-white uppercase leading-[0.85] mb-10">
        Get your<br />QR pass
      </h2>
      <a
        href="/register"
        class="btn-glow btn-glow-base inline-block py-4 px-12 text-sm no-underline"
      >
        Register now ✦
      </a>
    </div>
  </section>
</div>
