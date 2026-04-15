<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<div class="container">
	<h1>{page.status}</h1>
	<p class="message">{page.error?.message ?? 'Error'}</p>
	<a href={resolve('/')} class="home-link">Return to homepage</a>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
	}

	h1 {
		font-size: clamp(4rem, 15vw, 8rem);
		margin: 0;
		color: var(--color-primary);
		line-height: 1;
	}

	.message {
		font-size: clamp(1.25rem, 4vw, 1.5rem);
		color: var(--color-gray);
		margin: 0;
	}

	.home-link {
		margin-top: 2rem;
		padding: 0.875rem 2rem;
		background-color: var(--color-primary);
		color: white;
		text-decoration: none;
		border-radius: 2rem;
		font-weight: 600;
		transition:
			transform 0.2s,
			filter 0.2s;
	}

	.home-link:hover {
		transform: translateY(-2px);
		filter: brightness(1.1);
	}
</style>
