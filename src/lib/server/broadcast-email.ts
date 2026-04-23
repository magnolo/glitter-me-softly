export const EVENT_DATE_ISO = '2026-04-24T18:00:00+02:00';

export type BroadcastTemplate = 'earlyBird' | 'djLineup';

const MAP_URL =
	'https://www.google.com/maps/place/Dachsbau+-+Atelier-CoWorking+Space/@48.2339495,16.3607168,163m/data=!3m1!1e3!4m6!3m5!1s0x476d0634e46cb56f:0x6d562d9aeff8c177!8m2!3d48.2340535!4d16.3608401!16s%2Fg%2F11b6jgmzml';
const SITE_URL = 'https://glitter-me-softly.skin/';
const SHARE_TEXT = `Glitter Me Softly ✦ a night of sparkle & love — 24.04.2026, 18:00, DAKS Vienna. Come dance with me: ${SITE_URL}`;

const WHATSAPP_SHARE = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`;
const TELEGRAM_SHARE = `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`;
const TWITTER_SHARE = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}`;
const MAIL_SHARE = `mailto:?subject=${encodeURIComponent('Glitter Me Softly ✦ Come dance with me')}&body=${encodeURIComponent(SHARE_TEXT)}`;

type DjEntry = {
	name: string;
	url: string | null;
	color: 'pink' | 'white';
	note?: string;
};

const DJ_LINEUP: DjEntry[] = [
	{
		name: 'yassi puls4ra',
		url: 'https://soundcloud.com/yassi_puls4ra/resistanz-festival-2023',
		color: 'pink',
		note: 'Sadly unwell and won’t be with us this time. Sending her all our love — get well soon, yassi. ✦',
	},
	{
		name: 'Kobas',
		url: 'https://soundcloud.com/mihaelkobas/kobas-klangkrater-aposqawiqt',
		color: 'white',
	},
	{
		name: 'fivesixsevenkate',
		url: 'https://soundcloud.com/diskoanimale/fivesixsevenkate-kramladen-diskoanimale-240323',
		color: 'pink',
	},
	{
		name: 'DJ The Collector',
		url: 'https://soundcloud.com/the-collector/collector-in-the-house-mix',
		color: 'white',
	},
	{ name: 'Dj iSi', url: null, color: 'pink' },
];

export function computeCountdown(now: Date): {
	days: number;
	hours: number;
	passed: boolean;
	label: string;
} {
	const eventMs = new Date(EVENT_DATE_ISO).getTime();
	const diffMs = eventMs - now.getTime();

	if (diffMs <= 0) {
		return { days: 0, hours: 0, passed: true, label: 'Doors are open!' };
	}

	const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
	const days = Math.floor(totalHours / 24);
	const hours = totalHours % 24;

	const dayPart = days === 1 ? '1 day' : `${days} days`;
	const hourPart = hours === 1 ? '1 hour' : `${hours} hours`;

	let label: string;
	if (days === 0) {
		label = hourPart;
	} else {
		label = `${dayPart}, ${hourPart}`;
	}

	return { days, hours, passed: false, label };
}

function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

// --- Shared building blocks ---------------------------------------------------

const DIVIDER = `
	<tr>
		<td align="center" style="padding: 32px 40px;">
			<div style="font-size: 14px; color: rgba(255,0,255,0.6); letter-spacing: 8px;">
				&#10022; &#10022; &#10022;
			</div>
		</td>
	</tr>`;

function countdownTile(value: number, label: string): string {
	return `
		<td align="center" valign="middle" style="padding: 0 6px;">
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background: rgba(255,0,255,0.08); border: 1px solid rgba(255,0,255,0.35); border-radius: 14px;">
				<tr>
					<td align="center" style="padding: 18px 22px;">
						<div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 44px; font-weight: 900; color: #ffffff; line-height: 1; letter-spacing: 1px;">
							${String(value).padStart(2, '0')}
						</div>
						<div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-top: 8px;">
							${label}
						</div>
					</td>
				</tr>
			</table>
		</td>`;
}

function countdownRow(countdown: ReturnType<typeof computeCountdown>): string {
	const inner = countdown.passed
		? `
			<p style="color: #00ffff; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 12px 0;">
				&#10022; Right now &#10022;
			</p>
			<p style="color: #ffffff; font-size: 40px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
				Doors are open
			</p>`
		: `
			<p style="color: #00ffff; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 18px 0;">
				&#10022; Doors open in &#10022;
			</p>
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
				<tr>
					${countdownTile(countdown.days, countdown.days === 1 ? 'Day' : 'Days')}
					${countdownTile(countdown.hours, countdown.hours === 1 ? 'Hour' : 'Hours')}
				</tr>
			</table>
			<p style="color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 18px 0 0 0;">
				24.04.2026 &middot; 18:00 &middot; Vienna
			</p>`;

	return `
		<tr>
			<td align="center" style="padding: 16px 32px 8px 32px;">
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,0,255,0.25); border-radius: 18px;">
					<tr>
						<td align="center" style="padding: 32px 20px;">
							${inner}
						</td>
					</tr>
				</table>
			</td>
		</tr>`;
}

