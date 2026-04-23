<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="container">
	<h1>Register</h1>
	<form method="post" action="?/signInEmail" use:enhance>
		<label>
			Username
			<input name="name" />
		</label>
		<label>
			Email
			<input type="email" name="email" />
		</label>
		<label>
			Password
			<input type="password" name="password" />
		</label>
		<button formaction="?/signUpEmail">Register</button>
	</form>
	<a href={resolve('/login')} class="login">Login</a>
	<p class="error">{form?.message ?? ''}</p>
</div>

<style>
	.container {
		align-items: center;
		justify-content: center;
		height: 100%;
	}

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

	.login {
		margin-top: 1rem;
	}
</style>
