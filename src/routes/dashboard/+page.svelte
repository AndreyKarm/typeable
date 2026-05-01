<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data } = $props();

	// Calculate AI Test generation progress
	// Fallbacks provided in case these aren't returned from the server load yet
	let exercisesCompleted = $derived(data.stats.totalSessions ?? 0);
	let exercisesRequired = $derived(data.aiTestRequired ?? 10); // e.g. 10 exercises needed
	let exercisesRemaining = $derived(Math.max(0, exercisesRequired - exercisesCompleted));
	let progressPercent = $derived(Math.min(100, (exercisesCompleted / exercisesRequired) * 100));
	let isAiTestReady = $derived(exercisesRemaining === 0);
</script>

<div class="container">
	<div class="header">
		<h1>Dashboard</h1>
	</div>

	<!-- AI Test Progress Panel -->
	<div class="panel ai-panel">
		<div class="ai-header">
			<h2>Personalized AI Test</h2>
			{#if isAiTestReady}
				<span class="badge ready">Ready!</span>
			{:else}
				<span class="badge locked">{exercisesRemaining} more to go</span>
			{/if}
		</div>

		{#if isAiTestReady}
			<p class="ai-description">
				We've gathered enough data on your typing habits. Take your personalized AI test to target
				your weak spots!
			</p>
		{:else}
			<p class="ai-description">
				Complete {exercisesRemaining} more exercise{exercisesRemaining === 1 ? '' : 's'}
				to generate your personalized AI typing evaluation.
			</p>
		{/if}

		<div class="progress-bar">
			<div class="progress-fill" style="width: {progressPercent}%"></div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div class="panel stat-card">
			<h3>Avg WPM</h3>
			<p class="value">{data.stats.avgWpm ?? 0}</p>
		</div>
		<div class="panel stat-card">
			<h3>Highest WPM</h3>
			<p class="value">{data.stats.highestWpm ?? 0}</p>
		</div>
		<div class="panel stat-card">
			<h3>Avg Accuracy</h3>
			<p class="value">{data.stats.avgAccuracy ?? 0}%</p>
		</div>
		<div class="panel stat-card">
			<h3>Streak</h3>
			<p class="value">{data.stats.streak ?? 0} days</p>
		</div>
		<div class="panel stat-card">
			<h3>Total Sessions</h3>
			<p class="value">{data.stats.totalSessions ?? 0}</p>
		</div>
		<div class="panel stat-card">
			<h3>Total Typed</h3>
			<p class="value">{(data.stats.totalTyped ?? 0).toLocaleString()}</p>
		</div>
	</div>

	<!-- Recent Activity -->
	<div class="panel activity-panel">
		<h2>Recent Sessions</h2>
		{#if data.recentSessions?.length > 0}
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
		{:else}
			<p class="empty-state">No sessions recorded yet. Start typing!</p>
		{/if}
	</div>

	<div class="actions">
		<button onclick={() => goto(resolve('/exercise'))}>Practice Now</button>
		<button class="btn-ai" disabled={!isAiTestReady} onclick={() => goto(resolve('/ai-test'))}>
			Take AI Test
		</button>
	</div>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	/* AI Test Panel Styles */
	.ai-panel {
		padding: 1.5rem;
		background: var(--card-bg);
		border-left: 4px solid var(--accent, #cba6f7);
		margin-bottom: 2rem;
	}

	.ai-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.ai-header h2 {
		margin: 0;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		border-radius: 99px;
		font-size: 0.875rem;
		font-weight: bold;
	}

	.badge.ready {
		background-color: var(--success, #a6e3a1);
		color: #11111b;
	}

	.badge.locked {
		background-color: var(--surface, #313244);
		color: var(--text-muted, #a6adc8);
	}

	.ai-description {
		color: var(--text-muted, #bac2de);
		margin-bottom: 1.25rem;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background-color: var(--surface, #313244);
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background-color: var(--accent, #cba6f7);
		transition: width 0.5s ease-out;
	}

	/* Stats Grid Styles */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin: 2rem 0;
	}

	.stat-card {
		padding: 1.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.stat-card h3 {
		font-size: 0.9rem;
		color: var(--text-muted, #bac2de);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.value {
		font-size: 2rem;
		font-weight: bold;
		color: var(--accent, #cba6f7);
		margin: 0.5rem 0 0;
	}

	/* Activity Panel Styles */
	.activity-panel {
		padding: 1.5rem;
	}

	.activity-panel h2 {
		margin-top: 0;
	}

	.accent {
		color: var(--accent, #cba6f7);
		font-weight: bold;
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted, #bac2de);
		padding: 2rem 0;
		font-style: italic;
	}

	/* Actions Styles */
	.actions {
		margin-top: 2rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-ai {
		background-color: transparent;
		border: 2px solid var(--accent, #cba6f7);
		color: var(--accent, #cba6f7);
	}

	.btn-ai:hover:not(:disabled) {
		background-color: var(--accent, #cba6f7);
		color: #11111b;
	}

	.btn-ai:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		border-color: var(--surface, #313244);
		color: var(--text-muted, #a6adc8);
	}
</style>
