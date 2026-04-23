<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import favicon from '$lib/assets/favicon.svg';

	import './layout.css';
	import { Toaster } from 'svelte-5-french-toast';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>TypeAble</title>
</svelte:head>

<Toaster position="top-center" />
<Header user={data.user} />
<main class="page-wrapper">
	{@render children()}
</main>

<style>
	.page-wrapper {
		margin-top: 4rem;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* justify-content: center; */
		width: 100%;
	}
</style>
