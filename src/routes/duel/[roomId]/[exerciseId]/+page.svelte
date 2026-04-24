<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import toast from 'svelte-5-french-toast';

	let { data } = $props();

	// WebSocket State
	let ws: WebSocket;
	let gameState = $state<'waiting' | 'ready' | 'countdown' | 'racing' | 'finished'>('waiting');
	let countdown = $state(3);

	// Typing Engine State
	type CharObj = { char: string; status: 'untyped' | 'correct' | 'incorrect' };
	type Mistake = { char: string; typed: string; timestamp: Date };

	let chars = $state<CharObj[]>([]);
	let currentIndex = $state(0);
	let mistakes = $state<Mistake[]>([]);
	let totalTyped = $state(0);
	let startTime: number | null = null;
	let finished = $state(false);

	let isResultsModalOpen = $state(false);

	let myProgress = $derived(chars.length > 0 ? (currentIndex / chars.length) * 100 : 0);
	let opponent = $state({ name: 'Opponent', wpm: 0, accuracy: 0, progress: 0, finished: false });

	// Derived
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

	$effect(() => {
		if (data.exercise.id) {
			chars = data.exercise.content
				.trim()
				.split('')
				.map((c: string) => ({ char: c, status: 'untyped' as const }));
		}
	});

	$effect(() => {
		if (gameState === 'finished' || opponent.finished) {
			isResultsModalOpen = true;
		}
	});

	// Core Logic
	onMount(() => {
		ws = new WebSocket(`ws://localhost:3001?roomId=${data.roomId}&userId=${data.userId}`);

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type === 'player_count' && msg.count >= 2 && gameState === 'waiting') {
				gameState = 'ready';
			}

			if (msg.type === 'start_countdown') {
				gameState = 'countdown';
				countdown = 3;

				const timer = setInterval(() => {
					countdown--;
					if (countdown === 0) {
						clearInterval(timer);
						startRace();
					}
				}, 1000);
			}

			if (msg.type === 'opponent_update' && msg.userId !== data.userId) {
				opponent = { ...opponent, wpm: msg.wpm, accuracy: msg.accuracy, progress: msg.progress };
			}

			if (msg.type === 'opponent_finished' && msg.userId !== data.userId) {
				opponent = {
					...opponent,
					wpm: msg.wpm,
					accuracy: msg.accuracy,
					progress: 100,
					finished: true
				};
				if (gameState === 'racing') toast.error('Opponent finished!');
			}
		};

		if (currentIndex >= chars.length) {
			finished = true;
			gameState = 'finished';
			ws.send(JSON.stringify({ type: 'finish', wpm, accuracy }));
		}
	});

	function startRace() {
		gameState = 'racing';
		startTime = Date.now();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (gameState !== 'racing' || finished) return;

		const key = event.key;
		if (key.length > 1 && key !== 'Backspace') return;

		if (key === 'Backspace') {
			if (currentIndex > 0) {
				currentIndex--;
				chars[currentIndex].status = 'untyped';
				if (totalTyped > 0) totalTyped--;
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

		// Broadcast update
		ws.send(
			JSON.stringify({
				type: 'typing_update',
				wpm,
				accuracy,
				progress: myProgress,
				userName: data.userName
			})
		);

		if (currentIndex >= chars.length) {
			finished = true;
			gameState = 'finished';
		}
	}

	function readyUp() {
		ws.send(JSON.stringify({ type: 'ready' }));
		gameState = 'waiting'; // Wait for everyone
	}

	function shareUrl() {
		navigator.clipboard.writeText(window.location.href);
		toast.success('Link copied to clipboard!');
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Modal open={isResultsModalOpen} title="Duel Results" onClose={() => goto(resolve('/exercise'))}>
	<div class="results-content">
		<h2>{wpm > opponent.wpm ? 'Victory!' : 'Defeat!'}</h2>

		<div class="score-comparison">
			<div class="score-box" class:winner={wpm > opponent.wpm}>
				<p>You</p>
				<h3>{wpm} <span class="label">WPM</span></h3>
				<span>{accuracy}% Accuracy</span>
			</div>
			<div class="score-box" class:winner={opponent.wpm > wpm}>
				<p>{opponent.name}</p>
				<h3>{opponent.wpm} <span class="label">WPM</span></h3>
				<span>{opponent.accuracy}% Accuracy</span>
			</div>
		</div>

		<button class="btn" onclick={() => goto(resolve('/exercise'))}>Back to Library</button>
	</div>
</Modal>

<div class="container">
	{#if gameState === 'waiting'}
		<h1>Waiting for opponent...</h1>
		<button class="btn" onclick={shareUrl}>Copy Invite Link</button>
	{/if}

	{#if gameState === 'ready'}
		<h1>Opponent Joined!</h1>
		<button class="btn" onclick={readyUp}>I'm Ready</button>
	{/if}

	{#if gameState === 'countdown'}
		<h1 class="countdown">{countdown}</h1>
	{/if}

	<!-- UI -->
	{#if gameState === 'racing'}
		<div class="duel-hud">
			<!-- User -->
			<div class="player-stat">
				<p>You</p>
				<h3>{wpm} <span class="label">WPM</span></h3>
				<div class="progress-container">
					<div class="progress-bar" style="width: {myProgress}%"></div>
				</div>
			</div>

			<!-- Opponent -->
			<div class="player-stat">
				<p>{opponent.name}</p>
				<h3>{opponent.wpm} <span class="label">WPM</span></h3>
				<div class="progress-container">
					<div class="progress-bar opponent" style="width: {opponent.progress}%"></div>
				</div>
			</div>
		</div>
	{/if}

	{#if gameState === 'racing'}
		<div class="typing-area">
			{#each chars as charObj, i (i)}
				<span class={charObj.status + (i === currentIndex ? ' active' : '')}>{charObj.char}</span>
			{/each}
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

	.duel-hud {
		display: flex;
		gap: 4rem;
		margin-bottom: 2rem;
	}

	.player-stat {
		text-align: center;
	}

	.player-stat h3 {
		margin: 0;
		font-size: 2rem;
		color: var(--accent);
	}

	.label {
		font-size: 0.8rem;
		color: var(--text-muted);
		display: block;
	}

	.typing-area {
		max-width: 900px;
		width: 80%;
		font-size: 1.8rem;
		text-align: center;
	}

	.untyped {
		color: #585b70;
	}

	.correct {
		color: var(--text-main);
	}

	.incorrect {
		color: var(--danger);
		text-decoration: underline;
	}

	.active {
		color: var(--accent);
		border-bottom: 2px solid var(--accent);
	}

	.countdown {
		font-size: 5rem;
		color: var(--accent);
	}

	.btn {
		background: var(--accent);
		color: var(--bg-color);
		padding: 1rem 2rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
	}

	.btn:hover {
		filter: brightness(1.2);
	}

	.progress-container {
		width: 200px;
		height: 8px;
		background: #313244;
		border-radius: 4px;
		overflow: hidden;
		margin-top: 0.5rem;
	}

	.progress-bar {
		height: 100%;
		background: var(--accent);
		transition: width 0.2s ease-out;
	}

	.progress-bar.opponent {
		background: var(--text-muted);
	}

	.player-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.results-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1rem;
	}

	.score-comparison {
		display: flex;
		gap: 2rem;
		margin: 1.5rem 0;
	}

	.score-box {
		padding: 1rem;
		border-radius: 0.5rem;
		background: var(--bg-color);
		min-width: 120px;
		border: 1px solid transparent;
	}

	.score-box.winner {
		border-color: var(--success);
		box-shadow: 0 0 10px rgba(166, 227, 161, 0.2);
	}

	.score-box h3 {
		margin: 0.5rem 0;
		font-size: 1.5rem;
		color: var(--accent);
	}
</style>
