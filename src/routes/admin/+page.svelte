<script lang="ts">
  import { enhance } from "$app/forms";
  import QRCode from "qrcode";
  import { onMount } from "svelte";

  let { data, form } = $props();

  let qrCodes: Record<string, string> = $state({});
  let qrCodesLarge: Record<string, string> = $state({});
  let search = $state("");
  let modalReg: any = $state(null);

  let filtered = $derived(
    data.registrations.filter((r: any) => {
      const q = search.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
      );
    }),
  );

  onMount(async () => {
    if (!data.authenticated) return;
    for (const reg of data.registrations) {
      const payload = JSON.stringify({
        event: "Glitter Me Softly",
        id: reg.id,
        name: reg.name,
        email: reg.email,
      });
      const opts = { margin: 1, color: { dark: "#fff", light: "#0a0012" }, errorCorrectionLevel: "M" as const };
      qrCodes[reg.id] = await QRCode.toDataURL(payload, { ...opts, width: 120 });
      qrCodesLarge[reg.id] = await QRCode.toDataURL(payload, { ...opts, width: 400 });
    }
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("de-AT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

{#if !data.authenticated}
  <!-- Login -->
  <div class="min-h-screen flex items-center justify-center px-6">
    <div
      class="w-full max-w-sm p-8 backdrop-blur-xl rounded-2xl border border-white/6 bg-white/2"
    >
      <div
        class="absolute inset-0 rounded-2xl bg-linear-to-br from-neon-purple/5 via-transparent to-neon-pink/5 pointer-events-none"
      ></div>

      <h1
        class="text-2xl font-black uppercase tracking-tight neon-text text-center mb-8"
      >
        Admin
      </h1>

      {#if form?.loginError}
        <div
          class="border border-red-500/20 bg-red-500/5 text-red-400 px-4 py-3 mb-6 text-sm rounded-lg"
        >
          {form.loginError}
        </div>
      {/if}

      <form method="POST" action="?/login" use:enhance class="space-y-6">
        <div>
          <label
            for="username"
            class="text-[0.65rem] tracking-[0.35em] text-neon-cyan/50 uppercase block mb-3"
            >Username</label
          >
          <input
            id="username"
            name="username"
            type="text"
            required
            autocomplete="username"
            class="form-input rounded-lg text-white/90 placeholder:text-white/20"
            placeholder="admin"
          />
        </div>

        <div>
          <label
            for="password"
            class="text-[0.65rem] tracking-[0.35em] text-neon-cyan/50 uppercase block mb-3"
            >Password</label
          >
          <input
            id="password"
            name="password"
            type="password"
            required
            autocomplete="current-password"
            class="form-input rounded-lg text-white/90 placeholder:text-white/20"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          class="btn-glow btn-glow-base w-full py-4 text-sm"
        >
          Login
        </button>
      </form>
    </div>
  </div>
{:else}
  <!-- Admin Dashboard -->
  <div class="min-h-screen px-6 md:px-12 py-12">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <p class="text-xs tracking-[0.4em] neon-label uppercase mb-2">
            Dashboard
          </p>
          <h1
            class="text-3xl md:text-4xl font-black uppercase tracking-tight neon-text"
          >
            Registrations
          </h1>
          <p class="text-white/40 text-sm mt-2">
            {data.registrations.length} guests registered
          </p>
        </div>

        <form method="POST" action="?/logout" use:enhance>
          <button
            type="submit"
            class="text-xs tracking-[0.2em] text-white/30 uppercase hover:text-white/70 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </form>
      </div>

      <!-- Search -->
      <div class="mb-8">
        <input
          type="text"
          bind:value={search}
          placeholder="Search by name, email, or ID..."
          class="form-input rounded-lg text-white/90 placeholder:text-white/20 max-w-md w-full"
        />
      </div>

      {#if data.error}
        <div
          class="border border-red-500/20 bg-red-500/5 text-red-400 px-5 py-3.5 mb-8 text-sm rounded-lg"
        >
          {data.error}
        </div>
      {/if}

      <!-- Table -->
      <div
        class="overflow-x-auto rounded-2xl border border-white/6 bg-white/2 backdrop-blur-xl"
      >
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-white/10">
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal"
                >QR</th
              >
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal"
                >Name</th
              >
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal hidden md:table-cell"
                >Email</th
              >
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal hidden lg:table-cell"
                >Message</th
              >
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal hidden sm:table-cell"
                >Checked In</th
              >
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal hidden sm:table-cell"
                >Registered</th
              >
            </tr>
          </thead>
          <tbody>
            {#each filtered as reg (reg.id)}
              <tr
                class="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td class="px-5 py-3">
                  {#if qrCodes[reg.id]}
                    <button
                      type="button"
                      onclick={() => (modalReg = reg)}
                      class="cursor-pointer hover:scale-110 transition-transform"
                    >
                      <img
                        src={qrCodes[reg.id]}
                        alt="QR for {reg.name}"
                        class="w-14 h-14 rounded"
                      />
                    </button>
                  {:else}
                    <div
                      class="w-14 h-14 rounded bg-white/5 animate-pulse"
                    ></div>
                  {/if}
                </td>
                <td class="px-5 py-3">
                  <span class="text-white font-semibold">{reg.name}</span>
                  <span class="block md:hidden text-white/40 text-xs mt-0.5"
                    >{reg.email || "—"}</span
                  >
                </td>
                <td class="px-5 py-3 text-white/60 text-sm hidden md:table-cell"
                  >{reg.email || "—"}</td
                >
                <td
                  class="px-5 py-3 text-white/40 text-sm max-w-[200px] truncate hidden lg:table-cell"
                  >{reg.message || "—"}</td
                >
                <td class="px-5 py-3 hidden sm:table-cell">
                  {#if reg.checkedin}
                    <span
                      class="text-xs tracking-wider uppercase text-emerald-400"
                      >Yes</span
                    >
                  {:else}
                    <span class="text-xs tracking-wider uppercase text-white/20"
                      >No</span
                    >
                  {/if}
                </td>
                <td
                  class="px-5 py-3 text-white/40 text-xs hidden sm:table-cell"
                >
                  {formatDate(reg.created_at)}
                </td>
              </tr>
            {/each}

            {#if filtered.length === 0}
              <tr>
                <td colspan="6" class="px-5 py-12 text-center text-white/30">
                  {search ? "No results found" : "No registrations yet"}
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- QR Modal -->
  {#if modalReg}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default"
        onclick={() => (modalReg = null)}
        aria-label="Close modal"
      ></button>
      <div
        class="relative rounded-2xl border border-white/10 bg-bg-dark p-8 flex flex-col items-center gap-6 max-w-sm w-full"
      >
        <button
          type="button"
          onclick={() => (modalReg = null)}
          class="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors text-xl cursor-pointer"
          aria-label="Close">&times;</button
        >
        <p
          class="text-xs tracking-[0.35em] text-neon-cyan/50 uppercase"
        >
          QR Code
        </p>
        <h2 class="text-xl font-bold text-white text-center">
          {modalReg.name}
        </h2>
        {#if qrCodesLarge[modalReg.id]}
          <img
            src={qrCodesLarge[modalReg.id]}
            alt="QR for {modalReg.name}"
            class="w-72 h-72 rounded-lg"
          />
        {/if}
        {#if modalReg.email}
          <p class="text-white/40 text-sm">{modalReg.email}</p>
        {/if}
      </div>
    </div>
  {/if}
{/if}
