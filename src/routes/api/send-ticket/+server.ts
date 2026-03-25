import { json } from '@sveltejs/kit';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private';
import type { RequestHandler } from './$types';

const resend = new Resend(RESEND_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
	const { id, name, email } = await request.json();

	if (!id || !name || !email) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const qrPayload = JSON.stringify({
		event: 'Glitter Me Softly',
		id,
		name,
		email,
	});

	// Generate QR as base64 PNG
	const qrDataUrl = await QRCode.toDataURL(qrPayload, {
		width: 400,
		margin: 2,
		color: {
			dark: '#ffffff',
			light: '#0a0012',
		},
		errorCorrectionLevel: 'M',
	});

	const { error } = await resend.emails.send({
		from: RESEND_FROM_EMAIL || 'Glitter Me Softly <hugs@glitter-me-softly.skin>',
		to: email,
		subject: "Your Glitter Me Softly Ticket ✦",
		html: `
			<div style="background-color: #0a0012; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px; text-align: center;">
				<h1 style="font-size: 36px; font-weight: 900; text-transform: uppercase; margin: 0 0 8px 0; color: #ff00ff;">
					Glitter Me Softly
				</h1>
				<p style="color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 32px 0;">
					A night of sparkle & love
				</p>

				<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,0,255,0.2); padding: 24px; margin: 0 auto 32px; max-width: 400px;">
					<p style="color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 16px 0;">
						Your ticket
					</p>
					<img src="${qrDataUrl}" alt="QR Code Ticket" style="width: 200px; height: 200px; display: block; margin: 0 auto 16px;" />
					<p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">
						Show this at the door
					</p>
				</div>

				<table style="margin: 0 auto; text-align: left; color: #ffffff; font-size: 14px;" cellpadding="8">
					<tr>
						<td style="color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Guest</td>
						<td style="font-weight: 700;">${name}</td>
					</tr>
					<tr>
						<td style="color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Date</td>
						<td style="font-weight: 700;">24.04.2026 — 18:00</td>
					</tr>
					<tr>
						<td style="color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Location</td>
						<td style="font-weight: 700;">DAKS, Spittelauerlände 12, Vienna</td>
					</tr>
					<tr>
						<td style="color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Dress code</td>
						<td style="font-weight: 700;">Reflective</td>
					</tr>
				</table>

				<p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 40px 0 0 0;">
					The more you shine, the more you belong.
				</p>
			</div>
		`,
	});

	if (error) {
		console.error('Resend error:', error);
		return json({ error: 'Failed to send email' }, { status: 500 });
	}

	return json({ success: true });
};
