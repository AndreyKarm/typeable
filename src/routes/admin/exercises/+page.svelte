<script lang="ts">
	import { enhance } from '$app/forms';
	import ModalConfirm from '$lib/components/ModalConfirm.svelte';
	import toast from 'svelte-5-french-toast';
	import type { ActionData, PageData, SubmitFunction } from './$types';
	import Icon from '@iconify/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let search = $state('');
	let editingId = $state<number | null>(null);
	let formContent = $state('');
	let formTime = $state(30);

	let deleteTarget = $state<number | null>(null);
	let deleteForm: HTMLFormElement;

	const filtered = $derived(
		data.exercises.filter((e) => e.content.toLowerCase().includes(search.toLowerCase()))
	);

	function startEdit(item: { id: number; content: string; time: number }) {
		editingId = item.id;
		formContent = item.content;
		formTime = item.time;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function cancelEdit() {
		editingId = null;
		formContent = '';
		formTime = 30;
	}

	$effect(() => {
		if (form?.success) {
			formContent = '';
			formTime = 30;
			editingId = null;
		}
	});

	// Handler for Add/Edit Form
	const saveEnhance: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(
					editingId ? 'Exercise updated successfully.' : 'Exercise created successfully.'
				);
				await update();
			} else if (result.type === 'failure') {
				toast.error(form?.message || 'Failed to save exercise.');
			} else {
				toast.error('An unexpected error occurred.');
			}
		};
	};

	// Handler for Delete Form
	const deleteEnhance: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Successfully deleted exercise.');
				await update();
				deleteTarget = null;
			} else {
				toast.error('Error while deleting exercise.');
				deleteTarget = null;
			}
		};
	};

	function confirmDelete() {
		if (deleteTarget !== null) {
			deleteForm.requestSubmit();
		}
	}
</script>

<ModalConfirm
	open={deleteTarget !== null}
	title="Remove exercise"
	message="Are you sure you want to delete this exercise?"
	onConfirm={confirmDelete}
	onCancel={() => (deleteTarget = null)}
/>

<form
	method="post"
	action="?/deleteExercise"
	use:enhance={deleteEnhance}
	bind:this={deleteForm}
	class="hidden"
>
	<input type="hidden" name="id" value={deleteTarget ?? ''} />
</form>

<div class="container">
	<!-- Search Panel -->
	<div class="panel search">
		<Icon icon="carbon:search" width="24" />
		<input type="text" bind:value={search} placeholder="Search exercises..." />
	</div>

	<!-- Form Panel -->
	<form
		method="post"
		action={editingId ? `?/updateExercise` : `?/submitExercise`}
		use:enhance={saveEnhance}
		class="form-panel"
	>
		<h3>{editingId ? 'Edit Exercise' : 'Add New Exercise'}</h3>

		<input type="hidden" name="id" value={editingId} />
		<textarea
			name="content"
			bind:value={formContent}
			placeholder="Type exercise text here..."
			required
		></textarea>

		<label>
			Time (seconds):
			<input type="number" name="time" bind:value={formTime} min="10" max="300" required />
		</label>

		<div class="form-actions">
			<button type="submit" class="btn-primary">
				{editingId ? 'Save Changes' : 'Submit Exercise'}
			</button>
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
				<th>Time</th>
				<th>Content</th>
				<th>Author</th>
				<th title="Plays, Avg Score, Likes, Dislikes">Stats (P/S/L/D)</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each filtered as item (item.id)}
				<tr>
					<td><span class="badge type-{item.type}">{item.type}</span></td>
					<td>{item.time}s</td>
					<td class="content-cell">{item.content}</td>
					<td>{item.author?.name ?? 'System'}</td>
					<td>{item.timesPlayed} / {item.avgScore.toFixed(1)} / {item.likes} / {item.dislikes}</td>
					<td>
						<div class="actions">
							<button class="btn-sm" onclick={() => startEdit(item)}>Edit</button>
							<button
								type="button"
								class="btn-sm btn-danger"
								onclick={() => (deleteTarget = item.id)}>Delete</button
							>
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
		width: 100%;
		border-radius: 1rem;
		background-color: var(--card-bg);
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
		height: 10rem;
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