const HEADER_ROW = `
	<tr>
		<td align="center" style="padding: 48px 32px 16px 32px;">
			<p style="color: rgba(255,255,255,0.5); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 14px 0;">
				&#10022; You&rsquo;re invited &#10022;
			</p>
			<h1 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 42px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0; color: #ff00ff;">
				Glitter Me Softly
			</h1>
			<p style="color: rgba(255,255,255,0.6); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin: 12px 0 0 0; font-style: italic;">
				A night of sparkle &amp; love
			</p>
		</td>
	</tr>`;

function greetingRow(safeName: string, bodyHtml: string): string {
	return `
		<tr>
			<td align="center" style="padding: 40px 40px 0 40px;">
				<p style="color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 22px; font-weight: 700; margin: 0 0 18px 0; letter-spacing: 0.5px;">
					Hey ${safeName} &#10022;
				</p>
				${bodyHtml}
			</td>
		</tr>`;
}

const EARLY_BIRD_ROW = `
	<tr>
		<td align="center" style="padding: 0;">
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(255,0,255,0.18), rgba(123,104,238,0.12)); border-top: 1px solid rgba(255,0,255,0.35); border-bottom: 1px solid rgba(255,0,255,0.35);">
				<tr>
					<td align="center" style="padding: 40px 40px;">
						<p style="color: #ff00ff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 14px 0; font-weight: 700;">
							&#10022; Little secret &#10022;
						</p>
						<p style="color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 24px; font-weight: 900; line-height: 1.3; margin: 0 0 14px 0; letter-spacing: 0.5px;">
							Come early &mdash; drinks are on us.
						</p>
						<p style="color: rgba(255,255,255,0.8); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.65; margin: 0;">
							The first arrivals get a <strong style="color: #ff9df2;">free welcome drink</strong> and the best spot on the dancefloor. Doors open at <strong>18:00</strong> &mdash; slide in right then, skip the queue, and start the night with a glass in hand.
						</p>
					</td>
				</tr>
			</table>
		</td>
	</tr>`;

function djCard(dj: DjEntry): string {
	const hasNote = Boolean(dj.note);
	const nameColor = dj.color === 'pink' ? '#ff00ff' : '#ffffff';

	const cardStyle = hasNote
		? 'padding: 24px 20px; background: linear-gradient(135deg, rgba(255,0,255,0.12), rgba(123,104,238,0.10)); border: 1px solid rgba(255,0,255,0.5); border-radius: 14px;'
		: 'padding: 22px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px;';

	const nameStyle = hasNote
		? `margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; color: ${nameColor}; opacity: 0.85;`
		: `margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; color: ${nameColor};`;

	const accent = hasNote
		? `
			<p style="margin: 0 0 10px 0; color: #ff9df2; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">
				&#10022; Sending love &#10022;
			</p>`
		: '';

	const listen = dj.url
		? `
			<p style="margin: 14px 0 0 0;">
				<a href="${dj.url}" style="display: inline-block; padding: 10px 20px; background: rgba(255,0,255,0.12); border: 1px solid rgba(255,0,255,0.5); border-radius: 999px; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">
					Listen on SoundCloud &rarr;
				</a>
			</p>`
		: `
			<p style="margin: 14px 0 0 0; color: rgba(255,255,255,0.45); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-style: italic; letter-spacing: 0.5px;">
				Catch them live on the floor
			</p>`;

	const noteBlock = dj.note
		? `
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 18px 0 0 0;">
				<tr>
					<td align="center" style="padding: 16px 18px; background: rgba(255,0,255,0.1); border: 1px dashed rgba(255,0,255,0.5); border-radius: 12px;">
						<p style="margin: 0; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.55; font-weight: 500;">
							${dj.note}
						</p>
					</td>
				</tr>
			</table>`
		: '';

	return `
		<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 14px 0;">
			<tr>
				<td align="center" style="${cardStyle}">
					${accent}
					<p style="${nameStyle}">
						${escapeHtml(dj.name)}
					</p>
					${listen}
					${noteBlock}
				</td>
			</tr>
		</table>`;
}

