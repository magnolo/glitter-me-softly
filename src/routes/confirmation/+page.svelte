<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import QRCode from 'qrcode';

	let registration: any = $state(null);
	let qrDataUrl = $state('');
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		const id = $page.url.searchParams.get('id');
		if (!id) {
			error = 'No registration ID found.';
			loading = false;
			return;
		}

		const { data, error: fetchError } = await supabase
			.from('registrations')
			.select('*')
			.eq('id', id)
			.single();

		if (fetchError || !data) {
			error = 'Registration not found.';
			loading = false;
			return;
		}

		registration = data;

		const qrPayload = JSON.stringify({
			event: 'Glitter Me Softly',
			id: data.id,
			name: data.name,
			email: data.email,
		});

		qrDataUrl = await QRCode.toDataURL(qrPayload, {
			width: 300,
			margin: 2,
			color: {
				dark: '#fff',
				light: '#0a0012'
			},
			errorCorrectionLevel: 'M'
		});

		loading = false;
	});
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-5 pt-10 pb-20">
	{#if loading}
		<div class="text-center text-text-muted">
			<div class="w-12 h-12 border-3 border-neon-pink/20 border-t-neon-pink rounded-full animate-spinner mx-auto mb-4"></div>
			<p>Loading your ticket...</p>
		</div>
	{:else if error}
		<div class="card text-center max-w-125 rounded-2xl p-10">
			<h2 class="text-3xl mb-3 text-red-400">Oops!</h2>
			<p class="mb-6 text-text-muted">{error}</p>
			<a href="/register" class="btn-glow btn-glow-base inline-block px-12 py-4 no-underline">
				Try Again
			</a>
		</div>
	{:else if registration}
		<div class="ticket max-w-125 w-full text-center rounded-2xl p-10 relative overflow-hidden">
			<!-- <div class="ticket-shine"></div> -->

			<div class="relative z-1 mb-8">
				<p class="text-lg neon-text font-bold uppercase tracking-[4px] mb-2 animate-pulse-glow">You're in!</p>
				<h1 class="neon-text text-[2.2rem] mb-1">Glitter Me Softly</h1>
				<p class="text-text-muted text-sm tracking-[2px] uppercase">Your QR Ticket</p>
			</div>

			<div class="relative z-1 mb-8">
				<div class="inline-block p-4 bg-neon-pink/5 border border-neon-pink/30 rounded-2xl animate-qr-pulse">
					<img src={qrDataUrl} alt="QR Code Ticket" class="block rounded-lg [image-rendering:pixelated]" />
				</div>
				<p class="mt-3 text-text-muted text-sm tracking-[1px]">Show this at the door</p>
			</div>

			<div class="relative z-1 text-left mb-8 border-t border-dashed border-neon-pink/20 pt-6">
				<div class="ticket-row">
					<span class="ticket-label">Guest</span>
					<span class="font-semibold">{registration.name}</span>
				</div>
				<div class="ticket-row">
					<span class="ticket-label">Email</span>
					<span class="font-semibold">{registration.email}</span>
				</div>
				{#if registration.plus_one}
					<div class="ticket-row">
						<span class="ticket-label">+1</span>
						<span class="font-semibold">{registration.plus_one_name || 'Yes'}</span>
					</div>
				{/if}
				<div class="ticket-row">
					<span class="ticket-label text-muted-foreground">Date</span>
					<span class="text-foreground font-semibold">April 24th, 2026 @ 8 PM</span>
				</div>
			</div>

			<div class="relative z-1 border-t border-dashed border-neon-pink/20 pt-6">
				<p class="text-text-muted text-sm mb-4">Screenshot this ticket or save the QR code</p>
				<button
					class="btn-glow btn-glow-base py-3 px-8 text-sm"
					onclick={() => downloadQR()}
				>
					Download QR Code
				</button>
			</div>
		</div>

		<a href="/" class="mt-8 text-sm text-text-muted hover:text-neon-cyan transition-colors duration-300">
			Back to Home
		</a>
	{/if}
</div>

<script lang="ts" module>
	function downloadQR() {
		const link = document.createElement('a');
		const img = document.querySelector('[alt="QR Code Ticket"]') as HTMLImageElement;
		if (img) {
			link.download = 'glitter-me-softly-ticket.png';
			link.href = img.src;
			link.click();
		}
	}
</script>

<style>
	/* .ticket-shine {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: conic-gradient(from 0deg, transparent, rgba(255,0,255,0.03), transparent, rgba(0,255,255,0.03), transparent);
		animation: ticket-shine 6s linear infinite;
	} */

	/* @keyframes ticket-shine {
		to { transform: rotate(360deg); }
	} */
</style>
