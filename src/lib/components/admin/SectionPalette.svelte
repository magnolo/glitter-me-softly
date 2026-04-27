<script lang="ts">
  import type { SectionMeta, SectionType } from "$lib/server/email-sections";

  type Props = {
    sectionMeta: SectionMeta[];
    onadd: (type: SectionType) => void;
  };

  let { sectionMeta, onadd }: Props = $props();
</script>

<div class="space-y-2">
  <p class="text-[10px] tracking-[0.25em] text-white/40 uppercase mb-2">
    Click to add to composition
  </p>
  {#each sectionMeta as item (item.type)}
    <button
      type="button"
      onclick={() => onadd(item.type)}
      class="w-full text-left p-3 rounded-xl border border-white/10 bg-white/3 hover:border-neon-pink/40 hover:bg-neon-pink/5 transition-colors cursor-pointer group"
    >
      <p
        class="text-sm font-bold text-white tracking-tight flex items-center justify-between gap-2"
      >
        <span>{item.label}</span>
        <span
          class="text-neon-pink/60 group-hover:text-neon-pink text-lg leading-none"
          aria-hidden="true">+</span
        >
      </p>
      <p class="text-[11px] text-white/50 mt-1 leading-snug">
        {item.paletteHint}
      </p>
    </button>
  {/each}
</div>
