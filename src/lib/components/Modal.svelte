<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	const {
		open,
		title,
		class: class_,
		overlayClass = '',
		onClose,
		children
	}: {
		open: boolean;
		title?: string;
		class?: string;
		overlayClass?: string;
		onClose?: () => void;
		children: Snippet;
	} = $props();

	$effect(() => {
		if (open) document.body.style.overflow = 'hidden';
		else document.body.style.overflow = '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose?.();
	}

	function handleClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose?.();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class={['modal-overlay', overlayClass]}
		role="presentation"
		transition:fade={{ duration: 300 }}
		onclick={handleClick}
	>
		<div class={['modal-content', 'container', class_]} transition:fly={{ y: 20, duration: 300 }}>
			{#if title || onClose}
				<div class="modal-header">
					<h2>{title || ''}</h2>
					<button class="close-btn" onclick={onClose}>&times;</button>
				</div>
			{/if}

			<div class="modal-body">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--card-bg);
		border-color: #3f3f52;
	}

	.modal-header h2 {
		font-size: 1.5rem;
		color: var(--text-main);
	}

	.close-btn {
		background: transparent;
		color: var(--text-muted);
		font-size: 2rem;
		padding: 0;
		line-height: 1;
		border: none;
		transition: color 0.2s;
	}

	.close-btn:hover {
		background: transparent;
		color: var(--danger);
		transform: none;
	}

	.modal-body {
		color: var(--text-main);
	}
</style>
