// Email-template section registry. Each section type owns:
//   - a TS shape for its `content` (what the admin edits)
//   - a list of editor fields that drive the auto-generated form
//   - a render function that emits a `<tr>` row for the email HTML
// Templates in the DB are just an ordered array of `{ id, type, content }`
// objects; the renderer composes them into a full email.

export const EVENT_DATE_ISO = '2026-04-24T18:00:00+02:00';

// ─────────────────────────────────────────────────────────────────────────────
// Shared constants — colors, URLs, DJ data
// ─────────────────────────────────────────────────────────────────────────────

export const MAP_URL =
	'https://www.google.com/maps/place/Dachsbau+-+Atelier-CoWorking+Space/@48.2339495,16.3607168,163m/data=!3m1!1e3!4m6!3m5!1s0x476d0634e46cb56f:0x6d562d9aeff8c177!8m2!3d48.2340535!4d16.3608401!16s%2Fg%2F11b6jgmzml';
export const SITE_URL = 'https://glitter-me-softly.skin/';
export const VENUE = 'DAKS · Spittelauerlände 12, Vienna';
export const EVENT_DATE_DISPLAY = '24.04.2026';
export const EVENT_TIME_DISPLAY = '18:00';

const SHARE_TEXT = `Glitter Me Softly ✦ a night of sparkle & love — 24.04.2026, 18:00, DAKS Vienna. Come dance with me: ${SITE_URL}`;
export const SHARE_URLS = {
	whatsapp: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`,
	telegram: `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`,
	twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}`,
	email: `mailto:?subject=${encodeURIComponent('Glitter Me Softly ✦ Come dance with me')}&body=${encodeURIComponent(SHARE_TEXT)}`,
};

export type DjEntry = {
	name: string;
	url: string | null;
	color: 'pink' | 'white';
	note?: string;
};

