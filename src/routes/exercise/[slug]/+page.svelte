<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import toast from 'svelte-5-french-toast';
	import TypingEngine from '$lib/components/TypingEngine.svelte';
	import type { TypingStats } from '$lib/components/TypingEngine.svelte';

	let { data } = $props();

	let formElement = $state<HTMLFormElement | undefined>(undefined);
	let hasSubmitted = $state(false);

	let timeLeft = $state(0);
	let isStarted = $state(false);
	let isPaused = $state(false);
	let timerInterval: ReturnType<typeof setInterval> | undefined;
	let userRating = $state(0);

	let lastStats = $state<TypingStats | null>(null);
	let isFinished = $state(false);

	function resetState() {
		clearInterval(timerInterval);
		timeLeft = data.exercise.time;
		isStarted = false;
		isPaused = false;
		hasSubmitted = false;
		isFinished = false;
		lastStats = null;
		userRating = data.userRating;
	}

	$effect(() => {
		if (data.exercise.id) resetState();
	});

	$effect(() => {
		if (isFinished) clearInterval(timerInterval);
	});

	// Auto-submit when finished
	$effect(() => {
		if (!isFinished || hasSubmitted || !formElement || !lastStats) return;

		const wpmInput = formElement.querySelector<HTMLInputElement>('input[name="wpm"]');
		const accInput = formElement.querySelector<HTMLInputElement>('input[name="accuracy"]');
		const charInput = formElement.querySelector<HTMLInputElement>('input[name="charCount"]');

		if (wpmInput && accInput && charInput) {
			wpmInput.value = String(lastStats.wpm);
			accInput.value = String(lastStats.accuracy);
			charInput.value = String(lastStats.charCount);
			formElement.requestSubmit();
			hasSubmitted = true;
		}
	});

	function startTimer() {
		if (isStarted || isPaused) return;
		isStarted = true;
		timerInterval = setInterval(() => {
			if (timeLeft > 0) timeLeft--;
			else clearInterval(timerInterval);
		}, 1000);
	}

	function togglePause() {
		if (!isStarted || isFinished) return;
		if (isPaused) {
			isPaused = false;
			timerInterval = setInterval(() => {
				if (timeLeft > 0) timeLeft--;
				else clearInterval(timerInterval);
			}, 1000);
		} else {
			isPaused = true;
			clearInterval(timerInterval);
		}
	}

	function handleFinish(stats: TypingStats) {
		lastStats = stats;
		isFinished = true;
		clearInterval(timerInterval);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') togglePause();
	}

	function handleRateClick(rating: number) {
		userRating = userRating === rating ? 0 : rating;
		toast.success('Rating sent!');
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<form
	bind:this={formElement}
	method="post"
	action="?/save"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const xp = result.data?.xpEarned;
				toast.success(`Exercise complete! +${xp} XP`);
			}
			await update({ invalidateAll: false });
		};
	}}
>
	<input type="hidden" name="wpm" id="input-wpm" />
	<input type="hidden" name="accuracy" id="input-accuracy" />
	<input type="hidden" name="exerciseId" value={data.exercise.id} />
	<input type="hidden" name="errors" value={JSON.stringify(lastStats?.mistakes ?? [])} />
	<input type="hidden" name="charCount" id="input-charCount" />
</form>

