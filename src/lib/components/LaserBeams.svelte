<div class="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-30">
	{#each Array(8) as _, i}
		<div
			class="absolute top-0 left-1/2 w-0.5 h-[150%] origin-top blur-xs"
			style="
				--i: {i};
				background: linear-gradient(to bottom, transparent, hsl({i * 45}, 100%, 60%), transparent);
				animation: sweep 4s ease-in-out infinite alternate;
				animation-delay: calc({i} * -0.5s);
				box-shadow: 0 0 10px hsl({i * 45}, 100%, 60%), 0 0 30px hsl({i * 45}, 100%, 60%);
			"
		></div>
	{/each}
</div>

<style>
	@keyframes sweep {
		0% { transform: rotate(-60deg); }
		100% { transform: rotate(60deg); }
	}
</style>
