<script lang="ts">
  import { enhance } from "$app/forms";
  import QRCode from "qrcode";
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { RealtimeChannel } from "@supabase/supabase-js";

  let { data, form } = $props();

  let realtimeUpdates: Record<string, any> = $state({});
  let realtimeInserts: any[] = $state([]);
  let realtimeDeletes: Set<string> = $state(new Set());

  let registrations = $derived.by(() => {
    const base = data.registrations
      .filter((r: any) => !realtimeDeletes.has(r.id))
      .map((r: any) => realtimeUpdates[r.id] ?? r);
    const existingIds = new Set(base.map((r: any) => r.id));
    const newOnes = realtimeInserts.filter((r) => !existingIds.has(r.id));
    return [...newOnes, ...base];
  });
  let qrCodes: Record<string, string> = $state({});
  let qrCodesLarge: Record<string, string> = $state({});
  let search = $state("");
  let checkinFilter = $state<"all" | "yes" | "no">("all");
  let modalReg: any = $state(null);
  let togglingIds: Set<string> = $state(new Set());
  let sortBy = $state<"name" | "created_at">("created_at");
  let sortDir = $state<"asc" | "desc">("desc");
  let loggingIn = $state(false);

  let channel: RealtimeChannel | null = null;

  let filtered = $derived(
    registrations
      .filter((r: any) => {
        if (checkinFilter === "yes" && !r.checkedin) return false;
        if (checkinFilter === "no" && r.checkedin) return false;
        const q = search.toLowerCase();
        return (
          r.name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q)
        );
      })
      .toSorted((a: any, b: any) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortBy === "name") {
          return dir * (a.name ?? "").localeCompare(b.name ?? "");
        }
        return dir * ((a.created_at ?? "").localeCompare(b.created_at ?? ""));
      }),
  );

  function toggleSort(col: "name" | "created_at") {
    if (sortBy === col) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortBy = col;
      sortDir = col === "name" ? "asc" : "desc";
    }
  }


  let checkedInCount = $derived(
    registrations.filter((r: any) => r.checkedin).length,
  );

  async function generateQr(reg: any) {
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

  async function toggleCheckin(reg: any) {
    togglingIds.add(reg.id);
    togglingIds = new Set(togglingIds);

    const newValue = !reg.checkedin;

    // Optimistic update
    realtimeUpdates[reg.id] = { ...reg, checkedin: newValue };
    realtimeUpdates = { ...realtimeUpdates };

    const { error } = await supabase
      .from("registrations")
      .update({ checkedin: newValue })
      .eq("id", reg.id);

    if (error) {
      console.error("Failed to toggle checkin:", error);
      // Revert on failure
      realtimeUpdates[reg.id] = { ...reg };
      realtimeUpdates = { ...realtimeUpdates };
    }

    togglingIds.delete(reg.id);
    togglingIds = new Set(togglingIds);
  }

  $effect(() => {
    if (!data.authenticated) return;
    // Generate QR codes for any registrations that don't have one yet
    for (const reg of registrations) {
      if (!qrCodes[reg.id]) {
        generateQr(reg);
      }
    }
  });

  onMount(() => {
    if (!data.authenticated) return;

    // Subscribe to realtime changes
    let realtimeWorking = false;

    channel = supabase
      .channel(`admin-registrations}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "registrations" },
        async (payload) => {
          realtimeWorking = true;
          const row = payload.new as any;
          realtimeInserts = [row, ...realtimeInserts];
          await generateQr(row);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "registrations" },
        (payload) => {
          realtimeWorking = true;
          const row = payload.new as any;
          realtimeUpdates[row.id] = row;
          realtimeUpdates = { ...realtimeUpdates };
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "registrations" },
        (payload) => {
          realtimeWorking = true;
          realtimeDeletes.add((payload.old as any).id);
          realtimeDeletes = new Set(realtimeDeletes);
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });


  });

  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel);
    }
    
  });

  function handlePrint() {
    const prevSortBy = sortBy;
    const prevSortDir = sortDir;
    sortBy = "name";
    sortDir = "asc";
    requestAnimationFrame(() => {
      window.print();
      sortBy = prevSortBy;
      sortDir = prevSortDir;
    });
  }

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

      <form method="POST" action="?/login" use:enhance={() => {
        loggingIn = true;
        return async ({ update }) => {
          await update();
          loggingIn = false;
        };
      }} class="space-y-6">
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
          disabled={loggingIn}
          class="btn-glow btn-glow-base w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if loggingIn}
            <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {:else}
            Login
          {/if}
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
            {registrations.length} guests registered &middot; {checkedInCount} checked in
          </p>
        </div>

        <div class="flex items-center gap-4 justify-center">
          <a
            href="/admin/broadcast"
            class="print:hidden text-xs tracking-[0.2em] text-white/30 uppercase hover:text-white/70 transition-colors"
          >
            Email blast
          </a>
          <button
            type="button"
            onclick={handlePrint}
            class="print:hidden text-xs tracking-[0.2em] text-white/30 uppercase hover:text-white/70 transition-colors cursor-pointer"
          >
            Print
          </button>
          <form method="POST" action="?/logout" use:enhance class="print:hidden flex items-center">
            <button
              type="submit"
              class="text-xs tracking-[0.2em] text-white/30 uppercase hover:text-white/70 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="mb-8 flex flex-col sm:flex-row gap-4 print:hidden">
        <div class="relative max-w-md w-full">
          <input
            type="text"
            bind:value={search}
            placeholder="Search by name, or email..."
            class="form-input rounded-lg text-white/90 placeholder:text-white/20 w-full pr-9"
          />
          {#if search}
            <button
              type="button"
              onclick={() => (search = "")}
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors cursor-pointer text-lg leading-none"
              aria-label="Clear search"
            >&times;</button>
          {/if}
        </div>
        <div class="flex gap-2">
          {#each [["all", "All"], ["yes", "Checked In"], ["no", "Not Checked In"]] as [value, label]}
            <button
              type="button"
              onclick={() => (checkinFilter = value as "all" | "yes" | "no")}
              class="px-4 py-2 text-xs tracking-[0.15em] uppercase rounded-lg border transition-colors cursor-pointer {checkinFilter === value
                ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10'
                : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'}"
            >
              {label}
            </button>
          {/each}
        </div>
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
                class="w-24 px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal print:hidden"
                >QR</th
              >
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal"
              >
                <button type="button" onclick={() => toggleSort("name")} class="cursor-pointer hover:text-neon-cyan/80 transition-colors print:pointer-events-none uppercase">
                  Name {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal hidden md:table-cell print:hidden"
                >Email</th
              >
              <th
                class="px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal hidden lg:table-cell"
                >Message</th
              >
              <th
                class="w-36 px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal hidden sm:table-cell print:hidden"
                >Checked In</th
              >
              <th
                class="w-42 px-5 py-4 text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase font-normal hidden sm:table-cell print:hidden"
              >
                <button type="button" onclick={() => toggleSort("created_at")} class="cursor-pointer uppercase hover:text-neon-cyan/80 transition-colors print:pointer-events-none">
                  Registered {sortBy === "created_at" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as reg (reg.id)}
              <tr
                class="border-b border-white/5 transition-colors {reg.checkedin
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/12 border-emerald-500/10'
                  : 'hover:bg-white/3'}"
              >
                <td class="px-5 py-3 print:hidden">
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
                <td class="px-5 py-3 print:text-base print:font-bold">
                  <span class="text-white font-semibold">{reg.name}</span>
                  <span class="block md:hidden print:hidden text-white/40 text-xs mt-0.5"
                    >{reg.email || "—"}</span
                  >
                </td>
                <td class="px-5 py-3 text-white/60 text-sm hidden md:table-cell print:hidden"
                  >{reg.email || "—"}</td
                >
                <td
                  class="px-5 py-3 text-white/40 text-sm max-w-[200px]  hidden lg:table-cell"
                  >{reg.message || "—"}</td
                >
                <td class="px-5 py-3 hidden sm:table-cell print:hidden">
                  <button
                    type="button"
                    aria-label={"Checkin for " + reg.name}
                    onclick={() => toggleCheckin(reg)}
                    disabled={togglingIds.has(reg.id)}
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 {reg.checkedin
                      ? 'bg-emerald-500'
                      : 'bg-white/10'}"
                    role="switch"
                    aria-checked={reg.checkedin}
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out {reg.checkedin
                        ? 'translate-x-5'
                        : 'translate-x-0'}"
                    ></span>
                  </button>
                </td>
                <td
                  class="print:hidden px-5 py-3 text-white/40 text-xs hidden sm:table-cell"
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

  <!-- QR Modal (hidden in print) -->
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

<style>
  @media print {
    /* Page setup */
    @page {
      size: A4 portrait;
      margin: 10mm;
    }

    /* Reset dark background for printing */
    :global(body) {
      background: white !important;
      background-image: none !important;
      color: black !important;
    }

    :global(.fixed),
    :global(canvas) {
      display: none !important;
    }

    /* Remove page padding */
    :global(.min-h-screen) {
      min-height: auto !important;
      padding: 0 !important;
    }

    /* Show responsive-hidden columns, but not print:hidden ones */
    :global(.hidden.sm\:table-cell:not(.print\:hidden)),
    :global(.hidden.lg\:table-cell) {
      display: table-cell !important;
    }

    /* Hide print:hidden elements (QR, Email, Checked In columns) */
    :global(.print\:hidden) {
      display: none !important;
    }

    /* Table styling for print — compact */
    :global(table) {
      border-collapse: collapse;
      width: 100%;
      font-size: 11px;
      table-layout: auto;
    }

    :global(th),
    :global(td) {
      border: 1px solid #ccc !important;
      padding: 4px 8px !important;
      color: black !important;
      background: transparent !important;
    }

    :global(thead tr) {
      background: #f0f0f0 !important;
    }

    /* Name column — bigger and bold */
    :global(.print\:text-base) {
      font-size: 14px !important;
      font-weight: 700 !important;
    }

    /* Green highlight for checked-in rows */
    :global(tr[class*="bg-emerald"]) {
      background: #d1fae5 !important;
    }

    :global(tr[class*="bg-emerald"] td) {
      background: #d1fae5 !important;
    }

    /* Remove decorative borders and blur */
    :global(.backdrop-blur-xl),
    :global(.backdrop-blur) {
      backdrop-filter: none !important;
    }

    :global(.rounded-2xl) {
      border-color: #ccc !important;
      border-radius: 0 !important;
    }

    :global(.overflow-x-auto) {
      overflow: visible !important;
    }

    /* Make text readable */
    :global(.neon-text),
    :global(.neon-label) {
      background: none !important;
      -webkit-background-clip: unset !important;
      -webkit-text-fill-color: black !important;
      text-shadow: none !important;
      color: black !important;
    }

    :global(h1) {
      color: black !important;
      font-size: 16px !important;
    }

    :global(p),
    :global(span) {
      color: black !important;
    }

    :global(.text-white\/40),
    :global(.text-white\/60) {
      color: #444 !important;
    }
  }
</style>
