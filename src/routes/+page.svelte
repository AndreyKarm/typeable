<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="container">
	<!-- Hero Section -->
	<section class="hero">
		<h1>Master Your <span class="accent">Keyboard.</span></h1>
		<p class="subtitle">
			Typeable is the minimalist typing platform designed for speed, accuracy, and community-driven
			content.
		</p>
		<div class="cta-group">
			<a href={resolve('/exercise')} class="button primary"> Start Practicing </a>
			<a href={resolve('/leaderboard')} class="button secondary">View Leaderboard</a>
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

			<div class="feature-card">
				<div class="image-placeholder">
					<span>🤖</span>
				</div>
				<h3>AI Enchanced</h3>
				<p>Custom exercises made by AI personally for you.</p>
			</div>
		</div>
	</section>

	<section class="auth-actions">
		<a href={resolve('/login')} class="button secondary">Login</a>
		<a href={resolve('/register')} class="button primary">Register</a>
	</section>
</div>

<style>
	.container {
		height: 100%;
		gap: 6rem;
	}

	/* Hero */
	.hero {
		text-align: center;
	}

	h1 {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.accent {
		color: #89b4fa;
	}

	.cta-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	/* Buttons */
	.primary {
		background: #89b4fa;
		color: #11111b;
	}
	.secondary {
		background: #313244;
		color: #cdd6f4;
	}

	/* Features */
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

	.auth-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		padding-top: 2rem;
		border-top: 1px solid #313244;
	}

	.auth-actions .button {
		width: 12rem;
		height: 6rem;
		font-size: 1.4rem;
	}
</style>
