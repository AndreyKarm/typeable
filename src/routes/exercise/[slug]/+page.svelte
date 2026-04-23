<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let { data } = $props();

	type CharObj = { char: string; status: 'untyped' | 'correct' | 'incorrect' };
	type Mistake = { char: string; typed: string; timestamp: Date };

	let formElement = $state<HTMLFormElement | undefined>(undefined);
	let hasSubmitted = $state(false);
	let chars = $state<CharObj[]>([]);
	let currentIndex = $state(0);
	let mistakes = $state<Mistake[]>([]);
	let timeLeft = $state(30);
	let isStarted = $state(false);
	let isPaused = $state(false);
	let totalTyped = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | undefined;

	let accuracy = $derived(
		totalTyped > 0
			? Math.max(0, Math.round(((totalTyped - mistakes.length) / totalTyped) * 100))
			: 100
	);
	let elapsedTime = $derived((data.exercise.time - timeLeft) / 60);
	let wpm = $derived(
		elapsedTime > 0 ? Math.round((totalTyped - mistakes.length) / 5 / elapsedTime) : 0
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
	}

	// $effect(() => {
	// 	console.log(
	// 		`Total typed: ${totalTyped}. Out of: ${chars.length}. ${chars.at(totalTyped)?.char}`
	// 	);
	// });

	$effect(() => {
		resetState();
	});

	$effect(() => {
		if (isFinished) clearInterval(timerInterval);
	});

	$effect(() => {
		if (isFinished && !hasSubmitted && formElement) {
			hasSubmitted = true;
			formElement.requestSubmit();
		}
	});

	function startTimer() {
		if (isStarted || isPaused) return;
		isStarted = true;
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
			if (!isStarted) return;
			if (currentIndex > 0) {
				currentIndex--;
				const prev = chars[currentIndex];
				if (prev.status !== 'untyped') {
					totalTyped = Math.max(0, totalTyped - 1);
					if (prev.status === 'incorrect') {
						mistakes = mistakes.slice(0, -1);
					}
					prev.status = 'untyped';
				}
			}
			return;
		}

		startTimer();
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

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			clearInterval(timerInterval);
		};
	});
</script>

<form
	bind:this={formElement}
	method="post"
	action="?/save"
	use:enhance={() => {
		return async ({ update }) => {
			await update({ invalidateAll: false });
		};
	}}
>
	<input type="hidden" name="wpm" value={wpm} />
	<input type="hidden" name="accuracy" value={accuracy} />
	<input type="hidden" name="exerciseId" value={data.exercise.id} />
	<input type="hidden" name="errors" value={JSON.stringify(mistakes)} />
	<input type="hidden" name="charCount" value={totalTyped} />
</form>

<div class="container">
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

	<div class="typing-area" class:paused={isPaused}>
		{#each chars as charObj, i (i)}
			<span class={charObj.status + (i === currentIndex ? ' active' : '')}>
				{charObj.char}
			</span>
		{/each}
	</div>

	<div class="controls">
		{#if isFinished}
			<button onclick={resetState}>Restart</button>
			<button onclick={() => goto(resolve('/exercise'))}>Next Exercise</button>
		{/if}
	</div>
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

	.active {
		color: var(--accent);
		position: relative;
	}

	.active::before {
		content: '';
		position: absolute;
		left: -1px;
		top: 5%;
		height: 90%;
		width: 2px;
		background-color: #f5e0dc;
		animation: blink 1s infinite;
	}

	button {
		background-color: transparent;
		color: var(--text-main);
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
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
</style>
