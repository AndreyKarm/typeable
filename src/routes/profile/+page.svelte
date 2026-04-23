<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const formatDate = (date: Date) =>
		new Intl.DateTimeFormat('en-GB', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
</script>

<div class="container">
	<h1>Profile</h1>
	<p class="subtitle">Welcome back, {data.user.name}</p>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div class="stat-card">
			<span>Average WPM</span>
			<strong>{Math.round(data.stats.avgWpm)}</strong>
		</div>
		<div class="stat-card">
			<span>Total Characters</span>
			<strong>{data.stats.totalTyped.toLocaleString()}</strong>
		</div>
		<div class="stat-card">
			<span>Current Streak</span>
			<strong>{data.stats.streak} days</strong>
		</div>
		<div class="stat-card">
			<span>XP</span>
			<strong>{data.stats.xp}</strong>
		</div>
	</div>

	<!-- Activity History -->
	<h3>Recent Activity</h3>
	<table class="history-table">
		<thead>
			<tr>
				<th>Date</th>
				<th>WPM</th>
				<th>Accuracy</th>
				<th>Content Preview</th>
			</tr>
		</thead>
		<tbody>
			{#each data.sessions as session (session.id)}
				<tr>
					<td>{formatDate(session.createdAt)}</td>
					<td>{session.wpm}</td>
					<td>{session.accuracy}%</td>
					<td class="preview">{session.exercise?.content.slice(0, 30)}...</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="empty">No typing sessions yet. Go practice!</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 2rem auto;
		color: var(--text-main);
		font-family: sans-serif;
	}
	h1 {
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #6c7086;
		margin-bottom: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		background: var(--card-bg);
		padding: 1.5rem;
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stat-card strong {
		font-size: 2rem;
		color: var(--accent);
	}

	.history-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--card-bg);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	th,
	td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid var(--bg-color);
	}
	.preview {
		color: #6c7086;
		font-size: 0.9rem;
	}
	.empty {
		text-align: center;
		color: #585b70;
		padding: 2rem;
	}
</style>