const DJ_LINEUP_ROW = `
	<tr>
		<td align="center" style="padding: 0;">
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(255,0,255,0.18), rgba(123,104,238,0.12)); border-top: 1px solid rgba(255,0,255,0.35); border-bottom: 1px solid rgba(255,0,255,0.35);">
				<tr>
					<td align="center" style="padding: 40px 32px;">
						<p style="color: #ff00ff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 14px 0; font-weight: 700;">
							&#10022; On the decks &#10022;
						</p>
						<p style="color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 24px; font-weight: 900; line-height: 1.25; margin: 0 0 14px 0; letter-spacing: 0.5px;">
							Meet your DJs.
						</p>
						<p style="color: rgba(255,255,255,0.85); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.65; margin: 0 0 26px 0;">
							Here&rsquo;s who you&rsquo;ll be dancing with on Friday night. Tap a name to hear what they&rsquo;ve been cooking.
						</p>

						${DJ_LINEUP.map(djCard).join('')}
					</td>
				</tr>
			</table>
		</td>
	</tr>`;

const ESSENTIALS_ROW = `
	<tr>
		<td align="center" style="padding: 0 40px;">
			<p style="color: rgba(255,255,255,0.45); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 18px 0;">
				The essentials
			</p>
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="text-align: left; font-family: 'Helvetica Neue', Arial, sans-serif;">
				<tr>
					<td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; width: 110px;">When</td>
					<td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 15px; font-weight: 700;">24.04.2026 &mdash; 18:00</td>
				</tr>
				<tr>
					<td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Where</td>
					<td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 15px; font-weight: 700;"><a href="${MAP_URL}" style="color: #ffffff; text-decoration: none; border-bottom: 1px solid rgba(255,0,255,0.5);">DAKS &middot; Spittelauerl&auml;nde 12, Vienna</a></td>
				</tr>
				<tr>
					<td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Dress code</td>
					<td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 15px; font-weight: 700;">Reflective. Shimmer. Shine.</td>
				</tr>
				<tr>
					<td style="padding: 12px 0; color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Bring</td>
					<td style="padding: 12px 0; color: #ffffff; font-size: 15px; font-weight: 700;">Your QR ticket &middot; your sparkle</td>
				</tr>
			</table>
		</td>
	</tr>`;

const SHARE_ROW = `
	<tr>
		<td align="center" style="padding: 0;">
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(255,0,255,0.18), rgba(123,104,238,0.12)); border-top: 1px solid rgba(255,0,255,0.35); border-bottom: 1px solid rgba(255,0,255,0.35);">
				<tr>
					<td align="center" style="padding: 40px 40px;">
						<p style="color: #ff00ff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 14px 0; font-weight: 700;">
							&#10022; Pass it on &#10022;
						</p>
						<p style="color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 24px; font-weight: 900; line-height: 1.25; margin: 0 0 14px 0; letter-spacing: 0.5px;">
							Someone coming to mind?
						</p>
						<p style="color: rgba(255,255,255,0.85); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
							If there&rsquo;s a friend who&rsquo;d glitter beautifully beside you that night,<br /> or someone in your life who could use a little light right now &mdash; send the invite their way, with our love.
						</p>
						<p style="color: rgba(255,255,255,0.55); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.6; margin: 0 0 26px 0; font-style: italic;">
							More sparkles, more love
						</p>

						<p style="margin: 0 0 18px 0;">
							<a href="${WHATSAPP_SHARE}" style="display: inline-block; padding: 14px 28px; background: #ff00ff; border-radius: 999px; color: #0a0012; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">
								Share the invite
							</a>
						</p>

						<p style="color: rgba(255,255,255,0.5); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
							<a href="${TELEGRAM_SHARE}" style="color: rgba(255,255,255,0.75); text-decoration: none; border-bottom: 1px solid rgba(255,0,255,0.5); padding-bottom: 2px;">Telegram</a>
							<span style="color: rgba(255,255,255,0.25); padding: 0 10px;">&middot;</span>
							<a href="${TWITTER_SHARE}" style="color: rgba(255,255,255,0.75); text-decoration: none; border-bottom: 1px solid rgba(255,0,255,0.5); padding-bottom: 2px;">X</a>
							<span style="color: rgba(255,255,255,0.25); padding: 0 10px;">&middot;</span>
							<a href="${MAIL_SHARE}" style="color: rgba(255,255,255,0.75); text-decoration: none; border-bottom: 1px solid rgba(255,0,255,0.5); padding-bottom: 2px;">Email</a>
						</p>
					</td>
				</tr>
			</table>
		</td>
	</tr>`;

const SIGNATURE_ROW = `
	<tr>
		<td align="center" style="padding: 40px 40px 48px 40px;">
			<p style="color: rgba(255,255,255,0.7); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0; font-style: italic;">
				See you on the floor.
			</p>
			<p style="color: #ff00ff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; letter-spacing: 4px; text-transform: uppercase; font-weight: 700; margin: 0;">
				&mdash; with love, your Glitter Me Softly Team
			</p>
		</td>
	</tr>`;

