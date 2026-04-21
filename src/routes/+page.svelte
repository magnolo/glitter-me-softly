<script lang="ts">
  import GlitterBackground from "$lib/components/GlitterBackground.svelte";
  import { onMount } from "svelte";

  let visible = $state(false);
  let activeDj = $state<string | null>(null);

  const djs = [
        {
      name: "yassi puls4ra",
      url: "https://soundcloud.com/yassi_puls4ra/resistanz-festival-2023",
      color: "pink",
    },
    {
      name: "Kobas",
      url: "https://soundcloud.com/mihaelkobas/kobas-klangkrater-aposqawiqt",
      color: "black",
    },
    {
      name: "fivesixsevenkate",
      url: "https://soundcloud.com/diskoanimale/fivesixsevenkate-kramladen-diskoanimale-240323",
      color: "pink",
    },
    {
      name: "DJ The Collector ",
      url: "https://soundcloud.com/the-collector/collector-in-the-house-mix",
      color: "black",
    },
    { name: "Dj iSi", url: null, color: "pink" },
  ];

  onMount(() => {
    visible = true;

    const parallaxImages =
      document.querySelectorAll<HTMLImageElement>(".parallax-img");

    function onScroll() {
      for (const img of parallaxImages) {
        const section = img.closest("section");
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        const progress = -rect.top / window.innerHeight;
        const offset = progress * 30;
        img.style.transform = `translateY(${offset}%)`;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });
</script>

<GlitterBackground />

<div
  class="transition-all duration-1000 {visible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-5'}"
>
  <!-- Hero -->
  <section
    class="min-h-screen flex flex-col justify-center px-6 md:px-16 py-20"
  >
    <div class="max-w-7xl mx-auto w-full">
      <p class="text-xs tracking-[0.4em] uppercase mb-6 neon-label">
        A night of sparkle & love
      </p>
      <h1
        class="text-[clamp(4rem,15vw,12rem)] font-black uppercase leading-[0.85] tracking-[-0.04em] neon-text"
      >
        Glitter<br />Me Softly
      </h1>
      <div class="mt-8 flex flex-col md:flex-row  gap-6 md:gap-16">
        <p class="text-white/70 text-sm md:text-base max-w-xs leading-relaxed" style="text-shadow: 0 0 20px rgba(0, 255, 255, 0.15);">
          Four decades of light. One night of sound. Dress reflective. Dance
          like noone is watching.
        </p>
        <div class="pt-4">

          <a
          href="/register"
         class="btn-glow btn-glow-base inline-block py-4 px-12 text-sm no-underline animate-[glow-pulse_2s_ease-in-out_infinite]"
        >
          Get your pass ✦
        </a>
        
  <p class="text-white/30 text-xs mt-2 md:text-center">Limited spots available</p>
      </div>
      </div>
    </div>
  </section>

  <!-- Hard Facts -->
  <section class="px-6 md:px-16 py-20 md:py-32">
    <div class="max-w-7xl mx-auto">
      <p class="text-xs tracking-[0.4em] uppercase mb-12 neon-label">
        The details
      </p>
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 md:gap-y-16"
      >
        <div>
          <span class="text-xs tracking-[0.3em] uppercase neon-label"
            >Date</span
          >
          <div
            class="text-[clamp(2.5rem,6vw,5rem)] font-black  neon-glow-cyan uppercase leading-[0.85] mt-2"
          >
            24.04.2026
          </div>
          <p class="text-white/60 text-sm mt-3">The day to remember</p>
        </div>
        <a
          href="https://www.google.com/maps/place/Dachsbau+-+Atelier-CoWorking+Space/@48.2339495,16.3607168,163m/data=!3m1!1e3!4m6!3m5!1s0x476d0634e46cb56f:0x6d562d9aeff8c177!8m2!3d48.2340535!4d16.3608401!16s%2Fg%2F11b6jgmzml"
          target="_blank"
          rel="noopener noreferrer"
          class="block group transition-opacity hover:opacity-90"
        >
          <span class="text-xs tracking-[0.3em] uppercase neon-label"
            >Location</span
          >
          <div
            class="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.85] mt-2 neon-glow"
          >
            DAKS
          </div>
          <p class="text-white/60 text-sm mt-3">Spittelauerlände 12, Vienna</p>
          <p class="text-neon-pink/70 text-xs tracking-[0.2em] uppercase mt-2 group-hover:text-neon-pink transition-colors">
            Open in Maps &rarr;
          </p>
        </a>
        <div>
          <span class="text-xs tracking-[0.3em] uppercase neon-label"
            >Doors</span
          >
          <div
            class="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.85] mt-2 neon-glow-cyan"
          >
            18:00
          </div>
          <p class="text-white/60 text-sm mt-3">Grab your welcome shot</p>
        </div>
        <div>
          <span class="text-xs tracking-[0.3em] uppercase neon-label"
            >Dress code</span
          >
          <div
            class="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.85] mt-2 neon-glow"
          >
            Reflective
          </div>
          <p class="text-white/60 text-sm mt-3">The shinier the better</p>
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


  <!-- DJ Lineup — plain text section -->
  <section
    class="relative z-10 min-h-[50vh] md:min-h-[60vh] flex items-center justify-center px-6 md:px-16 py-12 md:py-20"
  >
    <!-- <div
      class="absolute inset-0 bg-linear-to-l from-black/80 via-black/50 to-transparent"
    ></div> -->
    <div class="max-w-7xl mx-auto w-full relative">
      <p class="text-xs tracking-[0.4em] uppercase mb-12 neon-label">
        The Lineup
      </p>
      <div class="flex flex-col gap-4 mt-2">
        {#each djs as dj}
          <div class="">
            {#if dj.url}
              <button
                onclick={() =>
                  (activeDj = activeDj === dj.name ? null : dj.name)}
                class="text-[clamp(2rem,6vw,6rem)] font-black uppercase leading-[0.85] no-underline transition-colors duration-300 cursor-pointer bg-transparent border-none p-0 text-left {dj.color ===
                'pink'
                  ? 'text-neon-pink hover:text-neon-gold'
                  : 'text-white hover:text-neon-gold'}"
              >
                {dj.name}
                <span class="text-[0.4em] align-middle text-white/30"
                  >{activeDj === dj.name ? "⏸" : "▶"}</span
                >
              </button>
              {#if activeDj === dj.name}
                <div class="my-4 border-neon-pink border">
                  <iframe
                    title="{dj.name} on SoundCloud"
                    width="100%"
                    height="166"
                    scrolling="no"
                    frameborder="no"
                    allow="autoplay"
                    src="https://w.soundcloud.com/player/?url={encodeURIComponent(
                      dj.url,
                    )}&color=%23ff00ff&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
                  ></iframe>
                </div>
              {/if}
            {:else}
              <span
                class="text-[clamp(2rem,6vw,6rem)] font-black uppercase leading-[0.85] {dj.color ===
                'pink'
                  ? 'text-neon-pink'
                  : 'text-white'}"
              >
                {dj.name}
              </span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </section>
  <hr class="neon-divider mx-6 md:mx-16" />
  <!-- Beats — image section -->
  <section
    class="relative z-10 min-h-[50vh] md:h-[60vh] flex items-end px-6 md:px-16 py-12 md:py-20 overflow-hidden"
  >
    <img
      src="/images/beats.jpg"
      alt="DJ and beats"
      class="parallax-img absolute inset-0 w-full h-[140%] object-cover grayscale -top-[20%] opacity-20"
      style="will-change: transform;"
    />
    <!-- <div
      class="absolute inset-0 bg-neon-pink/20 mix-blend-color pointer-events-none"
    ></div> -->
    <!-- <div
      class="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"
    ></div> -->
    <div
      class="absolute inset-0 bg-neon-pink/20 mix-blend-color pointer-events-none"
    ></div>
    <div class="relative max-w-7xl mx-auto w-full flex flex-col items-end">
      <div class="max-w-7xl mx-auto w-full">
        <h3
          class="text-[clamp(2.5rem,6vw,8rem)] font-black text-neon-pink uppercase leading-[0.85] mb-4"
        >
          Beats<br />all night
        </h3>
        <p
          class="text-white/80 text-[clamp(0.875rem,1vw,1rem)] leading-relaxed max-w-sm md:max-w-lg"
        >
          Live DJ spinning house, techno, and everything that makes you move.
          Bass so deep your soul will vibrate. No requests. Just surrender.
        </p>
      </div>
    </div>
  </section>
    <hr class="neon-divider mx-6 md:mx-16" />

  <!-- Glitter — plain text section -->
  <section
    class="relative z-10 min-h-[50vh] md:h-[60vh] flex items-end px-6 md:px-16 py-12 md:py-20 overflow-hidden"
  >
   <img
      src="/images/glitter.jpg"
      alt="Drinks and vibes"
      class="parallax-img absolute inset-0 w-full h-[120%] object-cover grayscale -top-[10%] opacity-5"
      style="will-change: transform;"
    />
    <div class="max-w-7xl mx-auto w-full flex flex-col items-end text-right">
      <h3
        class="text-[clamp(2.5rem,6vw,8rem)] font-black text-neon-pink uppercase leading-[0.85] mb-4"
      >
        Glitter<br />station
      </h3>
      <p
        class="text-white/80 text-[clamp(0.875rem,1vw,1rem)] leading-relaxed max-w-sm md:max-w-lg"
      >
        Get glittered up at our sparkle station. Face gems, body glitter, neon
        paint — go full rave mode. Come bare, leave shining.
      </p>
    </div>
  </section>
  <hr class="neon-divider mx-6 md:mx-16" />

  <!-- Drinks — image section -->
  <section
    class="relative z-10 min-h-[50vh] md:h-[60vh] flex items-end px-6 md:px-16 py-12 md:py-20 overflow-hidden"
  >
    <img
      src="/images/drinks.jpg"
      alt="Drinks and vibes"
      class="parallax-img absolute inset-0 w-full h-[120%] object-cover grayscale -top-[10%] opacity-20"
      style="will-change: transform;"
    />
    <div
      class="absolute inset-0 bg-neon-pink/20 mix-blend-color pointer-events-none"
    ></div>
    <!--<div
      class="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"
    ></div> -->
    <div class="relative max-w-7xl mx-auto w-full flex flex-col items-end">
      <div class="max-w-7xl mx-auto w-full">
        <h3
          class="text-[clamp(2.5rem,6vw,8rem)] font-black text-neon-pink uppercase leading-[0.85] mb-4"
        >
          Drinks<br />& vibes
        </h3>
        <p
          class="text-white/80 text-[clamp(0.875rem,1vw,1rem)] leading-relaxed max-w-sm md:max-w-lg"
        >
          Neon cocktails, glow-in-the-dark drinks, and good energy. Dress code:
          the more reflective, the better.
        </p>
      </div>
    </div>
  </section>

  <hr class="neon-divider mx-6 md:mx-16" />

  <!-- CTA -->
  <section class="px-6 md:px-16 py-32 text-center">
    <div class="max-w-7xl mx-auto">
      <p class="text-xs tracking-[0.4em] uppercase mb-6 neon-label">
        Secure your spot
      </p>
      <h2
        class="text-[clamp(2rem,6vw,5rem)] font-black uppercase leading-[0.85] mb-6 neon-text"
      >
        Get your<br />QR pass
      </h2>
      <p class="text-white/50 text-xs tracking-[0.25em] uppercase mb-10">
        ✦ Guestlist only ✦
      </p>
      <a
        href="/register"
        class="btn-glow btn-glow-base inline-block py-4 px-12 text-sm no-underline animate-[glow-pulse_2s_ease-in-out_infinite]"
      >
        Register now ✦
      </a>
      <p class="text-white/30 text-xs mt-6">Limited spots available</p>
    </div>
  </section>
</div>
