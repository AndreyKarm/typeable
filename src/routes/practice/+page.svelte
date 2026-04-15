<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();

	const totalTime = 30; // Seconds

	let chars = $state<{ char: string; status: 'untyped' | 'correct' | 'incorrect' }[]>([]);
	let currentIndex = $state(0);
	let mistakes = $state<{ char: string; typed: string; timestamp: Date }[]>([]);
	let timeLeft = $state(totalTime);
	let isStarted = $state(false);
	let totalTyped = $state(0);
	let timerInterval: ReturnType<typeof setInterval>;

	// Split text into an array of characters
	$effect(() => {
		chars = data.exercise.content.split('').map((c) => ({ char: c, status: 'untyped' }));
		currentIndex = 0;
		mistakes = [];
		timeLeft = totalTime;
		totalTyped = 0;
		isStarted = false;
	});

	// Calculated Stats
	let accuracy = $derived(
		totalTyped > 0
			? Math.max(0, Math.round(((totalTyped - mistakes.length) / totalTyped) * 100))
			: 100
	);

	let elapsedTime = $derived((totalTime - timeLeft) / 60);
	let wpm = $derived(
		elapsedTime > 0 ? Math.round((totalTyped - mistakes.length) / 5 / elapsedTime) : 0
	);

	let isFinished = $derived(timeLeft === 0 || currentIndex >= chars.length);

	function startTimer() {
		if (isStarted) return;
		isStarted = true;
		timerInterval = setInterval(() => {
			if (timeLeft > 0) {
				timeLeft--;
			} else {
				clearInterval(timerInterval);
			}
		}, 1000);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isFinished) return;

		const key = event.key;
		// Allow alphanumeric, space, punctuation, etc.
		if (key.length > 1 && key !== 'Backspace') return;

		startTimer();

		if (key === 'Backspace') {
			if (currentIndex > 0) {
				currentIndex--;
				chars[currentIndex].status = 'untyped';
			}
			return;
		}

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

	$effect(() => {
		if (isFinished) {
			clearInterval(timerInterval);
		}
	});

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			clearInterval(timerInterval);
		};
	});
</script>

<div class="container">
	<div class="focus-prompt">
		{#if isFinished}
			TEST FINISHED
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

	<div class="typing-area">
		{#each chars as charObj, i (i)}
			<span class={charObj.status + (i === currentIndex ? ' active' : '')}>
				{charObj.char}
			</span>
		{/each}
	</div>
</div>

<style>
	.container {
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	/* Heads Up Display */
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
	}

	/* Specific Classes for Highlighting */
	.untyped {
		color: #585b70;
	}

	.correct {
		color: var(--text-main); /* Light white for correct */
	}

	.incorrect {
		color: #f38ba8; /* Red for errors */
		text-decoration: underline;
	}

	.active {
		color: var(--accent);
		position: relative;
	}

	/* The Blinking Cursor */
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
</style>
