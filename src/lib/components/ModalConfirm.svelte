<script lang="ts">
	import Modal from './Modal.svelte';

	const {
		open,
		title = 'Confirmation',
		message = 'Are you sure?',
		onConfirm,
		onCancel
	}: {
		open: boolean;
		title?: string;
		message?: string;
		onConfirm: () => void;
		onCancel: () => void;
	} = $props();
</script>

<Modal {open} {title} onClose={onCancel} class="modal-sm" overlayClass="on-top">
	<p>{message}</p>
	<div class="form-actions">
		<button type="button" class="button cancel" onclick={onCancel}>Cancel</button>
		<button type="button" class="button delete" onclick={onConfirm}>Yes</button>
	</div>
</Modal>

<style>
	.form-actions {
		justify-content: space-around;
	}
</style>
