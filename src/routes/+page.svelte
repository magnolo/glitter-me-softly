<script lang="ts">
  import { onMount } from "svelte";

  let visible = $state(false);

  const details = [
    { label: "DATE", value: "FRI 24.04.2026" },
    { label: "DOORS", value: "20:00" },
    { label: "LOCATION", value: "DAKS, SPITTELAUERLÄNDE 12" },
    { label: "DRESS CODE", value: "REFLECTIVE" },
    { label: "BPM", value: "128 — 145" },
  ];

  onMount(() => {
    visible = true;
  });
</script>

<div
  class="transition-all duration-1000 {visible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-5'}"
>
  <!-- Hero Section -->
  <section
    class="min-h-screen flex flex-col items-center justify-center text-center px-5 py-10 relative"
  >
    <div class="max-w-200">
      <!-- <div class="divider"></div> -->
      <p class="neon-text md:text-lg md:font-semibold tracking-wider md:tracking-[12px] uppercase mb-4">
        A night of sparkles & love
      </p>
      <h1
        class="neon-text text-[clamp(3rem,10vw,7rem)] font-black leading-[0.8em] mb-6 tracking-[-0.03em]"
      >
        <span class="inline-block">Glitter</span>
        <span class="inline-block">Me</span>
        <span class="inline-block">Softly</span>
      </h1>
      <div
        class="tagline neon-text text-xs md:text-[1.1rem] mb-12 md:tracking-[5px] font-extralight uppercase"
      >
        <!-- <span class="inline-block animate-spin-sparkle mx-2">&#10022;</span> -->
        Shine like a crazy diamand
        <!-- <span class="inline-block animate-spin-sparkle mx-2">&#10022;</span> -->
      </div>
      <div
        class="w-50 h-px mx-auto my-10 bg-linear-to-r from-transparent via-[rgb(255,77,166)] to-transparent"
      ></div>
      <p
        class="text-foreground text-xs md:text-sm max-w-md mx-auto text-center my-16 font-mono leading-relaxed"
      >
        Four decades of light. One night of sound.
        <br />
        Registration required for entry.
      </p>
      <div class="max-w-md mx-auto space-y-0 my-16">
        {#each details as item}
          <div
            class="group flex justify-between items-baseline py-3 border-b border-neon-purple/10 font-mono text-sm"
          >
            <span
              class="text-muted-foreground tracking-[0.15em] group-hover:glitter-text-subtle transition-all duration-300"
            >
              {item.label}
            </span>
            <span class="text-foreground tabular-nums tracking-wider">
              {item.value}
            </span>
          </div>
        {/each}
      </div>
      <!-- <div class="flex flex-wrap gap-6 justify-center mb-12">
        <div class="detail-chip">
          <span class="detail-label">When</span>
          <span class="font-semibold text-base">Saturday, April 18th, 2026</span
          >
        </div>
        <div class="detail-chip">
          <span class="detail-label">Time</span>
          <span class="font-semibold text-base">9 PM - Late</span>
        </div>
        <div class="detail-chip">
          <span class="detail-label">Where</span>
          <span class="font-semibold text-base"
            >TBA - Check your QR ticket!</span
          >
        </div>
      </div> -->

      <a
        href="/register"
        class="btn-glow btn-glow-base inline-block text-black font-bold text-sm leading-5 tracking-widest py-3 px-8 rounded"
      >
       GENERATE PASS ✦
      </a>
    </div>

    <div
      class="absolute bottom-0 flex flex-col items-center gap-2 text-text-muted text-xs tracking-[2px] animate-bounce-hint"
    >
      <span>Scroll for more</span>
      <div class="text-base">v</div>
    </div>
  </section>

  <!-- Info Section -->
  <section class="px-5 pt-20 pb-30 max-w-275 mx-auto text-center">
    <h2 class="neon-text text-4xl mb-15">What to Expect</h2>

    <div
      class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-7 mb-20"
    >
      <div class="group card info-card">
        <img src="/images/beats.jpg" alt="" class="info-card-img" />
        <div class="info-card-overlay"></div>
        <div class="info-card-body">
          <h3 class="text-xl mb-3 text-neon-gold">Beats All Night</h3>
          <p class="text-text-muted leading-7">
            Live DJ spinning house, techno, and everything that makes you move.
            Bass so deep your soul will vibrate.
          </p>
        </div>
      </div>
      <div class="group card info-card">
        <img src="/images/glitter.jpg" alt="" class="info-card-img" />
        <div class="info-card-overlay"></div>
        <div class="info-card-body">
          <h3 class="text-xl mb-3 text-neon-gold">Glitter Station</h3>
          <p class="text-text-muted leading-7">
            Get glittered up at our sparkle station. Face gems, body glitter,
            neon paint — go full rave mode.
          </p>
        </div>
      </div>
      <div class="group card info-card">
        <img src="/images/drinks.jpg" alt="" class="info-card-img" />
        <div class="info-card-overlay"></div>
        <div class="info-card-body">
          <h3 class="text-xl mb-3 text-neon-gold">Drinks & Vibes</h3>
          <p class="text-text-muted leading-7">
            Neon cocktails, glow-in-the-dark drinks, and good energy. Dress
            code: the more glitter, the better.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-10">
      <p class="text-xl text-text-muted mb-6">
        Secure your spot. Get your QR ticket.
      </p>
      <a
        href="/register"
        class="btn-glow btn-glow-base inline-block px-12 py-4 text-lg no-underline"
      >
        Register Now
      </a>
    </div>
  </section>
</div>

<style>
  /* .tagline {
    background: linear-gradient(90deg, gray, #f075b3, #f7d56e, #47ebeb, gray) 0
      0 / 300%;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: 5s infinite shimmer;
  } */

  @keyframes shimmer {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 300% center;
    }
  }
</style>