<div class="container">
	<!-- Top state -->
	<div class="focus-prompt">
		{#if isFinished}
			TEST FINISHED
		{:else if isPaused}
			PAUSED — PRESS ESC TO RESUME
		{:else if !isStarted}
			START TYPING TO BEGIN
		{:else}
			PRESS ESC TO PAUSE
		{/if}
	</div>

	<!-- Stats hud -->
	<div class="hud">
		<div>{timeLeft}<span>Time Left</span></div>
		<div>{lastStats?.wpm ?? 0}<span>WPM</span></div>
		<div>{lastStats?.accuracy ?? 100}%<span>Acc</span></div>
	</div>

	<!-- Typing area -->
	<TypingEngine
		content={data.exercise.content}
		disabled={isPaused}
		onstart={startTimer}
		onupdate={(s) => (lastStats = s)}
		onfinish={handleFinish}
	/>

	<!-- Summary -->
	{#if isFinished}
		<div class="results-summary">
			<h3>Summary</h3>
			{#if (lastStats?.mistakes.length ?? 0) > 0}
				<div class="mistakes-log">
					<p>Mistakes made:</p>
					<div class="mistakes-list">
						{#each lastStats?.mistakes ?? [] as m (m.timestamp)}
							<span class="mistake-item">
								<span class="char">{m.char}</span>
								<span class="arrow">→</span>
								<span class="typed">{m.typed === ' ' ? '␣' : m.typed}</span>
							</span>
						{/each}
					</div>
				</div>
			{:else}
				<p>Perfect score!</p>
			{/if}
		</div>
	{/if}

	<!-- Controls (Restart/Next Exercise) -->
	<div class="controls">
		{#if isFinished}
			<button onclick={resetState}>Restart</button>
			<button onclick={() => goto(resolve('/exercise'))}>Next Exercise</button>
		{/if}
	</div>

	<!-- Rating exercise -->
	{#if isFinished}
		<div class="rating-controls">
			<p>Rate this exercise:</p>
			<div class="buttons">
				<!-- Like Form -->
				<form
					action="?/rate"
					method="POST"
					use:enhance={({ formData }) => {
						const rating = Number(formData.get('rating'));
						handleRateClick(rating);

						return async ({ update }) => {
							await update({ reset: false, invalidateAll: false });
						};
					}}
				>
					<input type="hidden" name="exerciseId" value={data.exercise.id} />
					<input type="hidden" name="rating" value="1" />
					<button type="submit" class="btn-rate up" class:active={userRating === 1}>
						<Icon icon="carbon:thumbs-up" width="24" style="color: #1e1e1e" />
					</button>
				</form>

				<!-- Dislike Form -->
				<form
					action="?/rate"
					method="POST"
					use:enhance={({ formData }) => {
						const rating = Number(formData.get('rating'));
						handleRateClick(rating);

						return async ({ update }) => {
							await update({ reset: false, invalidateAll: false });
						};
					}}
				>
					<input type="hidden" name="exerciseId" value={data.exercise.id} />
					<input type="hidden" name="rating" value="-1" />
					<button type="submit" class="btn-rate down" class:active={userRating === -1}>
						<Icon icon="carbon:thumbs-down" width="24" style="color: #1e1e1e" />
					</button>
				</form>
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.hud {
		display: flex;
		gap: 3rem;
		margin-bottom: 4rem;
		font-size: 1.5rem;
		color: #89b4fa;
		font-family: sans-serif;
		font-weight: bold;
		text-align: center;
	}

	.hud div span {
		font-size: 0.9rem;
		color: #6c7086;
		display: block;
		text-align: center;
		font-weight: normal;
	}

	button {
		background-color: transparent;
		color: var(--text-main);
	}

	.focus-prompt {
		position: absolute;
		top: 5rem;
		font-family: sans-serif;
		font-size: 0.8rem;
		color: #45475a;
		letter-spacing: 1px;
	}

	.controls {
		position: absolute;
		bottom: 5rem;
		display: flex;
		gap: 1rem;
		font-family: sans-serif;
		font-size: 0.8rem;
		letter-spacing: 1px;
	}

	.results-summary {
		margin-top: 3rem;
		text-align: center;
		color: var(--text-main);
		font-family: sans-serif;
	}

	.mistakes-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 1rem;
		max-width: 600px;
	}

	.mistake-item {
		background-color: var(--card-bg);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		display: flex;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.mistake-item .char {
		color: var(--success);
	}

	.mistake-item .typed {
		color: var(--danger);
	}

	.rating-controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 2rem;
		color: var(--text-main);
		font-family: sans-serif;
	}

	.rating-controls .buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 0.5rem;
	}

	.btn-rate {
		background: var(--card-bg);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		color: var(--text-main);
		transition: all 0.2s ease;
	}

	.btn-rate.up:hover {
		background: var(--success);
	}

	.btn-rate.down:hover {
		background: var(--danger);
	}

	.btn-rate.up.active {
		background: var(--success);
		color: #fff;
	}

	.btn-rate.down.active {
		background: var(--danger);
		color: #fff;
	}
</style>
