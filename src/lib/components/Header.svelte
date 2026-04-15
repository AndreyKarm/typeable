<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/favicon.svg';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	let { user }: { user: App.Locals['user'] } = $props();

	let isOpen = $state(false);
</script>

<header>
	<nav class="container">
		<div class="logo">
			<a href={resolve('/')}>
				<img src={logo} alt="logo" class="logo" height={42} />
			</a>
		</div>

		<div class="links">
			<a href={resolve('/dashboard')}>Dashboard</a>
			<a href={resolve('/practice')}>Practice</a>
			<a href={resolve('/duel')}>PVP Duels</a>
			<a href={resolve('/leaderboard')}>Leaderboard</a>
		</div>

		<div class="user-menu-container">
			<button
				class="user-profile"
				onclick={() => (user ? (isOpen = !isOpen) : null)}
				aria-expanded={isOpen}
			>
				{user?.name?.charAt(0).toUpperCase() ?? 'G'}
			</button>

			{#if isOpen}
				<div class="dropdown" transition:slide={{ duration: 300, easing: cubicOut }}>
					<a href={resolve('/profile')}>Profile</a>
					<a href={resolve('/options')}>Options</a>
					<hr />
					<form method="post" action="?/signOut" use:enhance>
						<button class="danger">Sign out</button>
					</form>
				</div>
			{/if}
		</div>
	</nav>
</header>

<style>
	.container {
		margin: 0.2rem auto;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 90%;
	}

	header {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 4rem;
		padding: 0 1rem;
		border-bottom: 1px solid var(--card-bg);
	}

	.links {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	.user-menu-container {
		position: relative;
	}

	.user-profile {
		height: 3rem;
		width: 3rem;
		border-radius: 50%;
		background-color: var(--bg-color);
		border: 2px solid var(--accent);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		color: var(--text-main);
		transition: transform 0.2s;
	}

	.user-profile:hover {
		transform: scale(1.05);
	}

	.dropdown {
		position: absolute;
		top: 3.5rem;
		right: 0;
		background-color: var(--card-bg);
		border: 1px solid var(--bg-color);
		border-radius: 0.5rem;
		padding: 0.5rem;
		width: 150px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 1000;
	}

	.dropdown a {
		padding: 0.5rem;
		text-decoration: none;
		color: var(--text-main);
		border-radius: 0.3rem;
	}

	.dropdown a:hover {
		background-color: var(--bg-color);
	}

	.dropdown hr {
		border: 0;
		border-top: 1px solid var(--bg-color);
		margin: 0.5rem 0;
	}

	.dropdown .danger {
		background-color: var(--danger);
	}
</style>
