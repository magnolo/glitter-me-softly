<script lang="ts">
  import { enhance } from "$app/forms";
  import { onDestroy, untrack } from "svelte";
  import SectionPalette from "$lib/components/admin/SectionPalette.svelte";
  import TemplateBuilder from "$lib/components/admin/TemplateBuilder.svelte";
  import type { Section, SectionType, TemplateRow } from "$lib/server/email-sections";

  let { data, form } = $props();

  const DND_TYPE = "gms-section";

  function freshSection(type: SectionType): Section {
    const meta = data.sectionMeta.find((m) => m.type === type);
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id,
      type,
      content: structuredClone(meta?.defaultContent ?? {}),
    };
  }

  function appendSection(type: SectionType) {
    if (!active) return;
    updateSections([...active.sections, freshSection(type)]);
  }

  // Local working copies — seeded once from the server data, then mutated on
  // every edit. untrack() so the linter doesn't flag the prop access in the
  // $state initializer (we don't want this to reactively reset).
  let working = $state<Record<string, TemplateRow>>(
    untrack(() =>
      Object.fromEntries(data.templates.map((t) => [t.slug, structuredClone(t)])),
    ),
  );

  let activeSlug = $state<string>(untrack(() => data.templates[0]?.slug ?? ""));
  let active = $derived(working[activeSlug]);

  let preview = $state<{ subject: string; html: string } | null>(
    untrack(() => (activeSlug ? data.previews[activeSlug] : null)),
  );
  let previewing = $state(false);
  let previewTimer: ReturnType<typeof setTimeout> | null = null;

  let saving = $state(false);
  let creating = $state(false);
  let resetting = $state(false);
  let deleting = $state(false);

  let showCreate = $state(false);
  let newName = $state("");

  function refreshPreview() {
    if (!active) return;
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(async () => {
      previewing = true;
      try {
        const res = await fetch("/admin/templates/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(active),
        });
        if (res.ok) {
          preview = await res.json();
        }
      } finally {
        previewing = false;
      }
    }, 250);
  }

  // Snap initial preview when switching templates
  $effect(() => {
    if (active) {
      preview = data.previews[activeSlug] ?? null;
      refreshPreview();
    }
  });

  onDestroy(() => {
    if (previewTimer) clearTimeout(previewTimer);
  });

  function updateSections(next: Section[]) {
    if (!active) return;
    working[activeSlug] = { ...active, sections: next };
    refreshPreview();
  }

  function updateField(field: "name" | "description" | "subject", value: string) {
    if (!active) return;
    working[activeSlug] = { ...active, [field]: value };
    refreshPreview();
  }

  function isDirty(slug: string): boolean {
    const original = data.templates.find((t) => t.slug === slug);
    if (!original) return true;
    return JSON.stringify(original) !== JSON.stringify(working[slug]);
  }
</script>

