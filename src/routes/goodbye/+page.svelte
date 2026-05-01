<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="container">
	<div class="goodbye-card">
		<h1>Account Deleted</h1>
		<p>
			We're sorry to see you go. Your account and all associated data have been permanently removed
			from Typeable.
		</p>
		<p>Thank you for being part of our community!</p>

		<div class="actions">
			<a href={resolve('/')} class="btn-primary">Return Home</a>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 80vh;
	}

	.goodbye-card {
		background: var(--card-bg);
		padding: 3rem;
		border-radius: 1rem;
		text-align: center;
		max-width: 450px;
		width: 90%;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	}

	h1 {
		margin: 0;
		color: var(--accent);
	}

	p {
		color: var(--text-muted);
		margin: 0;
	}

	.actions {
		margin-top: 1rem;
	}

	.btn-primary {
		background: var(--accent);
		color: var(--bg-color);
		padding: 0.8rem 2rem;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 700;
		text-transform: uppercase;
		transition: transform 0.2s;
		display: inline-block;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		filter: brightness(1.1);
	}
</style>
