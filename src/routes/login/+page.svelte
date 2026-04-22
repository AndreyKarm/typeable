<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="container">
	<h1>Login</h1>
	<form method="post" action="?/signInEmail" use:enhance>
		<label>
			Email
			<input type="email" name="email" />
		</label>
		<label>
			Password
			<input type="password" name="password" />
		</label>
		<button>Login</button>
	</form>
	<p class="error">{form?.message ?? ''}</p>
</div>

<style>
	form {
		min-width: 20rem;
	}

	button {
		align-self: center;
		width: 20rem;
	}

	.error {
		color: red;
		align-self: center;
	}
</style>
