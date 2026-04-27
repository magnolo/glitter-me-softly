// Supabase-backed store for editable email templates.
// Falls back to the in-code DEFAULT_TEMPLATES when the DB is empty/unreachable
// so the broadcast send pipeline never breaks.

import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import {
	DEFAULT_TEMPLATES,
	SECTIONS,
	type Section,
	type SectionType,
	type TemplateRow,
} from './email-sections';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const TABLE = 'email_templates';

type DbRow = {
	slug: string;
	name: string;
	description: string | null;
	subject: string;
	sections: unknown;
	updated_at: string;
	updated_by: string | null;
};

function dbRowToTemplate(row: DbRow): TemplateRow {
	return {
		slug: row.slug,
		name: row.name,
		description: row.description ?? '',
		subject: row.subject,
		sections: normalizeSections(row.sections),
	};
}

function normalizeSections(raw: unknown): Section[] {
	if (!Array.isArray(raw)) return [];
	const out: Section[] = [];
	for (const s of raw) {
		if (!s || typeof s !== 'object') continue;
		const obj = s as Record<string, unknown>;
		const type = obj.type as SectionType | undefined;
		if (!type || !(type in SECTIONS)) continue;
		const id = typeof obj.id === 'string' && obj.id ? obj.id : crypto.randomUUID();
		const content = (obj.content as Record<string, unknown> | undefined) ?? {};
		out.push({ id, type, content });
	}
	return out;
}

function getDefault(slug: string): TemplateRow | null {
	return DEFAULT_TEMPLATES.find((t) => t.slug === slug) ?? null;
}

export async function loadTemplate(slug: string): Promise<TemplateRow> {
	const { data, error } = await supabase.from(TABLE).select('*').eq('slug', slug).maybeSingle();
	if (error) {
		console.error('[template-store] loadTemplate error, falling back to default:', error);
	}
	if (data) return dbRowToTemplate(data as DbRow);
	const fallback = getDefault(slug);
	if (fallback) return fallback;
	throw new Error(`Template not found: ${slug}`);
}

export async function loadAllTemplates(): Promise<TemplateRow[]> {
	const { data, error } = await supabase.from(TABLE).select('*').order('updated_at');
	if (error) {
		console.error('[template-store] loadAllTemplates error, returning defaults:', error);
		return DEFAULT_TEMPLATES;
	}
	const rows = (data as DbRow[] | null) ?? [];
	if (rows.length === 0) return DEFAULT_TEMPLATES;
	return rows.map(dbRowToTemplate);
}

export async function seedDefaultsIfEmpty(): Promise<void> {
	const { count, error } = await supabase
		.from(TABLE)
		.select('slug', { count: 'exact', head: true });
	if (error) {
		console.error('[template-store] seedDefaultsIfEmpty count error:', error);
		return;
	}
	if ((count ?? 0) > 0) return;

	const rows = DEFAULT_TEMPLATES.map((t) => ({
		slug: t.slug,
		name: t.name,
		description: t.description,
		subject: t.subject,
		sections: t.sections,
	}));
	const { error: insertError } = await supabase.from(TABLE).insert(rows);
	if (insertError) {
		console.error('[template-store] seedDefaultsIfEmpty insert error:', insertError);
	}
}

export type TemplatePatch = {
	name?: string;
	description?: string;
	subject?: string;
	sections?: Section[];
};

export async function saveTemplate(
	slug: string,
	patch: TemplatePatch,
	updatedBy?: string,
): Promise<TemplateRow> {
	const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
	if (patch.name !== undefined) update.name = patch.name;
	if (patch.description !== undefined) update.description = patch.description;
	if (patch.subject !== undefined) update.subject = patch.subject;
	if (patch.sections !== undefined) update.sections = patch.sections;
	if (updatedBy) update.updated_by = updatedBy;

	const { data, error } = await supabase
		.from(TABLE)
		.update(update)
		.eq('slug', slug)
		.select('*')
		.maybeSingle();
	if (error) throw error;
	if (!data) throw new Error(`Template not found: ${slug}`);
	return dbRowToTemplate(data as DbRow);
}

export async function createTemplate(input: {
	slug: string;
	name: string;
	description?: string;
	subject?: string;
	sections?: Section[];
}): Promise<TemplateRow> {
	const row = {
		slug: input.slug,
		name: input.name,
		description: input.description ?? '',
		subject: input.subject ?? '✦ {{countdown}}',
		sections: input.sections ?? [],
	};
	const { data, error } = await supabase.from(TABLE).insert(row).select('*').maybeSingle();
	if (error) throw error;
	if (!data) throw new Error('Failed to create template');
	return dbRowToTemplate(data as DbRow);
}

export async function deleteTemplate(slug: string): Promise<void> {
	const { error } = await supabase.from(TABLE).delete().eq('slug', slug);
	if (error) throw error;
}

export async function resetTemplateToDefault(slug: string): Promise<TemplateRow | null> {
	const def = getDefault(slug);
	if (!def) return null;
	return saveTemplate(slug, {
		name: def.name,
		description: def.description,
		subject: def.subject,
		sections: def.sections,
	});
}
