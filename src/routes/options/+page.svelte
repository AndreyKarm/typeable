<script lang="ts">
	import { enhance } from '$app/forms';
	import ModalConfirm from '$lib/components/ModalConfirm.svelte';
	import toast from 'svelte-5-french-toast';
	import type { SubmitFunction } from './$types';
	import { copyToClipboard } from '$lib/utils.js';

	let { data } = $props();

	let currentPassword = $state('');
	let newPassword = $state('');

	// State
	let isDeleteModalOpen = $state(false);
	let deleteForm: HTMLFormElement;

	// Toast handler for Password Change
	const passwordEnhance: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Password updated successfully');
				currentPassword = '';
				newPassword = '';
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Failed to update password');
			}
		};
	};

	// Toast handler for Delete Account
	const deleteEnhance: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'failure') {
				toast.error(result.data?.message || 'Failed to delete account');
			}
		};
	};
</script>

<ModalConfirm
	open={isDeleteModalOpen}
	title="Delete Account"
	message="Are you sure? This cannot be undone."
	onConfirm={() => deleteForm.requestSubmit()}
	onCancel={() => (isDeleteModalOpen = false)}
>
	<input
		type="password"
		name="password"
		form="delete-form"
		placeholder="Enter password to confirm"
		required
		style="width: 100%; margin: 1rem 0; padding: 0.5rem; border-radius: 4px; background: var(--bg-color); color: white; border: 1px solid #444;"
	/>
</ModalConfirm>

<!-- Hidden delete form -->
<form
	method="post"
	action="?/deleteAccount"
	bind:this={deleteForm}
	use:enhance={deleteEnhance}
	class="hidden"
></form>

<div class="container">
	<div class="panel">
		<h3>Profile Information</h3>
		<div class="info-grid">
			<div class="info-item">
				<span class="label">User ID:</span>
				<button
					class="value code"
					onclick={() => {
						copyToClipboard(data.user.id);
					}}
				>
					{data.user.id}
				</button>
			</div>
			<div class="info-item">
				<span class="label">Email:</span>
				<span class="value">{data.user.email}</span>
			</div>
			<div class="info-item">
				<span class="label">Account Created:</span>
				<span class="value">{new Date(data.user.createdAt).toLocaleDateString()}</span>
			</div>
		</div>

		<hr />

		<h3>Security</h3>

		<!-- Password Change Form -->
		<form action="?/changePassword" method="POST" use:enhance={passwordEnhance} class="auth-form">
			<div>
				<input
					type="password"
					bind:value={currentPassword}
					name="currentPassword"
					placeholder="Current Password"
					required
				/>
				<input
					type="password"
					bind:value={newPassword}
					name="newPassword"
					placeholder="New Password"
					required
				/>
			</div>

			<button type="submit" class="btn-primary">Update Password</button>
		</form>

		<hr />

		<div class="danger-zone">
			<h1>Danger Zone</h1>
			<button class="btn-danger" onclick={() => (isDeleteModalOpen = true)}>
				Delete Account
			</button>
		</div>
	</div>
</div>

<style>
	.panel {
		background: var(--card-bg);
		padding: 1.5rem;
		border-radius: 0.5rem;
		margin-top: 2rem;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.auth-form div {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	input {
		background: var(--bg-color);
		color: white;
		padding: 0.5rem;
		border: 1px solid #444;
		border-radius: 4px;
	}

	.danger-zone {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px solid var(--danger);
		border-radius: 0.5rem;
	}

	.danger-zone h1 {
		margin: 0.5rem 0;
	}

	hr {
		border: 0;
		border-top: 1px solid #333;
		margin: 1.5rem 0;
	}

	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.info-item {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.label {
		color: #6c7086;
		width: 12rem;
	}

	.value {
		color: white;
	}

	.code {
		background: var(--bg-color);
		padding: 0.2rem 0.4rem;
		border-radius: 0.2rem;
		font-family: monospace;
	}
</style>
