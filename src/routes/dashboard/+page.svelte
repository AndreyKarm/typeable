<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	let { data } = $props();
</script>

<div class="container">
	<h1>Dashboard</h1>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div class="panel stat-card">
			<h3>Avg WPM</h3>
			<p class="value">{data.stats.avgWpm}</p>
		</div>
		<div class="panel stat-card">
			<h3>Streak</h3>
			<p class="value">{data.stats.streak} days</p>
		</div>
		<div class="panel stat-card">
			<h3>Total Typed</h3>
			<p class="value">{data.stats.totalTyped.toLocaleString()}</p>
		</div>
	</div>

	<!-- Recent Activity -->
	<div class="panel activity-panel">
		<h2>Recent Sessions</h2>
		<table>
			<thead>
				<tr>
					<th>Date</th>
					<th>WPM</th>
					<th>Accuracy</th>
				</tr>
			</thead>
			<tbody>
				{#each data.recentSessions as session (session.id)}
					<tr>
						<td>{new Date(session.createdAt).toLocaleDateString()}</td>
						<td class="accent">{session.wpm}</td>
						<td>{session.accuracy}%</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="actions">
		<button onclick={() => goto(resolve('/exercise'))}>Practice Now</button>
	</div>
</div>

<style>
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin: 2rem 0;
	}

	.stat-card {
		padding: 1.5rem;
		text-align: center;
	}

	.value {
		font-size: 2rem;
		font-weight: bold;
		color: var(--accent);
		margin: 0.5rem 0 0;
	}

	.activity-panel {
		padding: 1.5rem;
	}

	.actions {
		margin-top: 2rem;
		text-align: center;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}
	th,
	td {
		padding: 1rem;
		border-bottom: 1px solid var(--card-bg);
	}
	.accent {
		color: var(--accent);
		font-weight: bold;
	}
</style>
