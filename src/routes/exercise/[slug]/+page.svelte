<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import toast from 'svelte-5-french-toast';

	let { data } = $props();

	type CharObj = { char: string; status: 'untyped' | 'correct' | 'incorrect' };
	type Mistake = { char: string; typed: string; timestamp: Date };

	let formElement = $state<HTMLFormElement | undefined>(undefined);
	let hasSubmitted = $state(false);
	let chars = $state<CharObj[]>([]);
	let currentIndex = $state(0);
	let mistakes = $state<Mistake[]>([]);
	let startTime: number | null = null;
	let timeLeft = $state(30);
	let isStarted = $state(false);
	let isPaused = $state(false);
	let totalTyped = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | undefined;
	let userRating = $state(0);

	let accuracy = $derived(
		totalTyped > 0
			? Math.max(0, Math.round(((totalTyped - mistakes.length) / totalTyped) * 100))
			: 100
	);
	let wpm = $derived(
		startTime
			? Math.round((totalTyped - mistakes.length) / 5 / ((Date.now() - startTime) / 60000))
			: 0
	);
	let isFinished = $derived(timeLeft === 0 || currentIndex >= chars.length);

	function resetState() {
		clearInterval(timerInterval);
		chars = data.exercise.content
			.trim()
			.split('')
			.map((c: string) => ({ char: c, status: 'untyped' as const }));
		currentIndex = 0;
		mistakes = [];
		timeLeft = data.exercise.time;
		totalTyped = 0;
		isStarted = false;
		isPaused = false;
		hasSubmitted = false;
		userRating = data.userRating;
	}

	$effect(() => {
		if (data.exercise.id) {
			resetState();
		}
	});

	$effect(() => {
		if (isFinished) clearInterval(timerInterval);
	});

	$effect(() => {
		if (isFinished && !hasSubmitted && formElement) {
			const stats = getFinalStats();

			const wpmInput = formElement.querySelector<HTMLInputElement>('input[name="wpm"]');
			const accInput = formElement.querySelector<HTMLInputElement>('input[name="accuracy"]');
			const charInput = formElement.querySelector<HTMLInputElement>('input[name="charCount"]');

			if (wpmInput && accInput && charInput) {
				wpmInput.value = stats.wpm.toString();
				accInput.value = stats.accuracy.toString();
				charInput.value = stats.charCount.toString();

				formElement.requestSubmit();
				hasSubmitted = true;
			}
		}
	});

	function startTimer() {
		if (isStarted || isPaused) return;
		isStarted = true;
		startTime = Date.now();
		timerInterval = setInterval(() => {
			if (timeLeft > 0) {
				timeLeft--;
			} else {
				clearInterval(timerInterval);
			}
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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			togglePause();
			return;
		}

		if (isFinished || isPaused) return;

		const key = event.key;
		if (key.length > 1 && key !== 'Backspace') return;

		startTimer();

		if (key === 'Backspace') {
			if (currentIndex > 0) {
				currentIndex--;
				const prev = chars[currentIndex];

				if (prev.status !== 'untyped') {
					totalTyped = Math.max(0, totalTyped - 1);
					// if (prev.status === 'incorrect') {
					// 	mistakes = mistakes.slice(0, -1);
					// }
					prev.status = 'untyped';
				}
			}
			return;
		}

		if (currentIndex >= chars.length) return;

		totalTyped++;
		const expectedChar = chars[currentIndex].char;

		if (key === expectedChar) {
			chars[currentIndex].status = 'correct';
		} else {
			chars[currentIndex].status = 'incorrect';
			mistakes = [...mistakes, { char: expectedChar, typed: key, timestamp: new Date() }];
		}

		currentIndex++;
	}

	function getFinalStats() {
		const elapsedMinutes = (Date.now() - (startTime ?? Date.now())) / 60000;
		const finalWpm = Math.max(0, Math.round((totalTyped - mistakes.length) / 5 / elapsedMinutes));
		return {
			wpm: finalWpm,
			accuracy: accuracy,
			charCount: totalTyped
		};
	}

	function handleRateClick(rating: number) {
		userRating = userRating === rating ? 0 : rating;
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
	<input type="hidden" name="errors" value={JSON.stringify(mistakes)} />
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
		<div>
			{timeLeft}
			<span>Time Left</span>
		</div>
		<div>
			{wpm}
			<span>WPM</span>
		</div>
		<div>
			{accuracy}%
			<span>Acc</span>
		</div>
	</div>

	<!-- Typing area -->
	<div class="typing-area" class:paused={isPaused}>
		{#each chars as charObj, i (i)}
			<span class={charObj.status + (i === currentIndex ? ' active' : '')}>
				{charObj.char}
			</span>
		{/each}
	</div>

	<!-- Summary -->
	{#if isFinished}
		<div class="results-summary">
			<h3>Summary</h3>
			{#if mistakes.length > 0}
				<div class="mistakes-log">
					<p>Mistakes made:</p>
					<div class="mistakes-list">
						{#each mistakes as m (m.timestamp)}
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
						<Icon icon="carbon:thumbs-up" width="24" />
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
						<Icon icon="carbon:thumbs-down" width="24" />
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
	}

	.hud div span {
		font-size: 0.9rem;
		color: #6c7086;
		display: block;
		text-align: center;
		font-weight: normal;
	}

	.typing-area {
		max-width: 900px;
		width: 80%;
		font-size: 1.8rem;
		line-height: 1.6;
		position: relative;
		text-align: center;
		transition: opacity 0.2s ease;
	}

	.typing-area.paused {
		opacity: 0.2;
		user-select: none;
	}

	.untyped {
		color: #585b70;
	}

	.correct {
		color: var(--text-main);
	}

	.incorrect {
		color: #f38ba8;
		text-decoration: underline;
	}

	span.active {
		color: var(--accent);
		border-bottom: 2px solid var(--accent);
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
		transition: background 0.2s;
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
