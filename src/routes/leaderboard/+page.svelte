<script lang="ts">
	// 1. Define the interface for the data
	interface Leader {
		rank: number;
		name: string;
		avgWpm: number;
		totalTyped: number;
	}

	// 2. Properly type the props
	let { data }: { data: { leaders: Leader[] } } = $props();

	// 3. Constrain state to only valid keys of 'Leader'
	let sortColumn = $state<keyof Leader>('rank');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	// 4. Properly type the 'column' parameter
	function toggleSort(column: keyof Leader) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'desc';
		}
	}

	let sortedLeaders = $derived(
		[...data.leaders].sort((a, b) => {
			const valA = a[sortColumn];
			const valB = b[sortColumn];

			const modifier = sortDirection === 'asc' ? 1 : -1;

			// 5. Explicitly handle type checking for sorting
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
					<th onclick={() => toggleSort('name')}>
						User
						<span class="sort-icon">
							{sortColumn === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
						</span>
					</th>
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
				{#each sortedLeaders as leader, i (leader.name)}
					<tr>
						<td>{i + 1}</td>
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
		margin-top: 1rem;
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
		border-bottom: 1px solid var(--card-bg);
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
</style>
