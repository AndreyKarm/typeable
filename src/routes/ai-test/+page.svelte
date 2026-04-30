<script>
	// This page will immediately redirect from server,
	// but this serves as a buffer while the AI is thinking
</script>

<div class="container">
	<div class="loader">
		<h2>Generating your personalized test...</h2>
		<p>Analyzing your recent mistakes to create a custom challenge.</p>
		<div class="spinner"></div>
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		text-align: center;
	}
	.spinner {
		margin: 2rem auto;
		width: 40px;
		height: 40px;
		border: 4px solid var(--surface);
		border-top: 4px solid var(--accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