const FOOTER_ROW = `
	<tr>
		<td align="center" style="padding: 32px 32px 40px 32px; border-top: 1px solid rgba(255,255,255,0.06);">
			<p style="color: rgba(255,255,255,0.4); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 12px 0;">
				Find us here
			</p>
			<p style="color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
				DAKS &middot; Spittelauerl&auml;nde 12, 1090 Vienna
			</p>
			<p style="margin: 0 0 28px 0;">
				<a href="${MAP_URL}" style="display: inline-block; padding: 12px 22px; background: rgba(255,0,255,0.15); border: 1px solid rgba(255,0,255,0.5); border-radius: 999px; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">
					&#10022; Open in Google Maps &rarr;
				</a>
			</p>
			<p style="color: rgba(255,255,255,0.35); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
				The more you shine, the more you belong.
			</p>
		</td>
	</tr>`;

function wrapHtml(innerRows: string): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>Glitter Me Softly</title>
<style>
	:root { color-scheme: dark light; supported-color-schemes: dark light; }
</style>
</head>
<body bgcolor="#0a0012" style="margin: 0; padding: 0; background-color: #0a0012; background: #0a0012;">
<div style="background-color: #0a0012; background: #0a0012;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0012" style="background-color: #0a0012; background: #0a0012;">
	<tr>
		<td align="center" bgcolor="#0a0012" style="padding: 32px 16px; background-color: #0a0012;">
			<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0012" style="max-width: 600px; width: 100%; background-color: #0a0012; background: linear-gradient(180deg, rgba(123,104,238,0.10) 0%, rgba(10,0,18,0) 55%), #0a0012; border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; overflow: hidden;">
${innerRows}
			</table>
		</td>
	</tr>
</table>
</div>
</body>
</html>
	`;
}

// --- Public renderers --------------------------------------------------------

export function renderBroadcastEmail({
	name,
	now,
}: {
	name: string;
	now: Date;
}): { subject: string; html: string } {
	const countdown = computeCountdown(now);
	const safeName = escapeHtml(name);

	const subject = countdown.passed
		? '✦ Doors are open — come dance with us'
		: `✦ ${countdown.label} until we dance — free drinks for early birds`;

	const greetingBody = `
		<p style="color: rgba(255,255,255,0.9); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 17px; line-height: 1.65; margin: 0 0 18px 0;">
			We can&rsquo;t wait to see you. Truly &mdash; we are <em style="color: #ff9df2;">so</em> looking forward to this,
			and the thought of <strong style="color: #ff00ff;">dancing together</strong> under the glitter is what&rsquo;s keeping us going this week.
		</p>
		<p style="color: rgba(255,255,255,0.85); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.65; margin: 0 0 24px 0;">
			Bring your shine. Bring your people&rsquo;s energy. We&rsquo;ll bring the rest.
		</p>`;

	const innerRows =
		HEADER_ROW +
		countdownRow(countdown) +
		greetingRow(safeName, greetingBody) +
		DIVIDER +
		EARLY_BIRD_ROW +
		DIVIDER +
		ESSENTIALS_ROW +
		DIVIDER +
		SHARE_ROW +
		SIGNATURE_ROW +
		FOOTER_ROW;

	return { subject, html: wrapHtml(innerRows) };
}

export function renderDjEmail({
	name,
	now,
}: {
	name: string;
	now: Date;
}): { subject: string; html: string } {
	const countdown = computeCountdown(now);
	const safeName = escapeHtml(name);

	const subject = countdown.passed
		? '✦ Meet your DJs — doors are open'
		: `✦ Meet your DJs — ${countdown.label} to warm up`;

	const greetingBody = `
		<p style="color: rgba(255,255,255,0.9); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 17px; line-height: 1.65; margin: 0 0 18px 0;">
			The lineup is locked, the records are chosen, and we are <em style="color: #ff9df2;">buzzing</em>.
			These humans are bringing their love to the floor &mdash; different flavours of the same feeling:
			<strong style="color: #ff00ff;">techno, house, everything</strong> that makes the body forget it was ever tired.
		</p>
		<p style="color: rgba(255,255,255,0.85); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.65; margin: 0 0 24px 0;">
			Take a listen below, pick a favourite, and come in already warmed up.
		</p>`;

	const innerRows =
		HEADER_ROW +
		countdownRow(countdown) +
		greetingRow(safeName, greetingBody) +
		DIVIDER +
		DJ_LINEUP_ROW +
		DIVIDER +
		ESSENTIALS_ROW +
		DIVIDER +
		SHARE_ROW +
		SIGNATURE_ROW +
		FOOTER_ROW;

	return { subject, html: wrapHtml(innerRows) };
}

export function renderTemplate(
	template: BroadcastTemplate,
	args: { name: string; now: Date },
): { subject: string; html: string } {
	return template === 'djLineup' ? renderDjEmail(args) : renderBroadcastEmail(args);
}
