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
  let isFormValid = $derived(name.trim().length > 0 && isValidEmail);

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
        error =
          "Oh no, da kommt schon jemand mit dieser Info! Meld dich bei uns, wir wollen dich ja nicht missen.";
      } else {
        error = "Oh je. Das hat nicht geklappt. Versuche es nochmal bitte.";
      }
      return;
    }

    goto(`/confirmation?id=${data.id}`);
  }
</script>

<GlitterBackground />

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
        <p class="text-xs tracking-[0.4em] text-white/40 uppercase mb-6">
          Registration
        </p>
        <h1 class="text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.85] tracking-[-0.04em] neon-text">
          Get on<br />the list
        </h1>
        <p class="text-white/50 text-sm md:text-base max-w-xs leading-relaxed mt-6">
          Claim your spot on the dance floor. Your QR ticket will be generated instantly.
        </p>
      </div>

      <!-- Right: form -->
      <div>
        {#if error}
          <div class="border border-red-500/30 text-red-400 px-5 py-3.5 mb-8 text-sm">
            {error}
          </div>
        {/if}

        <form onsubmit={handleSubmit} class="space-y-6">
          <div>
            <label for="name" class="text-xs tracking-[0.3em] text-white/40 uppercase block mb-2">Name *</label>
            <input
              id="name"
              type="text"
              bind:value={name}
              placeholder="Wie sollen wir dich nennen?"
              required
              class="w-full py-3 px-0 text-white text-lg bg-transparent border-0 border-b border-white/10 focus:border-neon-pink focus:shadow-none outline-none transition-colors"
            />
          </div>

          <div>
            <label for="email" class="text-xs tracking-[0.3em] text-white/40 uppercase block mb-2">Email *</label>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="deine@email.com"
              required
              class="w-full py-3 px-0 text-white text-lg bg-transparent border-0 border-b border-white/10 focus:border-neon-pink focus:shadow-none outline-none transition-colors"
            />
          </div>

          <div>
            <label for="message" class="text-xs tracking-[0.3em] text-white/40 uppercase block mb-2">Nachricht (optional)</label>
            <textarea
              id="message"
              bind:value={message}
              placeholder="Noch etwas, dass wir wissen sollten..."
              rows="3"
              class="w-full py-3 px-0 text-white bg-transparent border-0 border-b border-white/10 focus:border-neon-pink focus:shadow-none outline-none transition-colors resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            class="btn-glow btn-glow-base w-full mt-4 py-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={loading || !isFormValid}
          >
            {loading ? "Submitting..." : "Get My QR Ticket ✦"}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
