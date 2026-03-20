<script lang="ts">
  import { goto } from "$app/navigation";
  import { supabase } from "$lib/supabase";

  let name = $state("");
  let email = $state("");
  let phone = $state("");
  let plusOne = $state(false);
  let plusOneName = $state("");
  let dietary = $state("");
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
        phone: phone || null,
        message: message || null,
      })
      .select()
      .single();

    if (supaError) {
      loading = false;
      if (supaError.code === "23505") {
        error =
          "Oh no, das kommt schon jemand mit dieser email! Meld dich bei uns, wir wollen dich ja nicht missen.";
      } else {
        error = "Oh je. Das hat nicht geklappt. Versuche es nochmal bitte.";
      }
      return;
    }

    goto(`/confirmation?id=${data.id}`);
  }
</script>

<div class="min-h-screen flex flex-col items-center px-5 pt-10 pb-20">
  <a
    href="/"
    class="self-start max-w-150 w-full mx-auto mb-6 text-sm text-text-muted transition-colors duration-300 hover:text-neon-cyan"
  >
    Back to Home
  </a>

  <div class="card max-w-150 w-full rounded-2xl p-10">
    <h1 class="neon-text text-5xl mb-2">Get on the list</h1>
    <p class="text-text-muted mb-10 text-lg">
      Claim your spot on the dance floor
    </p>

    {#if error}
      <div
        class="bg-red-500/15 border border-red-500/40 text-red-400 px-5 py-3.5 rounded-xl mb-6 text-[0.95rem]"
      >
        {error}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="text-left">
      <div class="mb-6">
        <!-- <label for="name" class="form-label">Your Name *</label> -->
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="Wie sollen wir dich nennen?"
          required
          class="form-input"
        />
      </div>

      <div class="mb-6">
        <!-- <label for="email" class="form-label">Email *</label> -->
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="deine@email.com"
          required
          class="form-input"
        />
      </div>

      <!--<div class="mb-6">
				<label for="phone" class="form-label">Phone (optional)</label>
				<input
					id="phone"
					type="tel"
					bind:value={phone}
					placeholder="+49..."
					class="form-input"
				/>
			</div>

			<div class="mb-6 flex items-center">
				<label class="flex items-center gap-3 cursor-pointer text-base normal-case tracking-normal text-white mb-0">
					<input type="checkbox" bind:checked={plusOne} class="w-5 h-5 accent-neon-pink" />
					Bringing a +1?
				</label>
			</div>

			{#if plusOne}
				<div class="mb-6 animate-[slide-in_0.3s_ease]">
					<label for="plusOneName" class="form-label">+1 Name</label>
					<input
						id="plusOneName"
						type="text"
						bind:value={plusOneName}
						placeholder="Your +1's name"
						class="form-input"
					/>
				</div>
			{/if}

			<div class="mb-6">
				<label for="dietary" class="form-label">Dietary Requirements</label>
				<select id="dietary" bind:value={dietary} class="form-input">
					<option value="">None</option>
					<option value="vegetarian">Vegetarian</option>
					<option value="vegan">Vegan</option>
					<option value="gluten-free">Gluten Free</option>
					<option value="other">Other (mention below)</option>
				</select>
			</div>
-->
      <div class="mb-6">
        <!-- <label for="message" class="form-label">Message (optional)</label> -->
        <textarea
          id="message"
          bind:value={message}
          placeholder="Noch etwas, dass wir wissen sollten..."
          rows="3"
          class="w-full py-3.5 px-5 text-base rounded-xl resize-y"
        ></textarea>
      </div>

      <button
        type="submit"
        class="btn-glow btn-glow-base w-full mt-4 py-4.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading || !isFormValid}
      >
        {loading ? "Submitting..." : "Get My QR Ticket"}
      </button>
    </form>
  </div>
</div>
