import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	allSectionMeta,
	renderLoadedTemplate,
	loadAllTemplates,
	saveTemplate,
	createTemplate,
	deleteTemplate,
	resetTemplateToDefault,
	seedDefaultsIfEmpty,
	type Section,
} from '$lib/server/broadcast-email';

const COOKIE_NAME = 'admin_session';
const COOKIE_VALUE = 'authenticated';

function isAuthenticated(cookies: import('@sveltejs/kit').Cookies): boolean {
	return cookies.get(COOKIE_NAME) === COOKIE_VALUE;
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function parseSections(raw: FormDataEntryValue | null): Section[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw.toString());
		if (!Array.isArray(parsed)) return [];
		return parsed as Section[];
	} catch {
		return [];
	}
}

export const load: PageServerLoad = async ({ cookies }) => {
	if (!isAuthenticated(cookies)) {
		redirect(303, '/admin');
	}

	await seedDefaultsIfEmpty();
	const templates = await loadAllTemplates();

	const previewNow = new Date();
	const previews: Record<string, { subject: string; html: string }> = {};
	for (const tpl of templates) {
		previews[tpl.slug] = renderLoadedTemplate(tpl, {
			name: 'Your Guest',
			now: previewNow,
		});
	}

	return {
		templates,
		sectionMeta: allSectionMeta(),
		previews,
	};
};

export const actions: Actions = {
	save: async ({ request, cookies }) => {
		if (!isAuthenticated(cookies)) {
			return fail(401, { saveError: 'Unauthorized' });
		}
		const formData = await request.formData();
		const slug = formData.get('slug')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const description = formData.get('description')?.toString() ?? '';
		const subject = formData.get('subject')?.toString() ?? '';
		const sections = parseSections(formData.get('sections'));

		if (!slug) return fail(400, { saveError: 'Missing slug' });

		try {
			const updated = await saveTemplate(slug, { name, description, subject, sections });
			return { saveSuccess: `Saved "${updated.name}"`, savedSlug: slug };
		} catch (err) {
			console.error('save error', err);
			return fail(500, {
				saveError: err instanceof Error ? err.message : 'Failed to save template',
			});
		}
	},

	create: async ({ request, cookies }) => {
		if (!isAuthenticated(cookies)) {
			return fail(401, { createError: 'Unauthorized' });
		}
		const formData = await request.formData();
		const rawSlug = formData.get('slug')?.toString() ?? '';
		const name = formData.get('name')?.toString().trim() ?? '';
		if (!name) return fail(400, { createError: 'Name is required' });

		const slug = rawSlug ? slugify(rawSlug) : slugify(name);
		if (!slug) return fail(400, { createError: 'Could not derive a valid slug' });

		try {
			const tpl = await createTemplate({ slug, name });
			return { createSuccess: `Created "${tpl.name}"`, createdSlug: tpl.slug };
		} catch (err) {
			console.error('create error', err);
			return fail(500, {
				createError:
					err instanceof Error
						? `Failed to create: ${err.message}`
						: 'Failed to create template',
			});
		}
	},

	delete: async ({ request, cookies }) => {
		if (!isAuthenticated(cookies)) {
			return fail(401, { deleteError: 'Unauthorized' });
		}
		const formData = await request.formData();
		const slug = formData.get('slug')?.toString() ?? '';
		if (!slug) return fail(400, { deleteError: 'Missing slug' });
		try {
			await deleteTemplate(slug);
			return { deleteSuccess: 'Template deleted' };
		} catch (err) {
			console.error('delete error', err);
			return fail(500, {
				deleteError: err instanceof Error ? err.message : 'Failed to delete template',
			});
		}
	},

	reset: async ({ request, cookies }) => {
		if (!isAuthenticated(cookies)) {
			return fail(401, { resetError: 'Unauthorized' });
		}
		const formData = await request.formData();
		const slug = formData.get('slug')?.toString() ?? '';
		try {
			const tpl = await resetTemplateToDefault(slug);
			if (!tpl) return fail(400, { resetError: `No default for slug "${slug}"` });
			return { resetSuccess: `Reset "${tpl.name}" to default`, resetSlug: slug };
		} catch (err) {
			console.error('reset error', err);
			return fail(500, {
				resetError: err instanceof Error ? err.message : 'Failed to reset template',
			});
		}
	},
};
