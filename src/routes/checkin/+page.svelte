<script lang="ts">
  import { supabase } from "$lib/supabase";

  let videoEl = $state<HTMLVideoElement | undefined>(undefined);
  let canvasEl = $state<HTMLCanvasElement | undefined>(undefined);
  let scanning = $state(false);
  let status = $state<"idle" | "scanning" | "success" | "already" | "notfound">("idle");
  let guestName = $state("");
  let message = $state("");

  async function startScanning() {
    status = "scanning";
    scanning = true;

    const { default: jsQR } = await import("jsqr");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    if (!videoEl || !canvasEl) return;
    videoEl.srcObject = stream;
    await videoEl.play();

    const ctx = canvasEl.getContext("2d")!;

    function tick() {
      if (!scanning || !videoEl || !canvasEl) return;

      if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          stream.getTracks().forEach((t) => t.stop());
          handleScan(code.data);
          return;
        }
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  async function handleScan(data: string) {
    scanning = false;

    let parsed: { id: string; name: string; email?: string };

    try {
      parsed = JSON.parse(data);
    } catch {
      status = "notfound";
      message = "Invalid QR code";
      return;
    }

    if (!parsed.id && !parsed.name) {
      status = "notfound";
      message = "No registration ID in QR code";
      return;
    }

    // Look up registration
    const { data: reg, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("name", parsed.name)
      .single();

    if (error || !reg) {
      status = "notfound";
      message = "Registration not found";
      return;
    }

    guestName = reg.name;

    // Check if already checked in
    if (reg.checkedin) {
      status = "already";
      message = "Already checked in";
      return;
    }

    // Check in the guest
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ checkedin: true })
      .eq("name", parsed.name);

    if (updateError) {
      status = "notfound";
      message = "Failed to check in";
      return;
    }

    status = "success";
    message = "Welcome!";
  }

  function reset() {
    status = "scanning";
    scanning = false;
    guestName = "";
    message = "";
    startScanning();
  }
</script>

<div
  class="fixed inset-0 flex flex-col items-center justify-center transition-colors duration-500"
  class:bg-green-600={status === "success"}
  class:bg-red-600={status === "already" || status === "notfound"}
  class:bg-bg-dark={status === "idle" || status === "scanning"}
>
  {#if status === "idle"}
    <p class="text-xs tracking-[0.4em] text-white/40 uppercase mb-6">
      Check-in
    </p>
    <h1 class="text-[clamp(2rem,6vw,4rem)] font-black text-white uppercase leading-[0.85] mb-10 text-center px-6">
      Glitter<br />Me Softly
    </h1>
    <button
      class="btn-glow btn-glow-base py-4 px-12 text-sm"
      onclick={() => startScanning()}
    >
      Start scanning
    </button>

  {:else if status === "scanning"}
    <p class="text-xs tracking-[0.4em] text-white/40 uppercase mb-6">
      Check-in
    </p>
    <h1 class="text-[clamp(2rem,6vw,4rem)] font-black text-white uppercase leading-[0.85] mb-8 text-center px-6">
      Scan QR
    </h1>
    <div class="relative w-[80vw] max-w-sm aspect-square border border-white/20 overflow-hidden">
      <video bind:this={videoEl} class="absolute inset-0 w-full h-full object-cover" playsinline muted></video>
      <canvas bind:this={canvasEl} class="hidden"></canvas>
      <div class="absolute inset-4 border-2 border-white/30 pointer-events-none"></div>
    </div>
    <p class="text-white/40 text-sm mt-6 tracking-[0.2em] uppercase">
      Point camera at ticket
    </p>

  {:else}
    <div class="text-center px-6">
      {#if status === "success"}
        <div class="text-[6rem] mb-4">✓</div>
      {:else}
        <div class="text-[6rem] mb-4">✕</div>
      {/if}

      <h1 class="text-2xl font-black text-white uppercase leading-[0.85] mb-4">
        {message}
      </h1>

      {#if guestName}
        <p class="text-white/80 text-[clamp(2rem,8vw,5rem)] font-bold uppercase tracking-wide mb-8">
          {guestName}
        </p>
      {/if}

      <button
        class="btn-glow btn-glow-base py-3 px-8 text-sm mt-8"
        onclick={() => reset()}
      >
        Scan next
      </button>
    </div>
  {/if}
</div>
