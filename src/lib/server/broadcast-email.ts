// Thin facade over the section registry + template store.
// Loads a template (DB or default), composes it via the registry, returns
// { subject, html } ready to send via Resend.
//
// Two entry points:
//   - renderTemplate(slug, args): convenient one-shot (DB lookup + render)
//   - renderLoadedTemplate(tpl, args): no I/O — use this when sending in
//     batches so the DB hit happens once per template, not per recipient.

import {
	SECTIONS,
	buildRenderCtx,
	substitutePlaceholders,
	wrapHtml,
	type RenderCtx,
	type Section,
	type TemplateRow,
} from './email-sections';
import { loadTemplate } from './template-store';

export {
	EVENT_DATE_ISO,
	computeCountdown,
	allSectionMeta,
	PLACEHOLDERS,
	type Countdown,
	type Section,
	type SectionType,
	type SectionMeta,
	type EditorField,
	type TemplateRow,
} from './email-sections';

export type RenderArgs = { name: string; now: Date };

export type RenderedEmail = { subject: string; html: string };

function renderSection(section: Section, ctx: RenderCtx): string {
	const spec = SECTIONS[section.type];
	if (!spec) {
		console.warn(`[broadcast-email] Unknown section type: ${section.type}`);
		return '';
	}
	// Merge over defaultContent so palette items (mid-drag) and partially-filled
	// or legacy DB rows still render with sensible fallbacks instead of crashing.
	const content = { ...(spec.defaultContent ?? {}), ...(section.content ?? {}) };
	try {
		return spec.render(content, ctx);
	} catch (err) {
		console.error(`[broadcast-email] Render error in ${section.type}:`, err);
		return '';
	}
}

export function renderLoadedTemplate(tpl: TemplateRow, args: RenderArgs): RenderedEmail {
	const ctx = buildRenderCtx(args);
	const rows = tpl.sections.map((s) => renderSection(s, ctx)).join('');
	return {
		subject: substitutePlaceholders(tpl.subject, ctx),
		html: wrapHtml(rows),
	};
}

export async function renderTemplate(slug: string, args: RenderArgs): Promise<RenderedEmail> {
	const tpl = await loadTemplate(slug);
	return renderLoadedTemplate(tpl, args);
}

// Re-export store helpers for convenience at call sites.
export {
	loadTemplate,
	loadAllTemplates,
	seedDefaultsIfEmpty,
	saveTemplate,
	createTemplate,
	deleteTemplate,
	resetTemplateToDefault,
} from './template-store';
