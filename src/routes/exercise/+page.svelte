<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Modal from '$lib/components/Modal.svelte';

	let { data }: { data: PageData } = $props();

	// State
	let isCreateModalOpen = $state(false);
	let searchQuery = $state('');
	let sortBy = $state<'likes' | 'time'>('likes');

	// Navigation to random
	function playRandom() {
		const random = data.exercises[Math.floor(Math.random() * data.exercises.length)];
		goto(resolve(`/exercise/${random.id}`));
	}

	// Derived logic for filtering/sorting
	let filteredExercises = $derived(
		data.exercises
			.filter((e) => e.content.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => {
				if (sortBy === 'likes') return b.likes - a.likes;
				return a.time - b.time;
			})
	);

	function createLobby(exerciseId: number) {
		const roomId = Math.random().toString(36).substring(7);
		goto(resolve(`/duel/${roomId}/${exerciseId}`));
	}
</script>

<!-- The Create Modal -->
<Modal
	open={isCreateModalOpen}
	onClose={() => (isCreateModalOpen = false)}
	title="Create Custom Exercise"
>
	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				isCreateModalOpen = false;
			};
		}}
	>
		<label>
			Exercise Content
			<textarea name="content" placeholder="Paste your text here..." required></textarea>
		</label>

		<label>
			Duration (seconds)
			<input type="number" name="time" value="30" min="5" max="300" />
		</label>

		<button type="submit" class="button">Create Exercise</button>
	</form>
</Modal>

<div class="container">
	<h1>Library</h1>

	<div class="controls">
		<input type="text" placeholder="Search exercises..." bind:value={searchQuery} />

		<select bind:value={sortBy}>
			<option value="likes">Most Liked</option>
			<option value="time">Shortest Time</option>
		</select>

		<button onclick={() => (isCreateModalOpen = true)}>+ New Exercise</button>
		<button onclick={playRandom}>Random Exercise</button>
	</div>

	<div class="grid">
		{#each filteredExercises as ex (ex.id)}
			<a href={resolve(`/exercise/${ex.id}`)} class="card">
				<h3>Exercise #{ex.id}</h3>
				<p class="preview">{ex.content.slice(0, 80)}...</p>
				<div class="stats">
					<div class="stats-data">
						📏 <p>{ex.content.length} chars</p>
					</div>
					<div>
						⏱️ <p>{ex.time}s</p>
					</div>
					<div>
						👍 <p>{ex.likes}</p>
					</div>
					<div>
						👎 <p>{ex.dislikes}</p>
					</div>
					<button
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							createLobby(ex.id);
						}}
						class="button duel">Create Lobby</button
					>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.controls {
		display: flex;
		gap: 1rem;
		margin: 2rem 0;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.card {
		background: var(--card-bg);
		padding: 1.5rem;
		border-radius: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border: 1px solid transparent;
		transition: border 0.2s;
	}

	.card:hover {
		border-color: var(--accent);
		text-decoration: none;
	}

	.preview {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-top: auto;
	}

	.stats-data {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.button.duel {
		padding: 0.4rem;
		background-color: var(--text-muted);
		font-size: 14px;
		height: fit-content;
	}

	input,
	select {
		flex: 1;
	}
</style>
