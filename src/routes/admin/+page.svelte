<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="container">
	<h1>Admin Panel</h1>
	<p class="subtitle">Manage exercises and system settings</p>

	<div class="admin-grid">
		<a href={resolve('/admin/exercises')} class="panel admin-card">
			<div class="icon">✍️</div>
			<h3>Exercise Management</h3>
			<p>Create, edit, or delete typing exercises.</p>
		</a>

		<a href={resolve('/admin/users')} class="panel admin-card">
			<div class="icon">👥</div>
			<h3>User Management</h3>
			<p>View user stats and manage roles.</p>
		</a>
	</div>
</div>

<style>
	h1 {
		margin-bottom: 0.5rem;
	}

	.admin-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 300px));
		gap: 1.5rem;
	}

	.admin-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		text-align: center;
		transition:
			transform 0.2s,
			background-color 0.2s;
		border: 1px solid transparent;
	}

	.admin-card:hover {
		transform: translateY(-5px);
		border-color: var(--accent);
		text-decoration: none;
	}

	.icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.icon:hover {
		text-decoration: none !important;
	}

	h3 {
		margin-bottom: 0.5rem;
		color: var(--accent);
	}

	p {
		font-size: 0.9rem;
		color: var(--text-muted);
	}
</style>
