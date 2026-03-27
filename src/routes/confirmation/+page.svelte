<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import QRCode from "qrcode";

  let registration: Record<string, string | boolean | number> | null = $state(null);
  let qrDataUrl = $state("");
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    const id = $page.url.searchParams.get("id");
    if (!id) {
      error = "No registration ID found.";
      loading = false;
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !data) {
      error = "Registration not found.";
      loading = false;
      return;
    }

    registration = data;

    const qrPayload = JSON.stringify({
      event: "Glitter Me Softly",
      id: data.id,
      name: data.name,
      email: data.email,
    });

    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 2,
      color: {
        dark: "#fff",
        light: "#0a0012",
      },
      errorCorrectionLevel: "M",
    });

    loading = false;
  });
</script>

<script lang="ts" module>
  function downloadQR() {
    const link = document.createElement("a");
    const img = document.querySelector(
      '[alt="QR Code Ticket"]',
    ) as HTMLImageElement;
    if (img) {
      link.download = "glitter-me-softly-ticket.png";
      link.href = img.src;
      link.click();
    }
  }

  function downloadCalendar() {
    const event = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GlitterMeSoftly//EN",
      "BEGIN:VEVENT",
      "DTSTART:20260424T160000Z",
      "DTEND:20260425T000000Z",
      "SUMMARY:Glitter Me Softly",
      "LOCATION:DAKS\\, Spittelauerlände 12\\, Vienna",
      "DESCRIPTION:A night of sparkle & love.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([event], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "glitter-me-softly.ics";
    link.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="min-h-screen flex flex-col justify-center px-6 md:px-16 py-20">
  <div class="max-w-7xl mx-auto w-full">
    {#if loading}
      <div class="text-center">
        <div
          class="w-10 h-10 border-2 border-neon-pink/20 border-t-neon-pink rounded-full animate-spinner mx-auto mb-4"
        ></div>
        <p class="text-white/40 text-sm tracking-[0.3em] uppercase">
          Loading your ticket...
        </p>
      </div>
    {:else if error}
      <div class="text-center">
        <h2
          class="text-[clamp(2rem,5vw,4rem)] font-black text-red-400 uppercase leading-[0.85] mb-4"
        >
          Oops
        </h2>
        <p class="text-white/50 text-sm mb-8">{error}</p>
        <a
          href="/register"
          class="btn-glow btn-glow-base inline-block px-8 py-3 text-sm no-underline"
        >
          Try Again ✦
        </a>
      </div>
    {:else if registration}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        <!-- Left: ticket info -->
        <div class="flex flex-col justify-center">
          <p
            class="text-xs tracking-[0.4em] neon-label uppercase mb-6"
          >
            Your ticket
          </p>
          <h1
            class="text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.85] tracking-[-0.04em] neon-text mb-8"
          >
            You're in
          </h1>

          <div class="space-y-4  border-white/10 pt-6">
            <div class="flex flex-col justify-between items-baseline">
              <span
                class="text-xs tracking-[0.3em] text-white/40 uppercase"
                >lets party</span
              >
              <span class="text-white text-3xl"
                >{registration.name}</span
              >
            </div>
             <!-- {#if registration.email}
            <div
              class="flex  flex-col justify-between items-baseline  pt-4"
            >
              <span
                class="text-xs tracking-[0.3em] text-white/40 uppercase"
                >Email</span
              >
              <span class="text-white"
                >{registration.email}</span
              >
            </div>
            {/if} -->
            {#if registration.plus_one}
              <div
                class="flex justify-between items-baseline  pt-4"
              >
                <span
                  class="text-xs tracking-[0.3em] text-white/40 uppercase"
                  >+1</span
                >
                <span class="text-white "
                  >{registration.plus_one_name || "Yes"}</span
                >
              </div>
            {/if}
            <!-- <div
              class="flex  flex-col justify-between items-baseline   pt-4"
            >
              <span
                class="text-xs tracking-[0.3em] text-white/40 uppercase"
                >On</span
              >
              <span class="text-white"
                >24.04.2026 — 18:00</span
              >
            </div> -->
          </div>
        </div>

        <!-- Right: QR code -->
        <div class="flex flex-col items-center justify-center">
          <div class="border border-white/10 p-6 mb-6">
            <img
              src={qrDataUrl}
              alt="QR Code Ticket"
              class="block [image-rendering:pixelated]"
            />
          </div>
          <p class="text-white/40 text-xs tracking-[0.3em] uppercase mb-6">
            Show this at the door
          </p>
          <div class="flex flex-col gap-3 w-full max-w-xs">
            <button
              class="btn-glow btn-glow-base py-3 px-8 text-xs w-full"
              onclick={() => downloadQR()}
            >
              Download QR ✦
            </button>
            <button
              class="btn-glow btn-glow-base py-3 px-8 text-xs w-full"
              onclick={() => downloadCalendar()}
            >
              Add to Calendar
            </button>
            <!-- <a
              href="/api/wallet/apple?id={registration.id}"
              class="btn-glow btn-glow-base py-3 px-8 text-xs w-full text-center no-underline"
            >
              Add to Apple Wallet
            </a>
            <a
              href="/api/wallet/google?id={registration.id}"
              class="btn-glow btn-glow-base py-3 px-8 text-xs w-full text-center no-underline"
            >
              Add to Google Wallet
            </a> -->
          </div>
        </div>
      </div>

      <div class="mt-16 text-center">
        <a
          href="/"
          class="text-xs tracking-[0.3em] text-white/40 uppercase hover:text-white/80 transition-colors duration-300 no-underline"
        >
          ← Back to Home
        </a>
      </div>
    {/if}
  </div>
</div>
