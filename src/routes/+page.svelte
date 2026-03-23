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
  <section class="relative overflow-hidden">
    <!-- Grid background -->
    <div
      class="absolute inset-0 opacity-10"
      style="
      background-image:
        linear-gradient(rgba(255,0,255,0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,0,255,0.3) 1px, transparent 1px);
      background-size: 60px 60px;
    "
    ></div>

    <!-- Hero Section -->
    <section
      class="md:min-h-[70vh] flex flex-col items-center justify-center text-center px-5 py-10 relative"
    >
      <div class="max-w-200">
        <!-- <div class="divider"></div> -->
        <p
          class="neon-text md:text-lg md:font-semibold tracking-wider md:tracking-[12px] uppercase mb-4"
        >
          A night of sparkles & love
        </p>
        <!-- <div
          class="w-50 md:w-100 h-px mx-auto my-5 bg-linear-to-r from-transparent via-[rgb(255,77,166)] to-transparent"
        ></div> -->
        <h1
          class="neon-text text-[clamp(3rem,10vw,7rem)] font-black leading-[0.8em] mb-6 tracking-[-0.03em]"
        >
          <span class="inline-block">Glitter</span>
          <span class="inline-block">Me</span>
          <span class="inline-block">Softly</span>
        </h1>
        <div
          class="w-50 md:w-100 h-px mx-auto my-5 bg-linear-to-r from-transparent via-[rgb(255,77,166)] to-transparent"
        ></div>
        <div
          class="tagline neon-text text-xs md:text-[1.1rem] mb-12 md:tracking-[5px] font-extralight uppercase"
        >
          <!-- <span class="inline-block animate-spin-sparkle mx-2">&#10022;</span> -->
          Shine like a crazy diamand
          <!-- <span class="inline-block animate-spin-sparkle mx-2">&#10022;</span> -->
        </div>

        <!-- <p
        class="text-foreground text-xs md:text-sm max-w-md mx-auto text-center my-16 leading-relaxed"
      >
        Four decades of light. One night of sound.
        <br />
        Registration required for entry.
      </p>
      <div class="max-w-md mx-auto space-y-0 my-16">
        {#each details as item}
          <div
            class="group flex justify-between items-baseline py-3 border-b border-neon-purple/10  text-sm"
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
    </div> -->
      </div>
    </section>

    <!-- Hard Facts Section -->

    <!-- Glowing orb decorations -->
    <div
      class="absolute top-10 right-10 w-32 h-32 rounded-full bg-neon-pink/20 blur-3xl"
    ></div>
    <div
      class="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-neon-cyan/15 blur-3xl"
    ></div>

    <div class="relative max-w-5xl mx-auto px-6">
      <!-- Section title -->
      <!-- <div class="flex items-center gap-4 mb-16">
        <div class="text-[clamp(4rem,12vw,10rem)] font-black leading-none tracking-tighter uppercase">
          <span class="neon-text">Hard</span>
          <br />
          <span class="text-foreground" style="-webkit-text-stroke: 2px rgba(255,0,255,0.6); -webkit-text-fill-color: transparent;">Facts</span>
        </div>
        <div class="hidden md:block ml-auto text-right">
          <span class="text-neon-pink text-[5rem] font-black leading-none">'26</span>
        </div>
      </div> -->

      <!-- Facts grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
        {#each [{ big: "1", sub: "NIGHT ONLY" }, { big: "18:00", sub: "DOORS OPEN" }, { big: "128+", sub: "BPM ALL NIGHT" }, { big: "40", sub: "YEARS OF LIGHT" }] as fact}
          <div
            class="bg-bg-dark/80 p-6 md:p-8 text-center group hover:bg-neon-pink/5 transition-colors duration-500"
          >
            <div
              class="text-[clamp(2rem,5vw,3.5rem)] font-black text-foreground group-hover:neon-text transition-all duration-300 leading-none mb-2"
            >
              {fact.big}
            </div>
            <div
              class="text-[0.65rem] md:text-xs tracking-[0.2em] text-muted-foreground uppercase"
            >
              {fact.sub}
            </div>
          </div>
        {/each}
      </div>

      <!-- Bottom strip -->
      <div class="mt-px grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
        <div class="bg-bg-dark/80 p-6 md:p-10 flex flex-col justify-center">
          <div class="text-xs tracking-[0.3em] text-neon-cyan uppercase mb-3">
            Location
          </div>
          <div
            class="text-2xl md:text-3xl font-bold text-foreground uppercase leading-tight"
          >
            DAKS
          </div>
          <div class="text-sm text-muted-foreground mt-1">
            Spittelauerlände 12, Vienna
          </div>
        </div>
        <div class="bg-bg-dark/80 p-6 md:p-10 flex flex-col justify-center">
          <div class="text-xs tracking-[0.3em] text-neon-pink uppercase mb-3">
            Dress Code
          </div>
          <div
            class="text-2xl md:text-3xl font-bold text-foreground uppercase leading-tight"
          >
            Reflective
          </div>
          <div class="text-sm text-muted-foreground mt-1">
            The more you shine, the more you belong
          </div>
        </div>
      </div>

      <!-- Date banner -->
      <div
        class="mt-12 border border-neon-pink/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div class="text-center md:text-left">
          <div
            class="text-xs tracking-[0.4em] text-muted-foreground uppercase mb-1"
          >
            Save the date
          </div>
          <div class="text-3xl md:text-5xl font-black neon-text tracking-tight">
            FRI 24.04.2026
          </div>
        </div>
        <a
          href="/register"
          class="btn-glow btn-glow-base inline-block px-8 py-3 text-sm no-underline whitespace-nowrap"
        >
          GET YOUR PASS ✦
        </a>
      </div>
    </div>
  </section>

  <!-- Info Section -->
  <section class="pt-32 pb-40">
    <!-- Section 1: Beats — image left, text right -->
    <div>
      <div class="max-w-5xl mx-auto px-6 mb-32 md:mb-48">
        <div class="flex flex-col md:flex-row items-start gap-8 md:gap-16">
          <div class="w-full md:w-3/5 relative clip-right">
            <img
              src="/images/beats.jpg"
              alt=""
              class="w-full aspect-4/3 object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
            <!-- <div class="absolute inset-0 bg-neon-pink/5 mix-blend-multiply pointer-events-none"></div> -->
          </div>
          <div
            class="w-full md:w-2/5 flex flex-col justify-end md:pt-24 relative"
          >
            <h3
              class="text-[clamp(2.5rem,5vw,4.5rem)] neon-text font-bold italic uppercase leading-[0.85] mb-6 text-foregroun -ml-[7vw]"
            >
              Beats all<br />night:
            </h3>
            <p
              class="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm"
            >
              Live DJ spinning house, techno, and everything that makes you
              move. Bass so deep your soul will vibrate. No requests. Just
              surrender.
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- Section 2: Glitter — image right, text left -->
    <div class="max-w-5xl mx-auto px-6 mb-32 md:mb-48">
      <div
        class="flex flex-col md:flex-row-reverse items-start gap-8 md:gap-16"
      >
        <div class="w-full md:w-3/5 relative">
          <img
            src="/images/glitter.jpg"
            alt=""
            class="w-full aspect-4/3 object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div
            class="absolute inset-0 bg-neon-cyan/5 mix-blend-multiply pointer-events-none"
          ></div>
        </div>
        <div class="w-full md:w-2/5 flex flex-col justify-end md:pt-24">
          <h3
            class="text-[clamp(2.5rem,5vw,4.5rem)] font-black italic uppercase leading-[0.85] mb-6 text-foreground"
          >
            Glitter<br />station:
          </h3>
          <p
            class="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm"
          >
            Get glittered up at our sparkle station. Face gems, body glitter,
            neon paint — go full rave mode. Come bare, leave shining.
          </p>
        </div>
      </div>
    </div>

    <!-- Section 3: Drinks — image left, text right -->
    <div class="max-w-5xl mx-auto px-6 mb-32 md:mb-48">
      <div class="flex flex-col md:flex-row items-start gap-8 md:gap-16">
        <div class="w-full md:w-3/5 relative">
          <img
            src="/images/drinks.jpg"
            alt=""
            class="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div
            class="absolute inset-0 bg-neon-purple/5 mix-blend-multiply pointer-events-none"
          ></div>
        </div>
        <div class="w-full md:w-2/5 flex flex-col justify-end md:pt-24">
          <h3
            class="text-[clamp(2.5rem,5vw,4.5rem)] font-black italic uppercase leading-[0.85] mb-6 text-foreground"
          >
            Drinks &<br />vibes:
          </h3>
          <p
            class="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm"
          >
            Neon cocktails, glow-in-the-dark drinks, and good energy. Dress
            code: the more reflective, the better.
          </p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="text-center mt-10">
      <p
        class="text-muted-foreground text-sm md:text-base tracking-widest uppercase mb-8"
      >
        Secure your spot. Get your QR pass.
      </p>
      <a
        href="/register"
        class="btn-glow btn-glow-base inline-block px-10 py-3 text-sm no-underline"
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
