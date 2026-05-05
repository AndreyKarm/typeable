<script lang="ts">
	import { onDestroy } from 'svelte';

	export type Mistake = {
		char: string;
		typed: string;
		timestamp: Date;
	};

	export type TypingStats = {
		wpm: number;
		accuracy: number;
		progress: number;
		charCount: number;
		mistakes: Mistake[];
	};

	type CharObj = {
		char: string;
		status: 'untyped' | 'correct' | 'incorrect';
	};

	// Props
	interface Props {
		content: string;
		disabled?: boolean;
		class?: string;
		onstart?: () => void; // Called when the exercise starts
		onupdate?: (stats: TypingStats) => void; // Called when the stats change
		onfinish?: (stats: TypingStats) => void; // Called when the exercise is finished
		isFinished?: boolean;
		mistakes?: Mistake[];
		totalTyped?: number;
	}

	// State
	let {
		content,
		disabled = false,
		class: className = '',
		onstart,
		onupdate,
		onfinish,
		isFinished = $bindable(false),
		mistakes = $bindable<Mistake[]>([]),
		totalTyped = $bindable(0)
	}: Props = $props();

	let chars = $state<CharObj[]>([]);
	let currentIndex = $state(0);
	let startTime: number | null = null;
	let now = $state(Date.now());
	let nowInterval: ReturnType<typeof setInterval> | undefined;

	// Computed stats
	let computedAccuracy = $derived(
		totalTyped > 0
			? Math.max(0, Math.round(((totalTyped - mistakes.length) / totalTyped) * 100)) // Calculate accuracy
			: 100
	);

	// Computed stats
	let computedWpm = $derived.by(() => {
		if (!startTime || totalTyped === 0) return 0;
		const elapsedMinutes = (now - startTime) / 60000; // Calculate elapsed minutes
		if (elapsedMinutes < 0.008) return 0; // If elapsed minutes is less than 0.008, return 0
		return Math.max(0, Math.round((totalTyped - mistakes.length) / 5 / elapsedMinutes)); // Calculate WPM
	});

	// Computed stats
	let computedProgress = $derived(chars.length > 0 ? (currentIndex / chars.length) * 100 : 0);

	// Reset the state when the content changes
	$effect(() => {
		const text = content;
		chars = text
			.trim()
			.split('')
			.map((c) => ({ char: c, status: 'untyped' as const }));
		currentIndex = 0;
		mistakes = [];
		totalTyped = 0;
		startTime = null;
		isFinished = false;
		clearInterval(nowInterval);
	});

	// Get the current stats
	function getStats(): TypingStats {
		return {
			wpm: computedWpm,
			accuracy: computedAccuracy,
			progress: computedProgress,
			charCount: totalTyped,
			mistakes
		};
	}

	// Handle keydown events
	function handleKeydown(event: KeyboardEvent) {
		if (disabled || isFinished) return;

		// Get the key pressed
		const key = event.key;
		if (key.length > 1 && key !== 'Backspace') return;

		// If the key is Backspace, handle it
		if (!startTime) {
			startTime = Date.now();
			now = Date.now();
			nowInterval = setInterval(() => {
				now = Date.now();
			}, 500);
			onstart?.();
		}

		// If the key is Backspace, handle it
		if (key === 'Backspace') {
			if (currentIndex > 0) {
				currentIndex--;
				if (chars[currentIndex].status !== 'untyped') {
					totalTyped = Math.max(0, totalTyped - 1);
					chars[currentIndex].status = 'untyped';
				}
			}
			return;
		}

		// If the current index is greater than the length of the chars array, return
		if (currentIndex >= chars.length) return;

		// Increment the total typed count
		totalTyped++;
		now = Date.now();
		const expected = chars[currentIndex].char;

		// If the key matches the expected character, mark it as correct
		if (key === expected) {
			chars[currentIndex].status = 'correct';
		} else {
			chars[currentIndex].status = 'incorrect';
			mistakes = [...mistakes, { char: expected, typed: key, timestamp: new Date() }];
		}

		// Increment the current index
		currentIndex++;
		// Update the stats
		onupdate?.(getStats());

		// If the current index is greater than or equal to the length of the chars array, the exercise is finished
		if (currentIndex >= chars.length) {
			isFinished = true;
			clearInterval(nowInterval);
			onfinish?.(getStats());
		}
	}

	// Clear the interval when the component is destroyed
	onDestroy(() => {
		clearInterval(nowInterval);
	});
</script>

<!-- Window keydown listener -->
<svelte:window onkeydown={handleKeydown} />

<div class="typing-area {className}" class:paused={disabled}>
	<!-- Display the characters -->
	{#each chars as charObj, i (i)}
		<!-- Display each character with the appropriate status -->
		<span class={charObj.status + (i === currentIndex ? ' active' : '')}>{charObj.char}</span>
	{/each}
</div>

<style>
	.typing-area {
		max-width: 900px;
		width: 80%;
		font-size: 1.8rem;
		line-height: 1.6;
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
</style>
