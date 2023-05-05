<script>
    import { isAuthenticated } from "../store";

    $: if ($isAuthenticated) {
        window.location.assign("#/home");
    }
</script>

<div class="fullscreen-container">
    <div class="guessit">
        {#if !$isAuthenticated}
            <h2 class="signup-text">Signup to Play!</h2>
        {/if}
        <img
            class="guessit-logo"
            src="/images/background.gif"
            alt="GuessITLogo"
        />
    </div>
</div>

<style>
    .fullscreen-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    .guessit {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .guessit-logo {
        width: 100%;
        height: auto;
    }

    .signup-text {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        text-align: center;
    }
</style>
