<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';

	let { data }: { data: PageData } = $props();
	let search = $state('');

	// Filter by name
	const filteredLeaderboard = $derived(
		data.leaderboard.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
	);
</script>

<div class="container">
	<h1>Leaderboard</h1>

	<div class="panel">
		<Icon icon="carbon:search" width="24" />
		<input type="text" bind:value={search} placeholder="Search players..." />
	</div>

	<table class="leaderboard-table">
		<thead>
			<tr>
				<th>#</th>
				<th>Player</th>
				<th>XP</th>
				<th>Avg WPM</th>
				<th>Streak</th>
			</tr>
		</thead>
		<tbody>
			{#each filteredLeaderboard as player, index (player.userId)}
				<tr class:highlight={index < 3}>
					<td>{index + 1}</td>
					<td>{player.name}</td>
					<td>{player.xp}</td>
					<td>{player.avgWpm}</td>
					<td>{player.streak} 🔥</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.container {
		width: 90%;
		margin: 2rem auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.panel {
		background: var(--card-bg);
		padding: 1rem;
		border-radius: 0.5rem;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	input {
		background: transparent;
		border: none;
		color: white;
		width: 100%;
	}

	.leaderboard-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--card-bg);
		border-radius: 0.5rem;
	}

	th,
	td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid var(--bg-color);
	}

	.highlight {
		background: rgba(137, 180, 250, 0.1);
		font-weight: bold;
	}
</style>
