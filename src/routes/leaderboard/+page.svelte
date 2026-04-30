<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';

	interface Leader {
		userId: string;
		rank: number;
		name: string;
		avgWpm: number;
		totalTyped: number;
	}

	let { data }: { data: { leaders: Leader[] } } = $props();

	let sortColumn = $state<keyof Leader>('rank');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	let isModalOpen = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let selectedUser = $state<{ name: string; stats: any } | null>(null);

	function toggleSort(column: keyof Leader) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'desc';
		}
	}

	async function openUserModal(userId: string, name: string) {
		const response = await fetch(`/api/user/${userId}`);
		const data = await response.json();

		selectedUser = { name, stats: data };
		isModalOpen = true;
	}

	let sortedLeaders = $derived(
		[...data.leaders].sort((a, b) => {
			const valA = a[sortColumn];
			const valB = b[sortColumn];

			if (valA === undefined || valB === undefined) return 0;

			const modifier = sortDirection === 'asc' ? 1 : -1;

			if (typeof valA === 'string' && typeof valB === 'string') {
				return valA.localeCompare(valB) * modifier;
			}
			if (typeof valA === 'number' && typeof valB === 'number') {
				return (valA - valB) * modifier;
			}
			return 0;
		})
	);
</script>

<Modal open={isModalOpen} onClose={() => (isModalOpen = false)} title={selectedUser?.name}>
	{#if selectedUser}
		<div class="stats-grid">
			<div class="stat-card">
				<span class="label">XP</span>
				<span class="value">{selectedUser.stats.xp}</span>
			</div>
			<div class="stat-card">
				<span class="label">Streak</span>
				<span class="value">{selectedUser.stats.streak}🔥</span>
			</div>
			<div class="stat-card">
				<span class="label">Avg WPM</span>
				<span class="value accent">{selectedUser.stats.avgWpm}</span>
			</div>
			<div class="stat-card">
				<span class="label">Total Typed</span>
				<span class="value">{selectedUser.stats.totalTyped}</span>
			</div>
		</div>
	{/if}
</Modal>

<div class="container">
	<h1>Leaderboard</h1>
	<div class="panel">
		<table>
			<thead>
				<tr>
					<th onclick={() => toggleSort('rank')}>
						Rank
						<span class="sort-icon">
							{sortColumn === 'rank' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
						</span>
					</th>
					<th>User</th>
					<th onclick={() => toggleSort('avgWpm')}>
						Avg WPM
						<span class="sort-icon">
							{sortColumn === 'avgWpm' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
						</span>
					</th>
					<th onclick={() => toggleSort('totalTyped')}>
						Total Typed
						<span class="sort-icon">
							{sortColumn === 'totalTyped' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
						</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each sortedLeaders as leader (leader.userId)}
					<tr onclick={() => openUserModal(leader.userId, leader.name)} style="cursor: pointer;">
						<td>{leader.rank}</td>
						<td>{leader.name}</td>
						<td class="accent">{leader.avgWpm}</td>
						<td>{leader.totalTyped}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		border-spacing: 0 0.5rem;
	}

	th {
		cursor: pointer;
		padding: 1rem;
		text-align: left;
		border-bottom: 2px solid var(--accent);
		color: var(--text-muted);
		user-select: none;

		white-space: nowrap;
	}

	th:hover {
		color: var(--accent);
	}

	td {
		padding: 1rem;
		text-align: left;
	}

	.panel {
		border-radius: 0;
		margin-top: 1rem;
	}

	.sort-icon {
		display: inline-block;
		width: 1.2rem;
		text-align: center;
		font-size: 0.8rem;
	}

	.accent {
		color: var(--accent);
		font-weight: bold;
	}

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
		border: 1px solid var(--card-bg);
	}

	.label {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05rem;
	}

	.value {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--text-main);
	}

	.accent {
		color: var(--accent);
	}
</style>
