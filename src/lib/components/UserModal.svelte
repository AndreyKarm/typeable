<script lang="ts">
	import Modal from './Modal.svelte';

	let { open, onClose, userId, userName } = $props();

	interface UserStats {
		xp: number;
		streak: number;
		avgWpm: number;
		totalTyped: number;
	}

	let stats = $state<UserStats | null>(null);
	let isLoading = $state(false);

	$effect(() => {
		if (open && userId) {
			fetchStats();
		} else {
			stats = null;
		}
	});

	async function fetchStats() {
		isLoading = true;
		try {
			const response = await fetch(`/api/user/${userId}`);
			if (response.ok) {
				const data = await response.json();
				stats = {
					xp: data.xp ?? 0,
					streak: data.streak ?? 0,
					avgWpm: data.avgWpm ?? 0,
					totalTyped: data.totalTyped ?? 0
				};
			} else {
				stats = null;
			}
		} catch (e) {
			console.error('Failed to load user stats', e);
			stats = null;
		} finally {
			isLoading = false;
		}
	}
</script>

<Modal {open} {onClose} class="container" title={userName ?? 'User Stats'}>
	{#if isLoading}
		<p>Loading stats...</p>
	{:else if stats}
		<div class="stats-grid">
			<div class="stat-card">
				<span class="label">XP</span>
				<span class="value">{stats.xp}</span>
			</div>
			<div class="stat-card">
				<span class="label">Streak</span>
				<span class="value">{stats.streak}🔥</span>
			</div>
			<div class="stat-card">
				<span class="label">Avg WPM</span>
				<span class="value accent">{stats.avgWpm}</span>
			</div>
			<div class="stat-card">
				<span class="label">Total Typed</span>
				<span class="value">{stats.totalTyped}</span>
			</div>
		</div>
	{:else}
		<p>No stats available.</p>
	{/if}
</Modal>

<style>
	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.stat-card {
		background: var(--bg-color);
		padding: 1rem;
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
	}

	.label {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.value {
		font-size: 1.2rem;
		font-weight: bold;
	}
</style>
