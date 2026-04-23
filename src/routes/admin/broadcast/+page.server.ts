import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import {
	EVENT_DATE_ISO,
	renderTemplate,
	type BroadcastTemplate,
} from '$lib/server/broadcast-email';

const VALID_TEMPLATES: readonly BroadcastTemplate[] = ['earlyBird', 'djLineup'];

function parseTemplate(value: FormDataEntryValue | null): BroadcastTemplate {
	const v = value?.toString() ?? '';
	return (VALID_TEMPLATES as readonly string[]).includes(v)
		? (v as BroadcastTemplate)
		: 'earlyBird';
}

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
const resend = new Resend(RESEND_API_KEY);

const COOKIE_NAME = 'admin_session';
const COOKIE_VALUE = 'authenticated';
const FROM_ADDRESS = RESEND_FROM_EMAIL || 'Glitter Me Softly <hugs@glitter-me-softly.skin>';
const BATCH_SIZE = 100;

function isAuthenticated(cookies: import('@sveltejs/kit').Cookies): boolean {
	return cookies.get(COOKIE_NAME) === COOKIE_VALUE;
}

type Recipient = { id: string; name: string; email: string };

export const load: PageServerLoad = async ({ cookies }) => {
	if (!isAuthenticated(cookies)) {
		redirect(303, '/admin');
	}

	const { data, error } = await supabase
		.from('registrations')
		.select('id, name, email')
		.order('created_at', { ascending: false });

	const recipients: Recipient[] = (data ?? []).filter((r): r is Recipient => Boolean(r.email));

	const previewNow = new Date();
	const previews = {
		earlyBird: renderTemplate('earlyBird', { name: 'Your Guest', now: previewNow }),
		djLineup: renderTemplate('djLineup', { name: 'Your Guest', now: previewNow }),
	};

	return {
		recipients,
		eventDateIso: EVENT_DATE_ISO,
		previews,
		error: error?.message,
	};
};

export const actions: Actions = {
	testSend: async ({ request, cookies }) => {
		if (!isAuthenticated(cookies)) {
			return fail(401, { testError: 'Unauthorized' });
		}

		const formData = await request.formData();
		const testEmail = formData.get('email')?.toString().trim() ?? '';
		const template = parseTemplate(formData.get('template'));

		if (!testEmail || !testEmail.includes('@')) {
			return fail(400, { testError: 'Enter a valid email address' });
		}

		const { subject, html } = renderTemplate(template, { name: 'Test', now: new Date() });

		const { error } = await resend.emails.send({
			from: FROM_ADDRESS,
			to: testEmail,
			subject,
			html,
		});

		if (error) {
			console.error('Resend test-send error:', error);
			return fail(500, { testError: error.message || 'Failed to send test email' });
		}

		return { testSuccess: `Test email sent to ${testEmail}` };
	},

	sendAll: async ({ request, cookies }) => {
		if (!isAuthenticated(cookies)) {
			return fail(401, { sendError: 'Unauthorized' });
		}

		const formData = await request.formData();
		const template = parseTemplate(formData.get('template'));

		const { data, error: loadError } = await supabase
			.from('registrations')
			.select('id, name, email');

		if (loadError) {
			return fail(500, { sendError: `Failed to load recipients: ${loadError.message}` });
		}

		const recipients: Recipient[] = (data ?? []).filter((r): r is Recipient =>
			Boolean(r.email),
		);

		if (recipients.length === 0) {
			return fail(400, { sendError: 'No recipients to send to' });
		}

		const now = new Date();
		let sent = 0;
		let failed = 0;
		const errors: string[] = [];

		for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
			const chunk = recipients.slice(i, i + BATCH_SIZE);
			const payload = chunk.map((r) => {
				const { subject, html } = renderTemplate(template, { name: r.name, now });
				return {
					from: FROM_ADDRESS,
					to: r.email,
					subject,
					html,
				};
			});

			const { data: batchData, error: batchError } = await resend.batch.send(payload);

			if (batchError) {
				failed += chunk.length;
				errors.push(batchError.message);
				console.error('Resend batch error:', batchError);
				continue;
			}

			const created = batchData?.data?.length ?? 0;
			sent += created;
			if (created < chunk.length) {
				failed += chunk.length - created;
			}
		}

		return {
			sendResult: { sent, failed, total: recipients.length, errors },
		};
	},
};