<div class="min-h-screen px-6 md:px-10 py-10">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <p class="text-xs tracking-[0.4em] neon-label uppercase mb-2">Templates</p>
        <h1
          class="text-3xl md:text-4xl font-black uppercase tracking-tight neon-text"
        >
          Email Builder
        </h1>
        <p class="text-white/40 text-sm mt-2">
          Drag sections from the palette, edit copy, save when ready.
        </p>
      </div>
      <div class="flex gap-4 items-center">
        <a
          href="/admin/broadcast"
          class="text-xs tracking-[0.2em] text-white/30 uppercase hover:text-white/70 transition-colors"
        >
          Broadcast →
        </a>
        <a
          href="/admin"
          class="text-xs tracking-[0.2em] text-white/30 uppercase hover:text-white/70 transition-colors"
        >
          ← Back to admin
        </a>
      </div>
    </div>

    <!-- Template chips + create -->
    <div class="mb-6 flex flex-wrap items-center gap-2">
      {#each data.templates as t (t.slug)}
        {@const dirty = isDirty(t.slug)}
        <button
          type="button"
          onclick={() => (activeSlug = t.slug)}
          class="px-4 py-2 text-xs tracking-[0.15em] uppercase rounded-lg border transition-colors cursor-pointer flex items-center gap-2 {activeSlug ===
          t.slug
            ? 'border-neon-pink/60 bg-neon-pink/10 text-white'
            : 'border-white/10 bg-white/2 hover:border-white/30 text-white/60'}"
        >
          {working[t.slug]?.name ?? t.name}
          {#if dirty}<span
              class="w-1.5 h-1.5 rounded-full bg-neon-pink"
              aria-label="Unsaved changes"
            ></span>{/if}
        </button>
      {/each}
      <button
        type="button"
        onclick={() => (showCreate = !showCreate)}
        class="px-4 py-2 text-xs tracking-[0.15em] uppercase rounded-lg border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 cursor-pointer transition-colors"
      >
        + New
      </button>
    </div>

    {#if showCreate}
      <form
        method="POST"
        action="?/create"
        use:enhance={() => {
          creating = true;
          return async ({ update }) => {
            await update();
            creating = false;
          };
        }}
        class="mb-6 p-4 rounded-2xl border border-white/10 bg-white/2 flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          name="name"
          bind:value={newName}
          required
          placeholder="New template name (e.g. Last call)"
          class="form-input rounded-lg text-white/90 placeholder:text-white/20 flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          class="btn-glow btn-glow-base px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {creating ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onclick={() => {
            showCreate = false;
            newName = "";
          }}
          class="text-xs text-white/40 hover:text-white/70 px-4"
        >
          Cancel
        </button>
      </form>
    {/if}

    <!-- Status messages -->
    {#if form?.saveSuccess}
      <div
        class="border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-4 py-3 mb-4 text-sm rounded-lg"
      >
        {form.saveSuccess}
      </div>
    {/if}
    {#if form?.saveError}
      <div
        class="border border-red-500/20 bg-red-500/5 text-red-400 px-4 py-3 mb-4 text-sm rounded-lg"
      >
        {form.saveError}
      </div>
    {/if}
    {#if form?.createSuccess}
      <div
        class="border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-4 py-3 mb-4 text-sm rounded-lg"
      >
        {form.createSuccess} — refresh to start editing.
      </div>
    {/if}
    {#if form?.createError}
      <div
        class="border border-red-500/20 bg-red-500/5 text-red-400 px-4 py-3 mb-4 text-sm rounded-lg"
      >
        {form.createError}
      </div>
    {/if}
    {#if form?.resetSuccess}
      <div
        class="border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-4 py-3 mb-4 text-sm rounded-lg"
      >
        {form.resetSuccess} — refresh to see defaults.
      </div>
    {/if}
    {#if form?.deleteSuccess}
      <div
        class="border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-4 py-3 mb-4 text-sm rounded-lg"
      >
        {form.deleteSuccess} — refresh to update.
      </div>
    {/if}

    {#if active}
      <!-- 3-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)_minmax(0,1fr)] gap-4">
        <!-- Palette -->
        <aside>
          <p
            class="text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase mb-3"
          >
            Palette
          </p>
          <SectionPalette
            sectionMeta={data.sectionMeta}
            onadd={appendSection}
          />
        </aside>

        <!-- Builder -->
        <section>
          <div class="mb-4 space-y-3">
            <div>
              <label
                for="tpl-name"
                class="text-[0.65rem] tracking-[0.25em] text-neon-cyan/60 uppercase block mb-2"
                >Name</label
              >
              <input
                id="tpl-name"
                type="text"
                value={active.name}
                oninput={(e) => updateField("name", e.currentTarget.value)}
                class="form-input rounded-lg text-white/90 w-full text-sm"
              />
            </div>
            <div>
              <label
                for="tpl-desc"
                class="text-[0.65rem] tracking-[0.25em] text-neon-cyan/60 uppercase block mb-2"
                >Description</label
              >
              <input
                id="tpl-desc"
                type="text"
                value={active.description}
                oninput={(e) => updateField("description", e.currentTarget.value)}
                class="form-input rounded-lg text-white/90 w-full text-sm"
              />
            </div>
            <div>
              <label
                for="tpl-subject"
                class="text-[0.65rem] tracking-[0.25em] text-neon-cyan/60 uppercase block mb-2"
                >Subject</label
              >
              <input
                id="tpl-subject"
                type="text"
                value={active.subject}
                oninput={(e) => updateField("subject", e.currentTarget.value)}
                class="form-input rounded-lg text-white/90 w-full text-sm"
              />
              <p class="text-[10px] text-white/35 mt-1.5">
                Placeholders: &#123;&#123;name&#125;&#125;, &#123;&#123;countdown&#125;&#125;,
                &#123;&#123;event_date&#125;&#125;, &#123;&#123;event_time&#125;&#125;,
                &#123;&#123;venue&#125;&#125;
              </p>
            </div>
          </div>

          <p
            class="text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase mb-3"
          >
            Composition
          </p>
          <TemplateBuilder
            sections={active.sections}
            sectionMeta={data.sectionMeta}
            dndType={DND_TYPE}
            onchange={updateSections}
          />

          <!-- Action row -->
          <div class="mt-6 flex flex-wrap gap-3 items-center">
            <form
              method="POST"
              action="?/save"
              use:enhance={() => {
                saving = true;
                return async ({ update }) => {
                  await update();
                  saving = false;
                };
              }}
            >
              <input type="hidden" name="slug" value={activeSlug} />
              <input type="hidden" name="name" value={active.name} />
              <input type="hidden" name="description" value={active.description} />
              <input type="hidden" name="subject" value={active.subject} />
              <input
                type="hidden"
                name="sections"
                value={JSON.stringify(active.sections)}
              />
              <button
                type="submit"
                disabled={saving}
                class="btn-glow btn-glow-base px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </form>

            <form
              method="POST"
              action="?/reset"
              use:enhance={() => {
                resetting = true;
                return async ({ update }) => {
                  await update();
                  resetting = false;
                };
              }}
              onsubmit={(e) => {
                if (
                  !confirm(
                    `Reset "${active.name}" to its built-in default? This will overwrite your edits.`,
                  )
                )
                  e.preventDefault();
              }}
            >
              <input type="hidden" name="slug" value={activeSlug} />
              <button
                type="submit"
                disabled={resetting}
                class="text-xs tracking-[0.2em] uppercase text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-4 py-3 cursor-pointer disabled:opacity-50"
              >
                {resetting ? "Resetting…" : "Reset to default"}
              </button>
            </form>

            <form
              method="POST"
              action="?/delete"
              use:enhance={() => {
                deleting = true;
                return async ({ update }) => {
                  await update();
                  deleting = false;
                };
              }}
              onsubmit={(e) => {
                if (
                  !confirm(
                    `Delete "${active.name}"? This removes the row from the database.`,
                  )
                )
                  e.preventDefault();
              }}
              class="ml-auto"
            >
              <input type="hidden" name="slug" value={activeSlug} />
              <button
                type="submit"
                disabled={deleting}
                class="text-xs tracking-[0.2em] uppercase text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/50 rounded-lg px-4 py-3 cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </form>
          </div>
        </section>

        <!-- Preview -->
        <aside>
          <p
            class="text-[0.65rem] tracking-[0.3em] text-neon-cyan/50 uppercase mb-3 flex items-center gap-2"
          >
            Preview
            {#if previewing}
              <span class="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
            {/if}
          </p>
          {#if preview}
            <p class="text-white/50 text-xs mb-2 truncate">
              Subject: <span class="text-white">{preview.subject}</span>
            </p>
            <div
              class="rounded-2xl border border-white/10 overflow-hidden bg-bg-dark"
            >
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html preview.html}
            </div>
          {:else}
            <p class="text-white/30 text-sm">No preview available.</p>
          {/if}
        </aside>
      </div>
    {:else}
      <p class="text-white/40 text-sm">No template selected.</p>
    {/if}
  </div>
</div>
