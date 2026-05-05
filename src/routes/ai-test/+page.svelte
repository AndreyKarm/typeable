<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import toast from 'svelte-5-french-toast';

	onMount(async () => {
		try {
			// Send a POST request to the server to generate an exercise
			const res = await fetch('/api/generate-exercise', { method: 'POST' });
			// Check if the response is successful
			const data = await res.json();

			// If the response is successful, navigate to the exercise page
			if (data.exerciseId) {
				goto(resolve(`/exercise/${data.exerciseId}`));
			}
		} catch (e) {
			toast.error('Failed to generate exercise');
			console.error('Failed to generate exercise', e);
		}
	});
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
