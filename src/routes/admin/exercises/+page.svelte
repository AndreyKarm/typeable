<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import Icon from '@iconify/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let search = $state('');
	let editingId = $state<number | null>(null);
	let formContent = $state('');

	const filtered = $derived(
		data.exercises.filter((e) => e.content.toLowerCase().includes(search.toLowerCase()))
	);

	function startEdit(item: { id: number; content: string }) {
		editingId = item.id;
		formContent = item.content;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function cancelEdit() {
		editingId = null;
		formContent = '';
	}

	$effect(() => {
		if (form?.success) {
			formContent = '';
			editingId = null;
		}
	});
</script>

<div class="container">
	<!-- Search Panel -->
	<div class="panel">
		<Icon icon="carbon:search" width="24" />
		<input type="text" bind:value={search} placeholder="Search exercises..." />
	</div>

	<!-- Form Panel -->
	<form
		method="post"
		action={editingId ? `?/updateExercise` : `?/submitExercise`}
		use:enhance
		class="form-panel"
	>
		<h3>{editingId ? 'Edit Exercise' : 'Add New Exercise'}</h3>
		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}

		<input type="hidden" name="id" value={editingId} />
		<textarea
			name="content"
			bind:value={formContent}
			placeholder="Type exercise text here..."
			required
		></textarea>

		<div class="form-actions">
			<button type="submit" class="btn-primary"
				>{editingId ? 'Save Changes' : 'Submit Exercise'}</button
			>
			{#if editingId}
				<button type="button" onclick={cancelEdit} class="btn-secondary">Cancel</button>
			{/if}
		</div>
	</form>

	<!-- Exercise Table -->
	<table class="exercise-table">
		<thead>
			<tr>
				<th>Type</th>
				<th>Content</th>
				<th>Author</th>
				<th>Stats (P/S/L/D)</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each filtered as item (item.id)}
				<tr>
					<td><span class="badge {item.type}">{item.type}</span></td>
					<td class="content-cell">{item.content}</td>
					<td>{item.author?.name ?? 'System'}</td>
					<td>{item.timesPlayed} / {item.avgScore.toFixed(1)} / {item.likes} / {item.dislikes}</td>
					<td>
						<div class="actions">
							<button class="btn-sm" onclick={() => startEdit(item)}>Edit</button>
							<form method="post" action="?/deleteExercise" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<button type="submit" class="btn-sm btn-danger">Delete</button>
							</form>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.container {
		width: 90%;
		margin: 2rem auto;
		gap: 2rem;
		display: flex;
		flex-direction: column;
	}

	.panel {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: var(--card-bg);
		padding: 1rem;
		border-radius: 0.5rem;
	}

	.exercise-table {
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

	.badge {
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		text-transform: uppercase;
	}

	.ai {
		background: var(--accent);
		color: var(--bg-color);
	}

	.user {
		background: var(--success);
		color: var(--bg-color);
	}

	.form-panel {
		background: var(--card-bg);
		padding: 1rem;
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	textarea {
		width: 100%;
		height: 80px;
		background: var(--bg-color);
		color: white;
		padding: 1rem;
		border: none;
		border-radius: 0.5rem;
	}

	/* Button Styles */
	button {
		cursor: pointer;
		border: none;
		border-radius: 0.4rem;
		padding: 0.5rem 1rem;
	}

	.btn-primary {
		background: var(--accent);
		color: var(--bg-color);
		font-weight: 700;
	}

	.btn-danger {
		background: var(--danger);
		color: white;
	}

	.btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.inline-form {
		display: flex;
		gap: 0.5rem;
	}

	.form-panel {
		background: var(--card-bg);
		padding: 1.5rem;
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	textarea {
		width: 100%;
		height: 100px;
		background: var(--bg-color);
		color: white;
		padding: 1rem;
		border: 1px solid #444;
		border-radius: 0.5rem;
		resize: vertical;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-secondary {
		background: var(--bg-color);
		color: var(--text-main);
		border: 1px solid var(--accent);
	}

	.content-cell {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
