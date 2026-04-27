<script lang="ts">
  import type { EditorField, Section, SectionMeta } from "$lib/server/email-sections";

  type Props = {
    section: Section;
    meta: SectionMeta;
    onchange: (next: Section) => void;
  };

  let { section, meta, onchange }: Props = $props();

  function update(key: string, value: unknown) {
    onchange({
      ...section,
      content: { ...section.content, [key]: value },
    });
  }

  function asString(v: unknown): string {
    return typeof v === "string" ? v : "";
  }

  function asArray(v: unknown): string[] {
    return Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : "")) : [];
  }

  function placeholderHint(field: EditorField): string {
    if (field.kind === "select") return field.hint ?? "";
    const parts: string[] = [];
    if (field.placeholders && field.placeholders.length > 0) {
      parts.push("Placeholders: " + field.placeholders.join(", "));
    }
    if ("hint" in field && field.hint) parts.push(field.hint);
    return parts.join(" · ");
  }

  function addParagraph(key: string) {
    const current = asArray(section.content[key]);
    update(key, [...current, ""]);
  }

  function removeParagraph(key: string, index: number) {
    const current = asArray(section.content[key]);
    update(
      key,
      current.filter((_, i) => i !== index),
    );
  }

  function setParagraph(key: string, index: number, value: string) {
    const current = asArray(section.content[key]);
    const next = current.slice();
    next[index] = value;
    update(key, next);
  }

  function moveParagraph(key: string, from: number, dir: -1 | 1) {
    const current = asArray(section.content[key]);
    const to = from + dir;
    if (to < 0 || to >= current.length) return;
    const next = current.slice();
    [next[from], next[to]] = [next[to], next[from]];
    update(key, next);
  }
</script>

<div class="space-y-4">
  {#if meta.editorFields.length === 0}
    <p class="text-xs text-white/40 italic">
      No editable content for this section.
    </p>
  {/if}

  {#each meta.editorFields as field (field.key)}
    <div>
      <label
        for="field-{section.id}-{field.key}"
        class="block text-[0.65rem] tracking-[0.25em] text-neon-cyan/60 uppercase mb-2"
      >
        {field.label}
      </label>

      {#if field.kind === "text"}
        <input
          id="field-{section.id}-{field.key}"
          type="text"
          value={asString(section.content[field.key])}
          oninput={(e) => update(field.key, e.currentTarget.value)}
          class="form-input rounded-lg text-white/90 placeholder:text-white/20 w-full text-sm"
        />
      {:else if field.kind === "textarea"}
        <textarea
          id="field-{section.id}-{field.key}"
          rows={field.rows ?? 3}
          value={asString(section.content[field.key])}
          oninput={(e) => update(field.key, e.currentTarget.value)}
          class="form-input rounded-lg text-white/90 placeholder:text-white/20 w-full text-sm font-mono"
        ></textarea>
      {:else if field.kind === "select"}
        <select
          id="field-{section.id}-{field.key}"
          value={asString(section.content[field.key])}
          onchange={(e) => update(field.key, e.currentTarget.value)}
          class="form-input rounded-lg text-white/90 w-full text-sm"
        >
          {#each field.options as opt (opt.value)}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      {:else if field.kind === "paragraphs"}
        <div class="space-y-2">
          {#each asArray(section.content[field.key]) as para, i (i)}
            <div class="flex gap-2">
              <textarea
                rows={2}
                value={para}
                oninput={(e) =>
                  setParagraph(field.key, i, e.currentTarget.value)}
                class="form-input rounded-lg text-white/90 w-full text-sm font-mono"
              ></textarea>
              <div class="flex flex-col gap-1">
                <button
                  type="button"
                  onclick={() => moveParagraph(field.key, i, -1)}
                  disabled={i === 0}
                  class="text-xs text-white/40 hover:text-white px-2 py-1 rounded border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Move up"
                >▲</button>
                <button
                  type="button"
                  onclick={() => moveParagraph(field.key, i, 1)}
                  disabled={i ===
                    asArray(section.content[field.key]).length - 1}
                  class="text-xs text-white/40 hover:text-white px-2 py-1 rounded border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Move down"
                >▼</button>
                <button
                  type="button"
                  onclick={() => removeParagraph(field.key, i)}
                  class="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 rounded border border-red-500/20 hover:border-red-500/50 cursor-pointer"
                  aria-label="Remove paragraph"
                >×</button>
              </div>
            </div>
          {/each}
          <button
            type="button"
            onclick={() => addParagraph(field.key)}
            class="text-xs tracking-[0.15em] uppercase text-neon-cyan/70 hover:text-neon-cyan border border-neon-cyan/30 hover:border-neon-cyan/60 rounded-lg px-3 py-2 cursor-pointer"
          >
            + Add paragraph
          </button>
        </div>
      {/if}

      {#if placeholderHint(field)}
        <p class="text-[10px] text-white/35 mt-1.5">
          {placeholderHint(field)}
        </p>
      {/if}
    </div>
  {/each}
</div>
