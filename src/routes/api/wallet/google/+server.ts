import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// TODO: To generate Google Wallet passes you need:
// 1. Google Cloud project with Google Wallet API enabled
// 2. Service account with Wallet Object Creator role
// 3. Install: npm install google-auth-library
// 4. Set env vars: GOOGLE_WALLET_ISSUER_ID, GOOGLE_SERVICE_ACCOUNT_KEY

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return new Response(JSON.stringify({ error: 'Missing registration ID' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// Stub: return instructions until Google Wallet is configured
	return new Response(
		JSON.stringify({
			error: 'Google Wallet pass generation is not yet configured.',
			setup: [
				'1. Enable Google Wallet API in Google Cloud Console',
				'2. Create a service account with Wallet Object Creator role',
				'3. Create an Event Ticket class in the Google Pay & Wallet Console',
				'4. Install google-auth-library: npm install google-auth-library',
				'5. Set environment variables and implement JWT generation',
			],
		}),
		{ status: 501, headers: { 'Content-Type': 'application/json' } }
	);

	// Example implementation:
	//
	// import { GoogleAuth } from "google-auth-library";
	//
	// const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
	// const classId = `${issuerId}.glitter_me_softly`;
	// const objectId = `${issuerId}.ticket_${id}`;
	//
	// const eventTicketObject = {
	//   id: objectId,
	//   classId: classId,
	//   state: "ACTIVE",
	//   header: { defaultValue: { language: "en", value: "Glitter Me Softly" } },
	//   dateTime: {
	//     start: "2026-04-24T18:00:00+02:00",
	//     end: "2026-04-25T04:00:00+02:00",
	//   },
	//   venue: {
	//     name: { defaultValue: { language: "en", value: "DAKS" } },
	//     address: { defaultValue: { language: "en", value: "Spittelauerlände 12, Vienna" } },
	//   },
	//   barcode: {
	//     type: "QR_CODE",
	//     value: JSON.stringify({ event: "Glitter Me Softly", id }),
	//   },
	// };
	//
	// const claims = { iss: serviceAccountEmail, aud: "google", typ: "savetowallet", payload: { eventTicketObjects: [eventTicketObject] } };
	// const token = jwt.sign(claims, serviceAccountKey, { algorithm: "RS256" });
	// const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
	//
	// throw redirect(302, saveUrl);
};
