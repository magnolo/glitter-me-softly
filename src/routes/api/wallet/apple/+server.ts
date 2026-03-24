import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// TODO: To generate Apple Wallet passes you need:
// 1. Apple Developer account with Pass Type ID certificate
// 2. Install: npm install passkit-generator
// 3. Place your .p12 certificate and WWDR certificate in a secure location
// 4. Set env vars: APPLE_PASS_TYPE_ID, APPLE_TEAM_ID, APPLE_PASS_CERT_PATH, APPLE_PASS_CERT_PASSWORD

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Missing registration ID' }, { status: 400 });
	}

	// Stub: return instructions until Apple Wallet is configured
	return json(
		{
			error: 'Apple Wallet pass generation is not yet configured.',
			setup: [
				'1. Create a Pass Type ID at developer.apple.com',
				'2. Generate and download the signing certificate (.p12)',
				'3. Install passkit-generator: npm install passkit-generator',
				'4. Set environment variables for certificate paths and passwords',
				'5. Implement pass generation in this endpoint',
			],
		},
		{ status: 501 }
	);

	// Example implementation with passkit-generator:
	//
	// import { PKPass } from "passkit-generator";
	//
	// const pass = new PKPass({}, {
	//   wwdr: fs.readFileSync("certs/wwdr.pem"),
	//   signerCert: fs.readFileSync("certs/signerCert.pem"),
	//   signerKey: fs.readFileSync("certs/signerKey.pem"),
	//   signerKeyPassphrase: process.env.APPLE_PASS_CERT_PASSWORD,
	// }, {
	//   serialNumber: id,
	//   description: "Glitter Me Softly Ticket",
	//   organizationName: "Glitter Me Softly",
	//   passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
	//   teamIdentifier: process.env.APPLE_TEAM_ID,
	// });
	//
	// pass.type = "eventTicket";
	// pass.primaryFields.push({ key: "event", label: "EVENT", value: "Glitter Me Softly" });
	// pass.secondaryFields.push({ key: "date", label: "DATE", value: "24.04.2026" });
	// pass.secondaryFields.push({ key: "location", label: "LOCATION", value: "DAKS, Vienna" });
	//
	// const buffer = pass.getAsBuffer();
	// return new Response(buffer, {
	//   headers: {
	//     "Content-Type": "application/vnd.apple.pkpass",
	//     "Content-Disposition": `attachment; filename=glitter-me-softly-${id}.pkpass`,
	//   },
	// });
};
