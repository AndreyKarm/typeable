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
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

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
		<div class={['modal-content', class_]} transition:fly={{ y: 200, duration: 400 }}>
			{#if title}
				<h2>{title}</h2>
			{/if}
			{@render children()}
		</div>
	</div>
{/if}
