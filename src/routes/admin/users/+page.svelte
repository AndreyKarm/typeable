<script lang="ts">
	import toast from 'svelte-5-french-toast';
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let users = $state<typeof data.users>([]);

	$effect(() => {
		users = data.users.map((u) => ({ ...u }));
	});

	let search = $state('');
	let loadingId = $state<string | null>(null);
	let expandedIds = $state<Record<string, boolean>>({});

	const filtered = $derived(
		users.filter(
			(u) =>
				u.name.toLowerCase().includes(search.toLowerCase()) ||
				u.email.toLowerCase().includes(search.toLowerCase())
		)
	);

	const formatDate = (dateString: string | Date) => {
		return new Date(dateString).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	async function updateRole(u: (typeof users)[number]) {
		const original = data.users.find((orig) => orig.id === u.id);
		if (!original) return;

		const hasChanged =
			u.role !== original?.role ||
			u.banned !== original?.banned ||
			(u.notes ?? '') !== (original?.notes ?? '');

		if (!hasChanged) return;

		loadingId = u.id;

		const formData = new FormData();
		formData.append('id', u.id);
		formData.append('role', u.role);
		formData.append('banned', u.banned.toString());
		formData.append('notes', u.notes ?? '');

		try {
			const response = await fetch('?/updateUser', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				toast.success('User updated');
				await invalidateAll();
			} else {
				toast.error('Update failed');
			}
		} catch (e) {
			console.error(e);
			toast.error('An error occurred');
		} finally {
			loadingId = null;
		}
	}
</script>

<div class="container">
	<h1>User Management</h1>

	<!-- Search Panel -->
	<div class="panel search">
		<Icon icon="carbon:search" width="24" />
		<input type="text" bind:value={search} placeholder="Search users by name or email..." />
	</div>

	<!-- User Table -->
	<table class="user-table">
		<thead>
			<tr>
				<th>id</th>
				<th>Name</th>
				<th>Email</th>
				<th>Joined</th>
				<th>Role</th>
				<th>Status</th>
				<th>Ban Reason (Notes)</th>
			</tr>
		</thead>
		<tbody>
			{#each filtered as u (u.id)}
				<tr class:loading={loadingId === u.id}>
					<td
						onclick={() => (expandedIds[u.id] = !expandedIds[u.id])}
						style="cursor: pointer; font-family: monospace;"
						title="Click to toggle ID visibility"
					>
						{expandedIds[u.id] ? u.id : `${u.id.slice(0, 10)}...`}
					</td>
					<td>{u.name}</td>
					<td>{u.email}</td>
					<td>{formatDate(u.createdAt)}</td>
					<td>
						<select
							bind:value={u.role}
							onchange={() => updateRole(u)}
							disabled={loadingId === u.id}
						>
							<option value="user">User</option>
							<option value="moderator">Moderator</option>
							<option value="admin">Admin</option>
						</select>
					</td>
					<td>
						<select
							value={u.banned ? 'true' : 'false'}
							onchange={(e) => {
								u.banned = e.currentTarget.value === 'true';
								updateRole(u);
							}}
							disabled={loadingId === u.id}
						>
							<option value="false">Active</option>
							<option value="true">Banned</option>
						</select>
					</td>
					<td>
						<input
							type="text"
							class="notes"
							bind:value={u.notes}
							placeholder="Reason..."
							onblur={() => updateRole(u)}
							disabled={loadingId === u.id}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.user-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--card-bg);
		border-radius: 0.5rem;
		margin-top: 1rem;
	}

	td,
	th {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid var(--bg-color);
	}

	.loading {
		opacity: 0.6;
		pointer-events: none;
	}

	.user-table select {
		background: var(--bg-color);
		color: var(--text-main);
		border: 1px solid var(--text-muted);
		padding: 0.4rem;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.user-table select:focus {
		border-color: var(--accent);
	}

	.notes {
		background: var(--bg-color);
		color: var(--text-main);
		border: 1px solid var(--text-muted);
		padding: 0.4rem;
		border-radius: 0.25rem;
		width: 100%;
	}
</style>
