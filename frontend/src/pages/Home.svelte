<script>
    import { isAuthenticated, user, jwt_token } from "../store";
</script>

<div class="row">
    {#if $isAuthenticated}
        <div class="col col-fixed">
            <!-- Bootstrap Card -->
            <div
                class="card text-white bg-transparent border-light mb-3"
                style="max-width: 18rem;"
            >
                <div class="card-header">
                    <img
                        class="card-img-top robohash-img"
                        alt="robohash"
                        src="https://robohash.org/{$user.name}.png"
                    />
                </div>
                <div class="card-body">
                    <h5 class="card-title">Account Infos</h5>
                    <p class="card-text" />
                    <p><b>Username:</b> {$user.nickname}</p>
                    <p><b>Email:</b> {$user.email}</p>
                    
                </div>
            </div>
        </div>
    {/if}
    <div class="col col-fixed empty-column">
        <div class="guessit">
            <img
                class="guessit-logo"
                src="/images/background.gif"
                alt="GuessITLogo"
            />
            {#if $isAuthenticated}
                <!-- Play Button -->
                <div class="play-button-container">
                    <a href="#/play/" class="btn btn-primary">Play</a>
                </div>
            {/if}
        </div>
    </div>
    {#if $isAuthenticated}
        <div class="col col-fixed">
            <!-- Bootstrap Card -->
            <div class="card bg-dark text-white">
                <div class="card-body levels">
                    <!-- Levels Here -->
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        animation: gradient 15s ease infinite;
        height: 100vh;
        margin: 0;
    }

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }

        50% {
            background-position: 100% 50%;
        }

        100% {
            background-position: 0% 50%;
        }
    }

    .robohash-img {
        max-width: 100%;
        max-height: 100%;
    }

    .levels {
        padding: 1rem;
        position: relative;
    }

    .play-button-container {
        position: absolute;
        top: 50px;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-primary {
        font-family: "Arial Black", Arial, sans-serif;
        font-size: 24px;
        padding: 16px 32px;
        background-color: #45a3f7;
        color: #ffffff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .btn-primary:hover {
        box-shadow: 0px 0px 100px 0px rgba(251, 44, 237, 0.75);
        color: rgb(62, 17, 209);
    }

    .guessit-logo {
        width: 100%;
        height: auto;
    }

    .col-fixed {
        width: 33.3333%;
    }
</style>
