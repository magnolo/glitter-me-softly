import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { renderLoadedTemplate, type TemplateRow } from '$lib/server/broadcast-email';

const COOKIE_NAME = 'admin_session';
const COOKIE_VALUE = 'authenticated';

function isAuthenticated(cookies: import('@sveltejs/kit').Cookies): boolean {
	return cookies.get(COOKIE_NAME) === COOKIE_VALUE;
}

// Re-renders an in-flight template without persisting it. Used by
// /admin/templates for the live preview pane.
export const POST: RequestHandler = async ({ request, cookies }) => {
	if (!isAuthenticated(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	let body: Partial<TemplateRow>;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
	const tpl: TemplateRow = {
		slug: body.slug ?? 'preview',
		name: body.name ?? 'Preview',
		description: body.description ?? '',
		subject: body.subject ?? '',
		sections: body.sections ?? [],
	};
	const rendered = renderLoadedTemplate(tpl, { name: 'Your Guest', now: new Date() });
	return json(rendered);
};
