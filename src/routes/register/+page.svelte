<script lang="ts">
  import { goto } from "$app/navigation";
  import GlitterBackground from "$lib/components/GlitterBackground.svelte";
  import { supabase } from "$lib/supabase";

  let name = $state("");
  let email = $state("");
  let message = $state("");
  let loading = $state(false);
  let error = $state("");

  let isValidEmail = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  let isFormValid = $derived(
    name.trim().length > 3 && (email.trim().length > 0 ? isValidEmail : true),
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    error = "";

    const { data, error: supaError } = await supabase
      .from("registrations")
      .insert({
        name,
        email,
        //phone: phone || null,
        message: message || null,
      })
      .select()
      .single();

    if (supaError) {
      loading = false;
      if (supaError.code === "23505") {
        error = "Are you on the list? If we are mistaken, please contact us";
      } else {
        error = "Oh no. That didnt worked out. Please try again.";
      }
      return;
    }

    // Send ticket email (fire and forget — don't block navigation)
    if (email) {
      fetch("/api/send-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
        }),
      }).catch(() => {});
    }
    goto(`/confirmation?id=${data.id}`);
  }
</script>

<GlitterBackground  zIndex={0} />

<div class="min-h-screen flex flex-col justify-center px-6 md:px-16 py-20">
  <div class="max-w-7xl mx-auto w-full">
    <a
      href="/"
      class="text-xs tracking-[0.3em] text-white/40 uppercase hover:text-white/80 transition-colors duration-300 no-underline"
    >
      ← Back
    </a>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
      <!-- Left: heading -->
      <div class="flex flex-col justify-center">
        <p class="text-xs tracking-[0.4em] neon-label uppercase mb-6">
          Registration
        </p>
        <h1
          class="max-w-md text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.85] tracking-[-0.04em] neon-text"
        >
          Get on the list
        </h1>
        <p
          class="text-white/80 text-sm md:text-base max-w-xs leading-relaxed mt-6"
        >
          Claim your spot on the dance floor. Your QR ticket will be generated
          instantly.
        </p>
      </div>

      <!-- Right: form -->
      <div class="md:p-10 p-6 backdrop-blur relative rounded border border-white/1 bg-white/1">
        <!-- <div class="absolute inset-0 rounded bg-linear-to-br from-neon-purple/5 via-transparent to-neon-pink/5 pointer-events-none"></div> -->

        <form onsubmit={handleSubmit} class="space-y-8 relative z-10">
          <div class="group/field relative">
            <label
              for="name"
              class="text-[0.65rem] tracking-[0.35em] text-white/80  uppercase block mb-3 group-focus-within/field:text-neon-cyan transition-colors duration-300"
              >Name *</label
            >
            <input
              id="name"
              type="text"
              bind:value={name}
              placeholder="How should we call you?"
              required
              class="form-input rounded text-white/90 placeholder:text-white/20"
            />
          </div>

          <div class="group/field relative">
            <label
              for="email"
              class="text-[0.65rem] tracking-[0.35em] text-white/80 uppercase block mb-3 group-focus-within/field:text-neon-cyan transition-colors duration-300"
              >Email (if you want your qr code sent)</label
            >
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="your@email.com"
              class="form-input rounded text-white/90 placeholder:text-white/20"
            />
          </div>

          <div class="group/field relative">
            <label
              for="message"
              class="text-[0.65rem] tracking-[0.35em] text-white/80 0 uppercase block mb-3 group-focus-within/field:text-neon-cyan transition-colors duration-300"
              >Message (optional)</label
            >
            <textarea
              id="message"
              bind:value={message}
              placeholder="Something we should know about..."
              rows="3"
              class="form-input rounded text-white/90 placeholder:text-white/20 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            class="btn-glow btn-glow-base w-full mt-4 py-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none"
            disabled={loading || !isFormValid}
          >
            {loading ? "Submitting..." : "Get My QR Ticket ✦"}
          </button>
        </form>
        {#if error}
          <div
            class="border border-red-500/20 bg-red-500/60 text-red-300 px-5 py-3.5 mt-8 text-sm rounded backdrop-blur"
          >
            {error}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
