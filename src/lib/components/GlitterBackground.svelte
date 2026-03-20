<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		let particles: Particle[] = [];
		let animationId: number;

		interface Particle {
			x: number;
			y: number;
			size: number;
			speedX: number;
			speedY: number;
			opacity: number;
			color: string;
			rotation: number;
			rotationSpeed: number;
		}

		const colors = [
			'#ff00ff', '#ff69b4', '#ffb6c1', '#ffd700', '#ff1493',
			'#00ffff', '#7b68ee', '#ff6ec7', '#fff', '#c0c0ff',
			'#ffc0cb', '#e0b0ff', '#ff00ff', '#00ff88', '#ffdf00'
		];

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}

		function createParticle(): Particle {
			return {
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height - canvas.height,
				size: Math.random() * 2 + 1,
				speedX: (Math.random() - 0.5) * 2,
				speedY: Math.random() * 1 + 0.5,
				opacity: Math.random() * 0.8 + 0.2,
				color: colors[Math.floor(Math.random() * colors.length)],
				rotation: Math.random() * 360,
				rotationSpeed: (Math.random() - 0.5) * 10
			};
		}

		function init() {
			for (let i = 0; i < 50; i++) {
				const p = createParticle();
				p.y = Math.random() * canvas.height;
				particles.push(p);
			}
		}

		function animate() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5;
				p.y += p.speedY;
				p.rotation += p.rotationSpeed;

				if (p.y > canvas.height + 10) {
					particles[i] = createParticle();
					continue;
				}

				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate((p.rotation * Math.PI) / 180);
				ctx.globalAlpha = p.opacity;

				ctx.fillStyle = p.color;
				ctx.shadowBlur = p.size * 3;
				ctx.shadowColor = p.color;
				ctx.beginPath();

				if (Math.random() > 0.5) {
					ctx.moveTo(0, -p.size);
					ctx.lineTo(p.size * 0.6, 0);
					ctx.lineTo(0, p.size);
					ctx.lineTo(-p.size * 0.6, 0);
				} else {
					ctx.arc(0, 0, p.size, 0, Math.PI * 2);
				}
				ctx.closePath();
				ctx.fill();

				ctx.restore();
			}

			animationId = requestAnimationFrame(animate);
		}

		resize();
		init();
		animate();

		window.addEventListener('resize', resize);

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resize);
		};
	});
</script>

<canvas bind:this={canvas} class="fixed inset-0 w-full h-full pointer-events-none z-1"></canvas>
