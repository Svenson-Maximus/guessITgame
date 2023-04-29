<script>
	import Router from "svelte-spa-router";
	import routes from "./routes";
	import { isAuthenticated, user } from "./store";
	import auth from "./auth.service";
</script>	
<title>GuessIt</title>
<div id="app">
	<nav class="navbar navbar-expand-lg" style="background-color: transparent; border-bottom: 1px solid white;">
		<div class="container-fluid">
			<a class="navbar-brand" href="#/home">Home</a>
			{#if $isAuthenticated && $user.user_roles && $user.user_roles.includes("admin") }
			<a class="navbar-brand" href="#/players">Players</a>
			{/if}
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarNav"
				aria-controls="navbarNav"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<div class="collapse navbar-collapse" id="navbarNav">
				<div class="d-flex ms-auto">
					{#if $isAuthenticated}
						<span class="navbar-text me-2">
							{$user.name}
						</span>
						<button
							type="button"
							class="btn btn-primary"
							on:click={auth.logout}>Log Out</button
						>
					{:else}
						<button
							type="button"
							class="btn btn-primary"
							on:click={auth.loginWithPopup}>Log In</button
						>
					{/if}
				</div>
			</div>
		</div>
	</nav>
</div>

<div class="container mt-3">
	<Router {routes} />
</div>
