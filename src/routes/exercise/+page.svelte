<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Modal from '$lib/components/Modal.svelte';
	import Icon from '@iconify/svelte';
	import UserModal from '$lib/components/UserModal.svelte';
	import { copyToClipboard } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	// State
	let isCreateModalOpen = $state(false);
	let searchQuery = $state('');
	let sortBy = $state<
		'most_played' | 'likes' | 'dislikes' | 'shortest_time' | 'longest_time' | 'oldest' | 'newest'
	>('most_played');

	let isUserModalOpen = $state(false);
	let activeUserId = $state<string | null>(null);
	let activeUserName = $state<string | null>(null);

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
				switch (sortBy) {
					case 'most_played':
						return (b.timesPlayed ?? 0) - (a.timesPlayed ?? 0);
					case 'likes':
						return b.likes - a.likes;
					case 'dislikes':
						return a.dislikes - b.dislikes;
					case 'shortest_time':
						return a.time - b.time;
					case 'longest_time':
						return b.time - a.time;
					case 'oldest':
						return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					case 'newest':
						return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

					default:
						return a.time - b.time;
				}
			})
	);

	function createLobby(exerciseId: number) {
		const roomId = Math.random().toString(36).substring(7);
		goto(resolve(`/duel/${roomId}/${exerciseId}`));
	}

	function openUserModal(userId: string, name: string | null) {
		activeUserId = userId;
		activeUserName = name;
		isUserModalOpen = true;
	}
</script>

<UserModal
	open={isUserModalOpen}
	onClose={() => (isUserModalOpen = false)}
	userId={activeUserId}
	userName={activeUserName}
/>

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
		<div class="panel search">
			<Icon icon="carbon:search" width="24" class="search-icon" />
			<input type="text" bind:value={searchQuery} placeholder="Search exercises..." />
		</div>

		<select bind:value={sortBy} class="control-select">
			<option value="most_played">Most Played</option>
			<option value="likes">Most Liked</option>
			<option value="dislikes">Most Disliked</option>
			<option value="shortest_time">Shortest Time</option>
			<option value="longest_time">Longest Time</option>
			<option value="newest">Newest</option>
			<option value="oldest">Oldest</option>
		</select>

		<button class="button" onclick={() => (isCreateModalOpen = true)}>New</button>
		<button class="button" onclick={playRandom}>Random</button>
	</div>

	<div class="grid">
		{#each filteredExercises as ex (ex.id)}
			<a href={resolve(`/exercise/${ex.id}`)} class="card">
				<h3 class="preview">{ex.content}</h3>
				<div class="card-data">
					<div class="meta">
						<button
							class="badge id"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								copyToClipboard(ex.id);
							}}>#{ex.id}</button
						>
						<button
							class="badge type-{ex.type}"
							style="cursor: pointer;"
							onclick={(e) => {
								if (ex.authorId) {
									e.preventDefault();
									e.stopPropagation();
									openUserModal(ex.authorId, ex.author?.name ?? null);
								}
							}}>{ex.author?.name ?? ex.type}</button
						>
					</div>
					<div class="stats">
						<div title="Length of the Exercise">
							📏 <p>{ex.content.length} chars</p>
						</div>
						<div title="Time to Complete in Seconds">
							⏱️ <p>{ex.time}s</p>
						</div>
						<div title="Likes">
							👍 <p>{ex.likes}</p>
						</div>
						<div title="Dislikes">
							👎 <p>{ex.dislikes}</p>
						</div>
						<div title="Times Played">
							🚶‍♂️ <p>{ex.timesPlayed}</p>
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
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.controls {
		display: flex;
		gap: 1rem;
		margin: 1rem 0;
		align-items: center;
	}

	.control-select {
		height: 100%;
		border: 1px solid transparent;
		transition: all 0.2s ease;
	}

	.control-select:focus-within {
		border: 1px solid var(--accent);
	}

	.control-select option {
		background-color: var(--card-bg);
		color: var(--text-main);
		padding: 10px;
	}

	.controls .button {
		border-radius: 1rem;
		padding: 0.75rem;
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
		justify-content: space-between;
		gap: 1rem;
		border: 1px solid transparent;
		transition: border 0.2s;
	}

	.card:hover {
		border-color: var(--accent);
		text-decoration: none;
	}

	.card-data {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preview {
		color: var(--text-main);
		font-size: 0.95rem;
		font-weight: 400;
		line-height: 1.5;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.meta {
		display: flex;
		width: 100%;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.badge.id {
		background: var(--bg-color);
		color: var(--text-muted);
	}

	.badge.type {
		background: var(--accent);
		color: var(--bg-main);
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

	.stats div {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stats div p {
		text-align: center;
	}

	.button.duel {
		padding: 0.4rem;
		background-color: var(--text-muted);
		font-size: 14px;
		height: fit-content;
	}

	textarea {
		margin: 0.5rem 0;
		background-color: var(--bg-color) !important;
	}

	input,
	select {
		flex: 1;
	}
</style>
