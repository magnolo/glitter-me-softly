<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import GlitterBackground from '$lib/components/GlitterBackground.svelte';
	import LaserBeams from '$lib/components/LaserBeams.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Glitter Me Softly - Rave Birthday Party</title>
	<meta name="description" content="You're invited to the most glittery rave birthday party ever!" />
</svelte:head>

<!-- <LaserBeams /> -->
<GlitterBackground />

<div class="relative z-2">
	{@render children()}
</div>
