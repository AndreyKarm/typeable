<script lang="ts">
	import Modal from './Modal.svelte';
	import type { Snippet } from 'svelte';

	const {
		open,
		title = 'Confirmation',
		message = 'Are you sure?',
		onConfirm,
		onCancel,
		children
	}: {
		open: boolean;
		title?: string;
		message?: string;
		onConfirm: () => void;
		onCancel: () => void;
		children?: Snippet;
	} = $props();
</script>

<Modal {open} {title} onClose={onCancel} class="modal-sm" overlayClass="on-top">
	<p>{message}</p>

	{@render children?.()}

	<div class="form-actions">
		<button type="button" class="button cancel" onclick={onCancel}>Cancel</button>
		<button type="button" class="button delete" onclick={onConfirm}>Yes</button>
	</div>
</Modal>

<style>
	.form-actions {
		display: flex;
		justify-content: center;
		gap: 5rem;
	}
</style>
