<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import { untrack } from "svelte";
  import type { Section, SectionMeta, SectionType } from "$lib/server/email-sections";
  import SectionEditor from "./SectionEditor.svelte";

  type Props = {
    sections: Section[];
    sectionMeta: SectionMeta[];
    dndType: string;
    onchange: (next: Section[]) => void;
  };

  let { sections, sectionMeta, dndType, onchange }: Props = $props();

  // Sections start collapsed; clicking a section header opens its editor.
  // Newly-added sections (via the palette) auto-expand so the user can edit
  // them immediately without an extra click.
  let expandedIds = $state<Set<string>>(new Set());
  let seenIds = new Set<string>(untrack(() => sections.map((s) => s.id)));

  $effect(() => {
    const next = new Set(expandedIds);
    let changed = false;
    for (const s of sections) {
      if (!seenIds.has(s.id)) {
        next.add(s.id);
        seenIds.add(s.id);
        changed = true;
      }
    }
    if (changed) expandedIds = next;
  });

  let metaByType = $derived(
    Object.fromEntries(sectionMeta.map((m) => [m.type, m])) as Record<
      SectionType,
      SectionMeta
    >,
  );

  function makeFreshSection(type: SectionType): Section {
    const meta = metaByType[type];
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id,
      type,
      // Deep clone defaultContent so editing one section doesn't bleed into others
      content: structuredClone(meta?.defaultContent ?? {}),
    };
  }

  function normalizeIncoming(items: unknown[]): Section[] {
    const out: Section[] = [];
    for (const raw of items) {
      const item = raw as Section & { _palette?: boolean; type: SectionType };
      if (item._palette) {
        out.push(makeFreshSection(item.type));
      } else {
        out.push(item);
      }
    }
    return out;
  }

  // During `consider` we MUST keep the dragged item's id stable, otherwise
  // svelte-dnd-action loses track of the shadow and inserts duplicates on
  // every mousemove. So we accept items as-is here. On `finalize` (the actual
  // drop) we swap any palette markers for fresh Section instances.
  function handleConsider(e: CustomEvent) {
    onchange(e.detail.items as Section[]);
  }

  function handleFinalize(e: CustomEvent) {
    onchange(normalizeIncoming(e.detail.items));
  }

  function removeSection(id: string) {
    onchange(sections.filter((s) => s.id !== id));
    if (expandedIds.has(id)) {
      const next = new Set(expandedIds);
      next.delete(id);
      expandedIds = next;
    }
    seenIds.delete(id);
  }

  function toggleExpand(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedIds = next;
  }

  function isExpanded(id: string): boolean {
    return expandedIds.has(id);
  }

  function updateSection(updated: Section) {
    onchange(sections.map((s) => (s.id === updated.id ? updated : s)));
  }
</script>

<div
  class="space-y-3 min-h-32 p-3 rounded-2xl border border-dashed border-white/10 bg-white/2"
  use:dndzone={{
    items: sections,
    type: dndType,
    flipDurationMs: 150,
    dropTargetStyle: {
      outline: "2px dashed rgba(255,0,255,0.6)",
      outlineOffset: "-2px",
      borderRadius: "16px",
    },
  }}
  onconsider={handleConsider}
  onfinalize={handleFinalize}
>
  {#each sections as section (section.id)}
    {@const meta = metaByType[section.type]}
    <div
      class="rounded-xl border border-white/10 bg-white/3 overflow-hidden"
    >
      <!-- Row header — collapse toggle on the title, drag handle right -->
      <div class="flex items-center gap-3 p-3">
        <button
          type="button"
          onclick={() => toggleExpand(section.id)}
          class="flex-1 text-left cursor-pointer flex items-center gap-2"
          aria-expanded={isExpanded(section.id)}
        >
          <span
            class="text-white/40 text-xs transition-transform inline-block w-3 {isExpanded(
              section.id,
            )
              ? 'rotate-90'
              : ''}"
            aria-hidden="true">▶</span
          >
          <span>
            <span class="block text-sm font-bold text-white tracking-tight">
              {meta?.label ?? section.type}
            </span>
            <span class="block text-[11px] text-white/40 mt-0.5 leading-snug">
              {meta?.paletteHint ?? ""}
            </span>
          </span>
        </button>
        <button
          type="button"
          onclick={() => removeSection(section.id)}
          class="text-white/30 hover:text-red-400 px-2 py-1 rounded transition-colors cursor-pointer"
          aria-label="Remove section"
        >×</button>
        <div
          class="text-white/25 cursor-grab select-none px-2 py-1"
          aria-label="Drag handle"
        >⋮⋮</div>
      </div>

      {#if isExpanded(section.id) && meta}
        <div class="px-3 pb-4 pt-1 border-t border-white/5 bg-black/20">
          <SectionEditor
            {section}
            {meta}
            onchange={updateSection}
          />
        </div>
      {/if}
    </div>
  {/each}

  {#if sections.length === 0}
    <p class="text-center text-white/30 text-sm py-6">
      Drag a section from the palette to start composing this email.
    </p>
  {/if}
</div>
