<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>Your account has been banned</h1>

	{#if data.reason}
		<div class="reason-box">
			<p><strong>Reason:</strong> {data.reason}</p>
		</div>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 80vh;
		text-align: center;
	}

	h1 {
		font-size: 2.5rem;
		color: var(--danger);
	}

	.reason-box {
		font-size: 2rem;
		padding: 1rem;
		max-width: 500px;
	}
</style>
