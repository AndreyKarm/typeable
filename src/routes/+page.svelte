<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
</script>

<div class="landing-container">
	<!-- Hero Section -->
	<section class="hero">
		<h1>Master Your <span class="accent">Keyboard.</span></h1>
		<p class="subtitle">
			Typeable is the minimalist typing platform designed for speed, accuracy, and community-driven
			content.
		</p>
		<div class="cta-group">
			<button class="btn primary" onclick={() => goto(resolve('/exercise'))}>
				Start Practicing
			</button>
			<button class="btn secondary">View Leaderboard</button>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features">
		<h2>Why Typeable?</h2>

		<div class="feature-grid">
			<div class="feature-card">
				<div class="image-placeholder">
					<span>📊</span>
				</div>
				<h3>Real-time Analytics</h3>
				<p>Track your WPM, accuracy, and mistakes with detailed breakdown charts.</p>
			</div>

			<div class="feature-card">
				<div class="image-placeholder">
					<span>👥</span>
				</div>
				<h3>Community Content</h3>
				<p>Type on quotes, code snippets, and stories contributed by our users.</p>
			</div>

			<div class="feature-card">
				<div class="image-placeholder">
					<span>⚔️</span>
				</div>
				<h3>Competitive PvP</h3>
				<p>Challenge your friends in real-time typing races to see who is fastest.</p>
			</div>
		</div>
	</section>
</div>

<style>
	.landing-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		color: #cdd6f4;
		font-family: sans-serif;
	}

	/* Hero */
	.hero {
		text-align: center;
		padding: 6rem 0;
	}

	h1 {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.accent {
		color: #89b4fa;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #6c7086;
		max-width: 600px;
		margin: 0 auto 2rem;
	}

	.cta-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	/* Buttons */
	.btn {
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
		border: none;
		transition: transform 0.2s;
	}

	.btn:hover {
		transform: translateY(-2px);
	}

	.primary {
		background: #89b4fa;
		color: #11111b;
	}
	.secondary {
		background: #313244;
		color: #cdd6f4;
	}

	/* Features */
	.features {
		padding: 4rem 0;
	}
	.features h2 {
		text-align: center;
		margin-bottom: 3rem;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background: #181825;
		padding: 2rem;
		border-radius: 12px;
		text-align: center;
		border: 1px solid #313244;
	}

	.image-placeholder {
		width: 60px;
		height: 60px;
		background: #313244;
		margin: 0 auto 1rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}
</style>
