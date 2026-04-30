<script lang="ts">
	import toast from 'svelte-5-french-toast';
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';

	let { data }: { data: PageData } = $props();
	let search = $state('');
	let loadingId = $state<string | null>(null);

	let expandedIds = $state<Record<string, boolean>>({});

	const filtered = $derived(
		data.users.filter(
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

	async function updateRole(id: string, role: string, banned: boolean) {
		loadingId = id;

		const formData = new FormData();
		formData.append('id', id);
		formData.append('role', role);
		formData.append('banned', banned.toString());

		try {
			const response = await fetch('?/updateUser', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				toast.success('User updated');
			} else {
				toast.error('Update failed');
			}
		} catch (error) {
			console.error(error);
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
							onchange={() => updateRole(u.id, u.role, u.banned)}
							disabled={loadingId === u.id}
						>
							<option value="user">User</option>
							<option value="moderator">Moderator</option>
							<option value="admin">Admin</option>
						</select>
					</td>
					<td>
						<select
							bind:value={u.banned}
							onchange={() => updateRole(u.id, u.role, u.banned)}
							disabled={loadingId === u.id}
						>
							<option value={false}>Active</option>
							<option value={true}>Banned</option>
						</select>
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

	select {
		background: var(--bg-color);
		color: var(--text-main);
		border: 1px solid var(--text-muted);
		padding: 0.4rem;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	select:focus {
		border-color: var(--accent);
	}
</style>
