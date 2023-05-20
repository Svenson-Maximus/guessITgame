<script>
    import { isAuthenticated, user, jwt_token } from "../store";
    import { onMount } from "svelte";
    import axios from "axios";

    const api_root = window.location.origin;

    let playerDetails;
    let answeredQuestions = [];
    let username;
    let playerLevel;
    let averageDeviation;
    let score;

    let loading = true;

    onMount(async () => {
        try {
            await getPlayerDetails();
            loading = false;
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    });
    
    async function getPlayerDetails() {
        var config = {
            method: "get",
            url: api_root + "/api/me/player",
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        try {
            const response = await axios(config);
            playerDetails = response.data;
            playerLevel = response.data.playerLevelState;
            username = response.data.username;
            answeredQuestions = response.data.answeredQuestions;
            averageDeviation = response.data.averageDeviation;
            score = response.data.score;

            console.log(playerDetails);
        } catch (error) {
            alert("Signup again");
            console.log(error);
        }
    }
</script>


{#if !loading}
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
                            src="{playerDetails.roboHashUrl}"
                        />
                    </div>
                    <div class="card-body">
                        <h5
                            class="card-title text-center"
                            style="text-decoration: underline;"
                        >
                            {username}
                        </h5>
                        <p class="card-text" />
                        <p><b>Score:</b> {score}</p>
                        <p><b>Average Deviation:</b> {averageDeviation}%</p>
                        <p><b>Mail:</b> {$user.email}</p>
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
                {#if $isAuthenticated && playerLevel !== "COMPLETED"}
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
                <div class="card text-white bg-transparent border-light mb-3">
                    <div class="card-body levels">
                        <!-- Levels Here -->
                        <div class="level-boxes">
                            {#each ["COMPLETED", "LEVEL_7", "LEVEL_6", "LEVEL_5", "LEVEL_4", "LEVEL_3", "LEVEL_2", "LEVEL_1"] as level (level)}
                                <div
                                    class="level-box {level === playerLevel
                                        ? 'active'
                                        : ''}"
                                >
                                    {level}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
{:else}
    <div class="loader-container">
        <div class="loader" />
    </div>
{/if}

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

    .level-boxes {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1rem;
    }

    .level-box {
        background-color: transparent;
        color: #fff;
        border: 1px solid #fff;
        padding: 1rem;
        margin: 0.5rem;
        text-align: center;
        width: 100%;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .level-box.active {
        background-color: #45a3f7;
    }

    .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .loader {
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #3498db;
        width: 120px;
        height: 120px;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