export const DJ_LINEUP: DjEntry[] = [
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

// ─────────────────────────────────────────────────────────────────────────────
// Countdown
// ─────────────────────────────────────────────────────────────────────────────

export type Countdown = {
	days: number;
	hours: number;
	passed: boolean;
	label: string;
};

export function computeCountdown(now: Date): Countdown {
	const eventMs = new Date(EVENT_DATE_ISO).getTime();
	const diffMs = eventMs - now.getTime();

	if (diffMs <= 0) {
		return { days: 0, hours: 0, passed: true, label: 'Doors are open' };
	}

	const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
	const days = Math.floor(totalHours / 24);
	const hours = totalHours % 24;
	const dayPart = days === 1 ? '1 day' : `${days} days`;
	const hourPart = hours === 1 ? '1 hour' : `${hours} hours`;
	const label = days === 0 ? hourPart : `${dayPart}, ${hourPart}`;
	return { days, hours, passed: false, label };
}

// ─────────────────────────────────────────────────────────────────────────────
// Render context + placeholder substitution
// ─────────────────────────────────────────────────────────────────────────────

export type RenderCtx = {
	safeName: string; // already HTML-escaped recipient name
	countdown: Countdown;
	mapUrl: string;
	siteUrl: string;
	venue: string;
	eventDate: string;
	eventTime: string;
	shareUrls: typeof SHARE_URLS;
	djLineup: DjEntry[];
};

export function buildRenderCtx(args: { name: string; now: Date }): RenderCtx {
	return {
		safeName: escapeHtml(args.name),
		countdown: computeCountdown(args.now),
		mapUrl: MAP_URL,
		siteUrl: SITE_URL,
		venue: VENUE,
		eventDate: EVENT_DATE_DISPLAY,
		eventTime: EVENT_TIME_DISPLAY,
		shareUrls: SHARE_URLS,
		djLineup: DJ_LINEUP,
	};
}

export const PLACEHOLDERS = [
	'{{name}}',
	'{{countdown}}',
	'{{event_date}}',
	'{{event_time}}',
	'{{venue}}',
	'{{map_url}}',
	'{{site_url}}',
] as const;

export function substitutePlaceholders(text: string, ctx: RenderCtx): string {
	return text
		.replace(/\{\{name\}\}/g, ctx.safeName)
		.replace(/\{\{countdown\}\}/g, ctx.countdown.label)
		.replace(/\{\{event_date\}\}/g, ctx.eventDate)
		.replace(/\{\{event_time\}\}/g, ctx.eventTime)
		.replace(/\{\{venue\}\}/g, ctx.venue)
		.replace(/\{\{map_url\}\}/g, ctx.mapUrl)
		.replace(/\{\{site_url\}\}/g, ctx.siteUrl);
}

export function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

// Short-text helper: substitute placeholders, no newline conversion.
function txt(s: string | undefined | null, ctx: RenderCtx): string {
	if (!s) return '';
	return substitutePlaceholders(s, ctx);
}

// Body helper: substitute placeholders + convert single \n to <br />.
function body(s: string | undefined | null, ctx: RenderCtx): string {
	if (!s) return '';
	return substitutePlaceholders(s, ctx).replace(/\n/g, '<br />');
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor field types
// ─────────────────────────────────────────────────────────────────────────────

export type EditorField =
	| { kind: 'text'; key: string; label: string; placeholders?: readonly string[]; hint?: string }
	| {
			kind: 'textarea';
			key: string;
			label: string;
			rows?: number;
			placeholders?: readonly string[];
			hint?: string;
	  }
	| {
			kind: 'paragraphs';
			key: string;
			label: string;
			placeholders?: readonly string[];
			hint?: string;
	  }
	| {
			kind: 'select';
			key: string;
			label: string;
			options: readonly { value: string; label: string }[];
			hint?: string;
	  };

export type SectionType =
	| 'header'
	| 'countdown'
	| 'lookback'
	| 'greeting'
	| 'divider'
	| 'banner'
	| 'dj-lineup'
	| 'essentials'
	| 'share'
	| 'signature'
	| 'footer-map';

export type Section = {
	id: string;
	type: SectionType;
	content: Record<string, unknown>;
};

export type SectionSpec<C extends Record<string, unknown> = Record<string, unknown>> = {
	type: SectionType;
	label: string;
	paletteHint: string;
	defaultContent: C;
	editorFields: readonly EditorField[];
	render(content: C, ctx: RenderCtx): string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared HTML primitives
// ─────────────────────────────────────────────────────────────────────────────

const FONT = "'Helvetica Neue', Arial, sans-serif";

const DIVIDER_HTML = `
	<tr>
		<td align="center" style="padding: 32px 40px;">
			<div style="font-size: 14px; color: rgba(255,0,255,0.6); letter-spacing: 8px;">
				&#10022; &#10022; &#10022;
			</div>
		</td>
	</tr>`;

type BannerColor = 'pink' | 'cyan';

function bannerWrapStyle(color: BannerColor): string {
	if (color === 'cyan') {
		return 'background: linear-gradient(135deg, rgba(0,255,255,0.12), rgba(123,104,238,0.14)); border-top: 1px solid rgba(0,255,255,0.30); border-bottom: 1px solid rgba(0,255,255,0.30);';
	}
	return 'background: linear-gradient(135deg, rgba(255,0,255,0.18), rgba(123,104,238,0.12)); border-top: 1px solid rgba(255,0,255,0.35); border-bottom: 1px solid rgba(255,0,255,0.35);';
}

function bannerAccentColor(color: BannerColor): string {
	return color === 'cyan' ? '#00ffff' : '#ff00ff';
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: header
// ─────────────────────────────────────────────────────────────────────────────

type HeaderContent = { eyebrow: string; title: string; tagline: string };

const headerSpec: SectionSpec<HeaderContent> = {
	type: 'header',
	label: 'Header',
	paletteHint: 'Glitter Me Softly hero with eyebrow + tagline',
	defaultContent: {
		eyebrow: '✦ You’re invited ✦',
		title: 'Glitter Me Softly',
		tagline: 'A night of sparkle & love',
	},
	editorFields: [
		{ kind: 'text', key: 'eyebrow', label: 'Eyebrow' },
		{ kind: 'text', key: 'title', label: 'Title' },
		{ kind: 'text', key: 'tagline', label: 'Tagline' },
	],
	render(content, ctx) {
		return `
		<tr>
			<td align="center" style="padding: 48px 32px 16px 32px;">
				<p style="color: rgba(255,255,255,0.5); font-family: ${FONT}; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 14px 0;">
					${txt(content.eyebrow, ctx)}
				</p>
				<h1 style="font-family: ${FONT}; font-size: 42px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0; color: #ff00ff;">
					${txt(content.title, ctx)}
				</h1>
				<p style="color: rgba(255,255,255,0.6); font-family: ${FONT}; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin: 12px 0 0 0; font-style: italic;">
					${txt(content.tagline, ctx)}
				</p>
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: countdown
// ─────────────────────────────────────────────────────────────────────────────

type CountdownContent = { label: string };

function countdownTile(value: number, label: string): string {
	return `
		<td align="center" valign="middle" style="padding: 0 6px;">
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background: rgba(255,0,255,0.08); border: 1px solid rgba(255,0,255,0.35); border-radius: 14px;">
				<tr>
					<td align="center" style="padding: 18px 22px;">
						<div style="font-family: ${FONT}; font-size: 44px; font-weight: 900; color: #ffffff; line-height: 1; letter-spacing: 1px;">
							${String(value).padStart(2, '0')}
						</div>
						<div style="font-family: ${FONT}; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-top: 8px;">
							${label}
						</div>
					</td>
				</tr>
			</table>
		</td>`;
}

const countdownSpec: SectionSpec<CountdownContent> = {
	type: 'countdown',
	label: 'Countdown',
	paletteHint: 'Days + hours tiles, computed at send time',
	defaultContent: { label: 'Doors open in' },
	editorFields: [{ kind: 'text', key: 'label', label: 'Eyebrow label' }],
	render(content, ctx) {
		const inner = ctx.countdown.passed
			? `
				<p style="color: #00ffff; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 12px 0;">
					&#10022; Right now &#10022;
				</p>
				<p style="color: #ffffff; font-size: 40px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
					Doors are open
				</p>`
			: `
				<p style="color: #00ffff; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 18px 0;">
					&#10022; ${txt(content.label, ctx)} &#10022;
				</p>
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
					<tr>
						${countdownTile(ctx.countdown.days, ctx.countdown.days === 1 ? 'Day' : 'Days')}
						${countdownTile(ctx.countdown.hours, ctx.countdown.hours === 1 ? 'Hour' : 'Hours')}
					</tr>
				</table>
				<p style="color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 18px 0 0 0;">
					${ctx.eventDate} &middot; ${ctx.eventTime} &middot; Vienna
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
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: lookback
// ─────────────────────────────────────────────────────────────────────────────

type LookbackContent = { eyebrow: string; bigText: string; tagline: string };

const lookbackSpec: SectionSpec<LookbackContent> = {
	type: 'lookback',
	label: 'Look-back card',
	paletteHint: 'Memory card for post-event emails',
	defaultContent: {
		eyebrow: 'Looking back',
		bigText: '24.04.2026',
		tagline: 'A night we won’t forget',
	},
	editorFields: [
		{ kind: 'text', key: 'eyebrow', label: 'Eyebrow', hint: 'Wraps with ✦ … ✦ in the rendered email' },
		{ kind: 'text', key: 'bigText', label: 'Big text (date)' },
		{ kind: 'text', key: 'tagline', label: 'Tagline' },
	],
	render(content, ctx) {
		return `
		<tr>
			<td align="center" style="padding: 16px 32px 8px 32px;">
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,0,255,0.25); border-radius: 18px;">
					<tr>
						<td align="center" style="padding: 36px 24px;">
							<p style="color: #00ffff; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 14px 0;">
								&#10022; ${txt(content.eyebrow, ctx)} &#10022;
							</p>
							<p style="color: #ffffff; font-family: ${FONT}; font-size: 32px; font-weight: 900; letter-spacing: 1px; margin: 0 0 6px 0;">
								${txt(content.bigText, ctx)}
							</p>
							<p style="color: rgba(255,255,255,0.55); font-family: ${FONT}; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin: 0; font-style: italic;">
								${txt(content.tagline, ctx)}
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: greeting
// ─────────────────────────────────────────────────────────────────────────────

type GreetingContent = { greeting: string; paragraphs: string[] };

const greetingSpec: SectionSpec<GreetingContent> = {
	type: 'greeting',
	label: 'Greeting',
	paletteHint: 'Personalized "Hey {{name}} ✦" + body paragraphs',
	defaultContent: {
		greeting: 'Hey {{name}} ✦',
		paragraphs: ['Add an opening paragraph here.'],
	},
	editorFields: [
		{ kind: 'text', key: 'greeting', label: 'Greeting line', placeholders: ['{{name}}'] },
		{
			kind: 'paragraphs',
			key: 'paragraphs',
			label: 'Body paragraphs',
			placeholders: ['{{name}}', '{{countdown}}', '{{event_date}}', '{{event_time}}', '{{venue}}'],
			hint: 'First paragraph renders larger; HTML tags like <em> and <strong> are supported.',
		},
	],
	render(content, ctx) {
		const paragraphs = (content.paragraphs ?? [])
			.map((p, i) => {
				const size = i === 0 ? 17 : 16;
				const opacity = i === 0 ? 0.9 : 0.85;
				return `
				<p style="color: rgba(255,255,255,${opacity}); font-family: ${FONT}; font-size: ${size}px; line-height: 1.65; margin: 0 0 18px 0;">
					${body(p, ctx)}
				</p>`;
			})
			.join('');
		return `
		<tr>
			<td align="center" style="padding: 40px 40px 0 40px;">
				<p style="color: #ffffff; font-family: ${FONT}; font-size: 22px; font-weight: 700; margin: 0 0 18px 0; letter-spacing: 0.5px;">
					${txt(content.greeting, ctx)}
				</p>
				${paragraphs}
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: divider
// ─────────────────────────────────────────────────────────────────────────────

const dividerSpec: SectionSpec<Record<string, never>> = {
	type: 'divider',
	label: 'Divider',
	paletteHint: 'Sparkle break between sections',
	defaultContent: {},
	editorFields: [],
	render() {
		return DIVIDER_HTML;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: banner (generic full-width — early-bird, thank-you, memories, etc.)
// ─────────────────────────────────────────────────────────────────────────────

type BannerContent = {
	accent: string;
	headline: string;
	body: string;
	bodySecondary?: string;
	kicker?: string;
	color: BannerColor;
	buttonLabel?: string;
	buttonHref?: string;
	afterButton?: string;
	closingLine?: string;
};

const bannerSpec: SectionSpec<BannerContent> = {
	type: 'banner',
	label: 'Banner',
	paletteHint: 'Full-width pink/cyan banner with optional button',
	defaultContent: {
		accent: 'New banner',
		headline: 'Headline goes here.',
		body: 'Body text. Newlines become line breaks. Use {{name}} or {{countdown}} for personalization.',
		bodySecondary: '',
		kicker: '',
		color: 'pink',
		buttonLabel: '',
		buttonHref: '',
		afterButton: '',
		closingLine: '',
	},
	editorFields: [
		{
			kind: 'select',
			key: 'color',
			label: 'Color',
			options: [
				{ value: 'pink', label: 'Pink' },
				{ value: 'cyan', label: 'Cyan' },
			],
		},
		{ kind: 'text', key: 'accent', label: 'Accent (top, small caps)' },
		{ kind: 'text', key: 'headline', label: 'Headline' },
		{
			kind: 'textarea',
			key: 'body',
			label: 'Body',
			rows: 4,
			placeholders: ['{{name}}', '{{countdown}}', '{{event_date}}', '{{venue}}'],
			hint: 'Newlines → line breaks. Inline HTML allowed.',
		},
		{
			kind: 'textarea',
			key: 'bodySecondary',
			label: 'Body (second paragraph, optional)',
			rows: 3,
		},
		{ kind: 'text', key: 'kicker', label: 'Kicker (italic, optional)' },
		{ kind: 'text', key: 'buttonLabel', label: 'Button label (optional)' },
		{ kind: 'text', key: 'buttonHref', label: 'Button URL (optional)' },
		{ kind: 'text', key: 'afterButton', label: 'Text after button (optional)' },
		{ kind: 'text', key: 'closingLine', label: 'Closing line in pink (optional)' },
	],
	render(content, ctx) {
		const color: BannerColor = content.color === 'cyan' ? 'cyan' : 'pink';
		const accentColor = bannerAccentColor(color);

		const headline = content.headline
			? `<p style="color: #ffffff; font-family: ${FONT}; font-size: 24px; font-weight: 900; line-height: 1.3; margin: 0 0 14px 0; letter-spacing: 0.5px;">${txt(content.headline, ctx)}</p>`
			: '';

		const bodyP = content.body
			? `<p style="color: rgba(255,255,255,0.85); font-family: ${FONT}; font-size: 15px; line-height: 1.65; margin: 0 0 ${content.bodySecondary || content.kicker || content.buttonLabel || content.afterButton || content.closingLine ? 14 : 0}px 0;">${body(content.body, ctx)}</p>`
			: '';

		const bodySecondaryP = content.bodySecondary
			? `<p style="color: rgba(255,255,255,0.75); font-family: ${FONT}; font-size: 15px; line-height: 1.7; margin: 0 0 ${content.kicker || content.buttonLabel || content.afterButton || content.closingLine ? 14 : 0}px 0;">${body(content.bodySecondary, ctx)}</p>`
			: '';

		const kickerP = content.kicker
			? `<p style="color: rgba(255,255,255,0.55); font-family: ${FONT}; font-size: 13px; line-height: 1.6; margin: 0 0 26px 0; font-style: italic;">${txt(content.kicker, ctx)}</p>`
			: '';

		const buttonHtml =
			content.buttonLabel && content.buttonHref
				? `<p style="margin: ${kickerP ? 0 : 18}px 0 ${content.afterButton || content.closingLine ? 18 : 0}px 0;">
				<a href="${txt(content.buttonHref, ctx)}" style="display: inline-block; padding: 14px 28px; background: #ff00ff; border-radius: 999px; color: #0a0012; font-family: ${FONT}; font-size: 13px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">${txt(content.buttonLabel, ctx)}</a>
			</p>`
				: '';

		const afterButtonP = content.afterButton
			? `<p style="color: rgba(255,255,255,0.55); font-family: ${FONT}; font-size: 12px; line-height: 1.6; margin: 0 0 ${content.closingLine ? 28 : 0}px 0;">${txt(content.afterButton, ctx)}</p>`
			: '';

		const closingLineP = content.closingLine
			? `<p style="color: ${accentColor}; font-family: ${FONT}; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; font-weight: 700; margin: ${afterButtonP ? 0 : 32}px 0 0 0;">${txt(content.closingLine, ctx)}</p>`
			: '';

		return `
		<tr>
			<td align="center" style="padding: 0;">
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${bannerWrapStyle(color)}">
					<tr>
						<td align="center" style="padding: 40px 40px;">
							<p style="color: ${accentColor}; font-family: ${FONT}; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 14px 0; font-weight: 700;">
								&#10022; ${txt(content.accent, ctx)} &#10022;
							</p>
							${headline}
							${bodyP}
							${bodySecondaryP}
							${kickerP}
							${buttonHtml}
							${afterButtonP}
							${closingLineP}
						</td>
					</tr>
				</table>
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: dj-lineup
// ─────────────────────────────────────────────────────────────────────────────

type DjLineupContent = { accent: string; headline: string; intro: string };

function renderDjCard(dj: DjEntry): string {
	const hasNote = Boolean(dj.note);
	const nameColor = dj.color === 'pink' ? '#ff00ff' : '#ffffff';

	const cardStyle = hasNote
		? 'padding: 24px 20px; background: linear-gradient(135deg, rgba(255,0,255,0.12), rgba(123,104,238,0.10)); border: 1px solid rgba(255,0,255,0.5); border-radius: 14px;'
		: 'padding: 22px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px;';

	const nameStyle = hasNote
		? `margin: 0; font-family: ${FONT}; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; color: ${nameColor}; opacity: 0.85;`
		: `margin: 0; font-family: ${FONT}; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; color: ${nameColor};`;

	const accent = hasNote
		? `<p style="margin: 0 0 10px 0; color: #ff9df2; font-family: ${FONT}; font-size: 10px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">&#10022; Sending love &#10022;</p>`
		: '';

	const listen = dj.url
		? `<p style="margin: 14px 0 0 0;"><a href="${dj.url}" style="display: inline-block; padding: 10px 20px; background: rgba(255,0,255,0.12); border: 1px solid rgba(255,0,255,0.5); border-radius: 999px; color: #ffffff; font-family: ${FONT}; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">Listen on SoundCloud &rarr;</a></p>`
		: `<p style="margin: 14px 0 0 0; color: rgba(255,255,255,0.45); font-family: ${FONT}; font-size: 12px; font-style: italic; letter-spacing: 0.5px;">Catch them live on the floor</p>`;

	const noteBlock = dj.note
		? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 18px 0 0 0;">
				<tr>
					<td align="center" style="padding: 16px 18px; background: rgba(255,0,255,0.1); border: 1px dashed rgba(255,0,255,0.5); border-radius: 12px;">
						<p style="margin: 0; color: #ffffff; font-family: ${FONT}; font-size: 14px; line-height: 1.55; font-weight: 500;">${dj.note}</p>
					</td>
				</tr>
			</table>`
		: '';

	return `
		<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 14px 0;">
			<tr>
				<td align="center" style="${cardStyle}">
					${accent}
					<p style="${nameStyle}">${escapeHtml(dj.name)}</p>
					${listen}
					${noteBlock}
				</td>
			</tr>
		</table>`;
}

const djLineupSpec: SectionSpec<DjLineupContent> = {
	type: 'dj-lineup',
	label: 'DJ Lineup',
	paletteHint: 'Banner intro + DJ cards from the code-defined list',
	defaultContent: {
		accent: 'On the decks',
		headline: 'Meet your DJs.',
		intro:
			'Here’s who you’ll be dancing with on Friday night. Tap a name to hear what they’ve been cooking.',
	},
	editorFields: [
		{ kind: 'text', key: 'accent', label: 'Accent' },
		{ kind: 'text', key: 'headline', label: 'Headline' },
		{ kind: 'textarea', key: 'intro', label: 'Intro paragraph', rows: 3 },
	],
	render(content, ctx) {
		const cards = ctx.djLineup.map(renderDjCard).join('');
		return `
		<tr>
			<td align="center" style="padding: 0;">
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${bannerWrapStyle('pink')}">
					<tr>
						<td align="center" style="padding: 40px 32px;">
							<p style="color: #ff00ff; font-family: ${FONT}; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 14px 0; font-weight: 700;">
								&#10022; ${txt(content.accent, ctx)} &#10022;
							</p>
							<p style="color: #ffffff; font-family: ${FONT}; font-size: 24px; font-weight: 900; line-height: 1.25; margin: 0 0 14px 0; letter-spacing: 0.5px;">
								${txt(content.headline, ctx)}
							</p>
							<p style="color: rgba(255,255,255,0.85); font-family: ${FONT}; font-size: 15px; line-height: 1.65; margin: 0 0 26px 0;">
								${body(content.intro, ctx)}
							</p>
							${cards}
						</td>
					</tr>
				</table>
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: essentials
// ─────────────────────────────────────────────────────────────────────────────

type EssentialsContent = {
	label: string;
	whenLabel: string;
	whenValue: string;
	whereLabel: string;
	whereValue: string;
	dressLabel: string;
	dressValue: string;
	bringLabel: string;
	bringValue: string;
};

const essentialsSpec: SectionSpec<EssentialsContent> = {
	type: 'essentials',
	label: 'Essentials',
	paletteHint: 'When / where / dress / bring (Where auto-links to map)',
	defaultContent: {
		label: 'The essentials',
		whenLabel: 'When',
		whenValue: '24.04.2026 — 18:00',
		whereLabel: 'Where',
		whereValue: 'DAKS · Spittelauerlände 12, Vienna',
		dressLabel: 'Dress code',
		dressValue: 'Reflective. Shimmer. Shine.',
		bringLabel: 'Bring',
		bringValue: 'Your QR ticket · your sparkle',
	},
	editorFields: [
		{ kind: 'text', key: 'label', label: 'Section label (top, small caps)' },
		{ kind: 'text', key: 'whenLabel', label: 'Row 1 label' },
		{ kind: 'text', key: 'whenValue', label: 'Row 1 value', placeholders: ['{{event_date}}', '{{event_time}}'] },
		{ kind: 'text', key: 'whereLabel', label: 'Row 2 label' },
		{ kind: 'text', key: 'whereValue', label: 'Row 2 value (auto-links to map)' },
		{ kind: 'text', key: 'dressLabel', label: 'Row 3 label' },
		{ kind: 'text', key: 'dressValue', label: 'Row 3 value' },
		{ kind: 'text', key: 'bringLabel', label: 'Row 4 label' },
		{ kind: 'text', key: 'bringValue', label: 'Row 4 value' },
	],
	render(content, ctx) {
		const row = (label: string, value: string, last = false, link?: string) => {
			const border = last ? '' : 'border-bottom: 1px solid rgba(255,255,255,0.08);';
			const valueHtml = link
				? `<a href="${link}" style="color: #ffffff; text-decoration: none; border-bottom: 1px solid rgba(255,0,255,0.5);">${txt(value, ctx)}</a>`
				: txt(value, ctx);
			return `
				<tr>
					<td style="padding: 12px 0; ${border} color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; width: 110px;">${txt(label, ctx)}</td>
					<td style="padding: 12px 0; ${border} color: #ffffff; font-size: 15px; font-weight: 700;">${valueHtml}</td>
				</tr>`;
		};
		return `
		<tr>
			<td align="center" style="padding: 0 40px;">
				<p style="color: rgba(255,255,255,0.45); font-family: ${FONT}; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 18px 0;">
					${txt(content.label, ctx)}
				</p>
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="text-align: left; font-family: ${FONT};">
					${row(content.whenLabel, content.whenValue)}
					${row(content.whereLabel, content.whereValue, false, ctx.mapUrl)}
					${row(content.dressLabel, content.dressValue)}
					${row(content.bringLabel, content.bringValue, true)}
				</table>
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: share
// ─────────────────────────────────────────────────────────────────────────────

type ShareContent = {
	accent: string;
	headline: string;
	body: string;
	kicker: string;
	buttonLabel: string;
};

const shareSpec: SectionSpec<ShareContent> = {
	type: 'share',
	label: 'Share',
	paletteHint: 'Pass-it-on banner with WhatsApp + Telegram/X/Email links',
	defaultContent: {
		accent: 'Pass it on',
		headline: 'Someone coming to mind?',
		body: 'If there’s a friend who’d glitter beautifully beside you that night,\n or someone in your life who could use a little light right now — send the invite their way, with our love.',
		kicker: 'More sparkles, more love',
		buttonLabel: 'Share the invite',
	},
	editorFields: [
		{ kind: 'text', key: 'accent', label: 'Accent' },
		{ kind: 'text', key: 'headline', label: 'Headline' },
		{ kind: 'textarea', key: 'body', label: 'Body', rows: 3 },
		{ kind: 'text', key: 'kicker', label: 'Kicker (italic)' },
		{ kind: 'text', key: 'buttonLabel', label: 'Primary button label' },
	],
	render(content, ctx) {
		return `
		<tr>
			<td align="center" style="padding: 0;">
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${bannerWrapStyle('pink')}">
					<tr>
						<td align="center" style="padding: 40px 40px;">
							<p style="color: #ff00ff; font-family: ${FONT}; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 14px 0; font-weight: 700;">
								&#10022; ${txt(content.accent, ctx)} &#10022;
							</p>
							<p style="color: #ffffff; font-family: ${FONT}; font-size: 24px; font-weight: 900; line-height: 1.25; margin: 0 0 14px 0; letter-spacing: 0.5px;">
								${txt(content.headline, ctx)}
							</p>
							<p style="color: rgba(255,255,255,0.85); font-family: ${FONT}; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
								${body(content.body, ctx)}
							</p>
							<p style="color: rgba(255,255,255,0.55); font-family: ${FONT}; font-size: 13px; line-height: 1.6; margin: 0 0 26px 0; font-style: italic;">
								${txt(content.kicker, ctx)}
							</p>
							<p style="margin: 0 0 18px 0;">
								<a href="${ctx.shareUrls.whatsapp}" style="display: inline-block; padding: 14px 28px; background: #ff00ff; border-radius: 999px; color: #0a0012; font-family: ${FONT}; font-size: 13px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">
									${txt(content.buttonLabel, ctx)}
								</a>
							</p>
							<p style="color: rgba(255,255,255,0.5); font-family: ${FONT}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
								<a href="${ctx.shareUrls.telegram}" style="color: rgba(255,255,255,0.75); text-decoration: none; border-bottom: 1px solid rgba(255,0,255,0.5); padding-bottom: 2px;">Telegram</a>
								<span style="color: rgba(255,255,255,0.25); padding: 0 10px;">&middot;</span>
								<a href="${ctx.shareUrls.twitter}" style="color: rgba(255,255,255,0.75); text-decoration: none; border-bottom: 1px solid rgba(255,0,255,0.5); padding-bottom: 2px;">X</a>
								<span style="color: rgba(255,255,255,0.25); padding: 0 10px;">&middot;</span>
								<a href="${ctx.shareUrls.email}" style="color: rgba(255,255,255,0.75); text-decoration: none; border-bottom: 1px solid rgba(255,0,255,0.5); padding-bottom: 2px;">Email</a>
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: signature
// ─────────────────────────────────────────────────────────────────────────────

type SignatureContent = { line1: string; line2: string };

const signatureSpec: SectionSpec<SignatureContent> = {
	type: 'signature',
	label: 'Signature',
	paletteHint: 'Italic line + pink uppercase signoff',
	defaultContent: {
		line1: 'See you on the floor.',
		line2: '— with love, your Glitter Me Softly Team',
	},
	editorFields: [
		{ kind: 'text', key: 'line1', label: 'Italic line' },
		{ kind: 'text', key: 'line2', label: 'Signoff (renders pink, uppercase)' },
	],
	render(content, ctx) {
		return `
		<tr>
			<td align="center" style="padding: 40px 40px 48px 40px;">
				<p style="color: rgba(255,255,255,0.7); font-family: ${FONT}; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0; font-style: italic;">
					${txt(content.line1, ctx)}
				</p>
				<p style="color: #ff00ff; font-family: ${FONT}; font-size: 13px; letter-spacing: 4px; text-transform: uppercase; font-weight: 700; margin: 0;">
					${txt(content.line2, ctx)}
				</p>
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Section: footer-map
// ─────────────────────────────────────────────────────────────────────────────

type FooterMapContent = {
	label: string;
	address: string;
	buttonLabel: string;
	tagline: string;
};

const footerMapSpec: SectionSpec<FooterMapContent> = {
	type: 'footer-map',
	label: 'Footer (map)',
	paletteHint: '"Find us here" + Google Maps button + closing tagline',
	defaultContent: {
		label: 'Find us here',
		address: 'DAKS · Spittelauerlände 12, 1090 Vienna',
		buttonLabel: '✦ Open in Google Maps →',
		tagline: 'The more you shine, the more you belong.',
	},
	editorFields: [
		{ kind: 'text', key: 'label', label: 'Eyebrow label' },
		{ kind: 'text', key: 'address', label: 'Address' },
		{ kind: 'text', key: 'buttonLabel', label: 'Map button label' },
		{ kind: 'text', key: 'tagline', label: 'Closing tagline' },
	],
	render(content, ctx) {
		return `
		<tr>
			<td align="center" style="padding: 32px 32px 40px 32px; border-top: 1px solid rgba(255,255,255,0.06);">
				<p style="color: rgba(255,255,255,0.4); font-family: ${FONT}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 12px 0;">
					${txt(content.label, ctx)}
				</p>
				<p style="color: #ffffff; font-family: ${FONT}; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
					${txt(content.address, ctx)}
				</p>
				<p style="margin: 0 0 28px 0;">
					<a href="${ctx.mapUrl}" style="display: inline-block; padding: 12px 22px; background: rgba(255,0,255,0.15); border: 1px solid rgba(255,0,255,0.5); border-radius: 999px; color: #ffffff; font-family: ${FONT}; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">
						${txt(content.buttonLabel, ctx)}
					</a>
				</p>
				<p style="color: rgba(255,255,255,0.35); font-family: ${FONT}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
					${txt(content.tagline, ctx)}
				</p>
			</td>
		</tr>`;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

export const SECTIONS: Record<SectionType, SectionSpec<Record<string, unknown>>> = {
	header: headerSpec as SectionSpec<Record<string, unknown>>,
	countdown: countdownSpec as SectionSpec<Record<string, unknown>>,
	lookback: lookbackSpec as SectionSpec<Record<string, unknown>>,
	greeting: greetingSpec as SectionSpec<Record<string, unknown>>,
	divider: dividerSpec as SectionSpec<Record<string, unknown>>,
	banner: bannerSpec as SectionSpec<Record<string, unknown>>,
	'dj-lineup': djLineupSpec as SectionSpec<Record<string, unknown>>,
	essentials: essentialsSpec as SectionSpec<Record<string, unknown>>,
	share: shareSpec as SectionSpec<Record<string, unknown>>,
	signature: signatureSpec as SectionSpec<Record<string, unknown>>,
	'footer-map': footerMapSpec as SectionSpec<Record<string, unknown>>,
};

export const SECTION_ORDER: readonly SectionType[] = [
	'header',
	'countdown',
	'lookback',
	'greeting',
	'divider',
	'banner',
	'dj-lineup',
	'essentials',
	'share',
	'signature',
	'footer-map',
];

// Lightweight metadata exposed to client components (no render fns).
export type SectionMeta = {
	type: SectionType;
	label: string;
	paletteHint: string;
	defaultContent: Record<string, unknown>;
	editorFields: readonly EditorField[];
};

export function sectionMeta(type: SectionType): SectionMeta {
	const s = SECTIONS[type];
	return {
		type,
		label: s.label,
		paletteHint: s.paletteHint,
		defaultContent: s.defaultContent,
		editorFields: s.editorFields,
	};
}

export function allSectionMeta(): SectionMeta[] {
	return SECTION_ORDER.map(sectionMeta);
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML wrapper (DOCTYPE → outer card)
// ─────────────────────────────────────────────────────────────────────────────

export function wrapHtml(innerRows: string): string {
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

// ─────────────────────────────────────────────────────────────────────────────
// Default seeded templates — current copy, expressed as section JSON
// ─────────────────────────────────────────────────────────────────────────────

export type TemplateRow = {
	slug: string;
	name: string;
	description: string;
	subject: string;
	sections: Section[];
};

let seedCounter = 0;
function sid(): string {
	seedCounter += 1;
	return `seed-${seedCounter.toString(36)}`;
}

export const DEFAULT_TEMPLATES: TemplateRow[] = [
	{
		slug: 'earlyBird',
		name: 'Early-bird invite',
		description: 'Countdown · come early for free drinks · share',
		subject: '✦ {{countdown}} — come dance with us',
		sections: [
			{ id: sid(), type: 'header', content: { ...headerSpec.defaultContent } },
			{ id: sid(), type: 'countdown', content: { ...countdownSpec.defaultContent } },
			{
				id: sid(),
				type: 'greeting',
				content: {
					greeting: 'Hey {{name}} ✦',
					paragraphs: [
						'We can’t wait to see you. Truly — we are <em style="color: #ff9df2;">so</em> looking forward to this, and the thought of <strong style="color: #ff00ff;">dancing together</strong> under the glitter is what’s keeping us going this week.',
						'Bring your shine. Bring your people’s energy. We’ll bring the rest.',
					],
				},
			},
			{ id: sid(), type: 'divider', content: {} },
			{
				id: sid(),
				type: 'banner',
				content: {
					accent: 'Little secret',
					headline: 'Come early — drinks are on us.',
					body: 'The first arrivals get a <strong style="color: #ff9df2;">free welcome drink</strong> and the best spot on the dancefloor. Doors open at <strong>18:00</strong> — slide in right then, skip the queue, and start the night with a glass in hand.',
					bodySecondary: '',
					kicker: '',
					color: 'pink',
					buttonLabel: '',
					buttonHref: '',
					afterButton: '',
					closingLine: '',
				},
			},
			{ id: sid(), type: 'divider', content: {} },
			{ id: sid(), type: 'essentials', content: { ...essentialsSpec.defaultContent } },
			{ id: sid(), type: 'divider', content: {} },
			{ id: sid(), type: 'share', content: { ...shareSpec.defaultContent } },
			{ id: sid(), type: 'signature', content: { ...signatureSpec.defaultContent } },
			{ id: sid(), type: 'footer-map', content: { ...footerMapSpec.defaultContent } },
		],
	},
	{
		slug: 'djLineup',
		name: 'DJ lineup',
		description: 'Meet the DJs · SoundCloud links · warm-up',
		subject: '✦ Meet your DJs — {{countdown}}',
		sections: [
			{ id: sid(), type: 'header', content: { ...headerSpec.defaultContent } },
			{ id: sid(), type: 'countdown', content: { ...countdownSpec.defaultContent } },
			{
				id: sid(),
				type: 'greeting',
				content: {
					greeting: 'Hey {{name}} ✦',
					paragraphs: [
						'The lineup is locked, the records are chosen, and we are <em style="color: #ff9df2;">buzzing</em>. These humans are bringing their love to the floor — different flavours of the same feeling: <strong style="color: #ff00ff;">techno, house, everything</strong> that makes the body forget it was ever tired.',
						'Take a listen below, pick a favourite, and come in already warmed up.',
					],
				},
			},
			{ id: sid(), type: 'divider', content: {} },
			{ id: sid(), type: 'dj-lineup', content: { ...djLineupSpec.defaultContent } },
			{ id: sid(), type: 'divider', content: {} },
			{ id: sid(), type: 'essentials', content: { ...essentialsSpec.defaultContent } },
			{ id: sid(), type: 'divider', content: {} },
			{ id: sid(), type: 'share', content: { ...shareSpec.defaultContent } },
			{ id: sid(), type: 'signature', content: { ...signatureSpec.defaultContent } },
			{ id: sid(), type: 'footer-map', content: { ...footerMapSpec.defaultContent } },
		],
	},
	{
		slug: 'thankYou',
		name: 'Thank you (post-event)',
		description: 'Look back · gratitude · dancing, laughing, glitter & love',
		subject: '✦ Thank you for last night — what a night of glitter & love',
		sections: [
			{ id: sid(), type: 'header', content: { ...headerSpec.defaultContent } },
			{ id: sid(), type: 'lookback', content: { ...lookbackSpec.defaultContent } },
			{
				id: sid(),
				type: 'greeting',
				content: {
					greeting: 'Hey {{name}} ✦',
					paragraphs: [
						'We’re still glowing. Last night was everything we hoped for and somehow more — and that was <em style="color: #ff9df2;">entirely</em> because of you.',
						'Every glitter on the floor, every laugh that bounced off the walls, every body that moved like the world had stopped existing — that was you.',
						'We’ve spent the morning replaying the music and trying to find the words. There aren’t quite enough.',
					],
				},
			},
			{ id: sid(), type: 'divider', content: {} },
			{
				id: sid(),
				type: 'banner',
				content: {
					accent: 'From all of us',
					headline: 'Thank you for the dancing, the laughing, and all that love.',
					body: 'Thank you for showing up dressed in light. For dancing through every set without sitting down. For laughing so loud the walls remembered. For sharing your <strong style="color: #ff9df2;">glitter</strong>, your hugs, your weird, your wonderful.',
					bodySecondary: 'We’ll be remembering this one for a long, long time. ✦',
					kicker: '',
					color: 'pink',
					buttonLabel: '',
					buttonHref: '',
					afterButton: '',
					closingLine: '',
				},
			},
			{
				id: sid(),
				type: 'banner',
				content: {
					accent: 'One little favour',
					headline: 'Got photos or videos from the night?',
					body: 'If you captured anything — a blurry dance move, a glitter close-up, that one perfect moment — we’d <em style="color: #ff9df2;">love</em> to see it.',
					bodySecondary:
						'Send it our way and we’ll collect the memories together — the more eyes on the night, the better we get to remember it.',
					kicker: '',
					color: 'pink',
					buttonLabel: 'Share your memories',
					buttonHref:
						'mailto:hugs@glitter-me-softly.skin?subject=' +
						encodeURIComponent('✦ Memories from the night ✦') +
						'&body=' +
						encodeURIComponent('Hi! Attaching some photos / videos from Glitter Me Softly — feel free to share. ✦\n\n'),
					afterButton: 'Or just reply to this email — attachments welcome.',
					closingLine: '— with love, your Glitter Me Softly Team ✦',
				},
			},
		],
	},
];
