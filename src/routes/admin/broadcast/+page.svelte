<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount, onDestroy } from "svelte";

  let { data, form } = $props();

  let now = $state(new Date());
  let intervalId: ReturnType<typeof setInterval> | null = null;

  let testing = $state(false);
  let sending = $state(false);
  let armed = $state(false);
  let armTimeout: ReturnType<typeof setTimeout> | null = null;

  let liveCountdown = $derived.by(() => {
    const eventMs = new Date(data.eventDateIso).getTime();
    const diffMs = eventMs - now.getTime();
    if (diffMs <= 0) {
      return { passed: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { passed: false, days, hours, minutes, seconds };
  });

  onMount(() => {
    intervalId = setInterval(() => {
      now = new Date();
    }, 1000);
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
    if (armTimeout) clearTimeout(armTimeout);
  });

  function armSendAll() {
    armed = true;
    if (armTimeout) clearTimeout(armTimeout);
    armTimeout = setTimeout(() => {
      armed = false;
    }, 5000);
  }
</script>

<div class="min-h-screen px-6 md:px-12 py-12">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
    >
      <div>
        <p class="text-xs tracking-[0.4em] neon-label uppercase mb-2">
          Broadcast
        </p>
        <h1
          class="text-3xl md:text-4xl font-black uppercase tracking-tight neon-text"
        >
          Email Blast
        </h1>
        <p class="text-white/40 text-sm mt-2">
          {data.recipients.length} guests will receive this email
        </p>
      </div>

      <div class="flex items-center gap-4 justify-center">
        <a
          href="/admin"
          class="text-xs tracking-[0.2em] text-white/30 uppercase hover:text-white/70 transition-colors"
        >
          &larr; Back to admin
        </a>
      </div>
    </div>

    <!-- Live Countdown -->
    <div
      class="mb-10 p-6 backdrop-blur-xl rounded-2xl border border-white/6 bg-white/2"
    >
      <p
        class="text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase mb-4 text-center"
      >
        Doors open in
      </p>
      {#if liveCountdown.passed}
        <p
          class="text-center text-3xl md:text-4xl font-black uppercase tracking-tight neon-text"
        >
          Doors are open
        </p>
      {:else}
        <div class="flex justify-center gap-4 md:gap-8">
          {#each [["Days", liveCountdown.days], ["Hours", liveCountdown.hours], ["Min", liveCountdown.minutes], ["Sec", liveCountdown.seconds]] as [label, value]}
            <div class="text-center">
              <p
                class="text-4xl md:text-5xl font-black tabular-nums neon-text tracking-tight"
              >
                {String(value).padStart(2, "0")}
              </p>
              <p
                class="text-[0.6rem] tracking-[0.3em] text-white/40 uppercase mt-1"
              >
                {label}
              </p>
            </div>
          {/each}
        </div>
      {/if}
      <p class="text-center text-xs text-white/30 mt-4">
        Event: 24.04.2026 &middot; 18:00 &middot; Vienna
      </p>
    </div>

    {#if data.error}
      <div
        class="border border-red-500/20 bg-red-500/5 text-red-400 px-5 py-3.5 mb-8 text-sm rounded-lg"
      >
        {data.error}
      </div>
    {/if}

    <!-- Preview -->
    <div class="mb-10">
      <p
        class="text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase mb-3"
      >
        Preview
      </p>
      <p class="text-white/50 text-sm mb-3">
        Subject: <span class="text-white font-semibold">{data.preview.subject}</span>
      </p>
      <div
        class="rounded-2xl border border-white/10 overflow-hidden bg-bg-dark"
      >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html data.preview.html}
      </div>
    </div>

    <!-- Test Send -->
    <div
      class="mb-8 p-6 backdrop-blur-xl rounded-2xl border border-white/6 bg-white/2"
    >
      <p
        class="text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase mb-4"
      >
        Send test
      </p>

      {#if form?.testSuccess}
        <div
          class="border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-4 py-3 mb-4 text-sm rounded-lg"
        >
          {form.testSuccess}
        </div>
      {/if}
      {#if form?.testError}
        <div
          class="border border-red-500/20 bg-red-500/5 text-red-400 px-4 py-3 mb-4 text-sm rounded-lg"
        >
          {form.testError}
        </div>
      {/if}

      <form
        method="POST"
        action="?/testSend"
        use:enhance={() => {
          testing = true;
          return async ({ update }) => {
            await update();
            testing = false;
          };
        }}
        class="flex flex-col sm:flex-row gap-3"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          autocomplete="email"
          class="form-input rounded-lg text-white/90 placeholder:text-white/20 flex-1"
        />
        <button
          type="submit"
          disabled={testing}
          class="btn-glow btn-glow-base px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {#if testing}
            <span
              class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></span>
          {:else}
            Send test
          {/if}
        </button>
      </form>
    </div>

    <!-- Send All -->
    <div
      class="p-6 backdrop-blur-xl rounded-2xl border border-neon-pink/20 bg-neon-pink/2"
    >
      <p
        class="text-[0.65rem] tracking-[0.3em] text-neon-pink/70 uppercase mb-4"
      >
        Send to all
      </p>

      {#if form?.sendResult}
        <div
          class="border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-4 py-3 mb-4 text-sm rounded-lg"
        >
          Sent {form.sendResult.sent} of {form.sendResult.total}
          {#if form.sendResult.failed > 0}
            &middot; <span class="text-red-400">{form.sendResult.failed} failed</span>
          {/if}
          {#if form.sendResult.errors && form.sendResult.errors.length > 0}
            <ul class="mt-2 text-xs text-red-400/80 list-disc pl-5">
              {#each form.sendResult.errors as err}
                <li>{err}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
      {#if form?.sendError}
        <div
          class="border border-red-500/20 bg-red-500/5 text-red-400 px-4 py-3 mb-4 text-sm rounded-lg"
        >
          {form.sendError}
        </div>
      {/if}

      <p class="text-white/60 text-sm mb-4">
        This will send the email above to
        <strong class="text-white">{data.recipients.length} registered guests</strong>. Click
        once to arm, then click again within 5 seconds to confirm.
      </p>

      <form
        method="POST"
        action="?/sendAll"
        use:enhance={() => {
          sending = true;
          return async ({ update }) => {
            await update();
            sending = false;
            armed = false;
          };
        }}
      >
        {#if !armed}
          <button
            type="button"
            onclick={armSendAll}
            disabled={sending || data.recipients.length === 0}
            class="btn-glow btn-glow-base w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send to all {data.recipients.length} guests
          </button>
        {:else}
          <button
            type="submit"
            disabled={sending}
            class="w-full py-4 text-sm uppercase tracking-[0.2em] font-bold rounded-lg bg-neon-pink text-black hover:bg-neon-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {#if sending}
              <span
                class="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"
              ></span>
              Sending...
            {:else}
              Confirm send to {data.recipients.length} guests
            {/if}
          </button>
        {/if}
      </form>
    </div>
  </div>
</div>
