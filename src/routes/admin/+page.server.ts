import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const COOKIE_NAME = 'admin_session';
const COOKIE_VALUE = 'authenticated';

function isAuthenticated(cookies: import('@sveltejs/kit').Cookies): boolean {
	return cookies.get(COOKIE_NAME) === COOKIE_VALUE;
}

export const load: PageServerLoad = async ({ cookies }) => {
	if (!isAuthenticated(cookies)) {
		return { authenticated: false, registrations: [] };
	}

	const { data, error } = await supabase
		.from('registrations')
		.select('*')
		.order('created_at', { ascending: false });

	return {
		authenticated: true,
		registrations: data ?? [],
		error: error?.message
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
			return fail(401, { loginError: 'Invalid credentials' });
		}

		cookies.set(COOKIE_NAME, COOKIE_VALUE, {
			path: '/admin',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 8 // 8 hours
		});

		return { success: true };
	},

	logout: async ({ cookies }) => {
		cookies.delete(COOKIE_NAME, { path: '/admin' });
		redirect(303, '/admin');
	}
};
