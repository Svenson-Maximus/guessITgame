<script>
    import axios from "axios";
    import { querystring } from "svelte-spa-router";
    import { Confetti } from "svelte-confetti";

    const api_root = window.location.origin;

    let currentPage;
    let nrOfPages = 0;
    let defaultPageSize = 20;

    let completedPlayers = [];
    let allPlayers = [];

    $: {
        let searchParams = new URLSearchParams($querystring);

        if (searchParams.has("page")) {
            currentPage = searchParams.get("page");
        } else {
            currentPage = "1";
        }
        getPlayer();
    }

    function getPlayer() {
        let query =
            "?pageSize=" + defaultPageSize + "&pageNumber=" + currentPage;

        var config = {
            method: "get",
            url: api_root + "/api/player" + query,
        };

        axios(config)
            .then(function (response) {
                allPlayers = response.data.content.sort(
                    (p1, p2) => p1.averageDeviation - p2.averageDeviation
                );
                completedPlayers = allPlayers.filter(
                    (player) => player.playerLevelState === "COMPLETED"
                );
                nrOfPages = response.data.totalPages;
            })
            .catch(function (error) {
                alert("Could not get players");
                console.log(error);
            });
    }
</script>

<div
    style="
  position: fixed;
  top: -50px;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;"
>
    <Confetti
        x={[-5, 5]}
        y={[0, 0.1]}
        delay={[500, 2000]}
        infinite
        duration="5000"
        amount="200"
        fallDistance="100vh"
    />
</div>

<div class="container mt-5">
    <div class="row">
        <div class="col d-flex justify-content-center">
            <div class="text-center top-players">
                <img
                    class="robohash-img"
                    alt="robohash"
                    src="https://robohash.org/{completedPlayers[1]
                        ?.username}.png"
                    width="150"
                    height="150"
                />
                <h2>#2</h2>
                <p>
                    {completedPlayers[1]?.username} - {completedPlayers[1]
                        ?.averageDeviation}%
                </p>
            </div>
            <div
                class="text-center top-players"
                style="position: relative; bottom: -20px;"
            >
                <img
                    class="robohash-img"
                    alt="robohash"
                    src="https://robohash.org/{completedPlayers[0]
                        ?.username}.png"
                    width="200"
                    height="200"
                />
                <h2>#1</h2>
                <p>
                    {completedPlayers[0]?.username} - {completedPlayers[0]
                        ?.averageDeviation}%
                </p>
            </div>
            <div class="text-center top-players">
                <img
                    class="robohash-img"
                    alt="robohash"
                    src="https://robohash.org/{completedPlayers[2]
                        ?.username}.png"
                    width="150"
                    height="150"
                />
                <h2>#3</h2>
                <p>
                    {completedPlayers[2]?.username} - {completedPlayers[2]
                        ?.averageDeviation}%
                </p>
            </div>
        </div>
    </div>
</div>
<div class="container leaderboard-container">
    <div class="row">
        <div class="col-lg-6">
            <div class="card text-white bg-transparent border-light mb-3">
                <div class="card-body">
                    <h5 class="card-title">Completed Players</h5>
                    <table class="table table-borderless custom-table">
                        <thead>
                            <tr>
                                <th scope="col">Rank</th>
                                <th scope="col">Avatar</th>
                                <th scope="col">Username</th>
                                <th scope="col">Average Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each completedPlayers as player, index}
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>
                                        <img
                                            class="robohash-img"
                                            alt="robohash"
                                            src="https://robohash.org/{player.username}.png"
                                            width="50"
                                            height="50"
                                        />
                                    </td>
                                    <td>{player.username}</td>
                                    <td>{player.averageDeviation}%</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card text-white bg-transparent border-light mb-3">
                <div class="card-body">
                    <h5 class="card-title">All Players</h5>
                    <table class="table table-borderless custom-table">
                        <thead>
                            <tr>
                                <th scope="col">Rank</th>
                                <th scope="col">Avatar</th>
                                <th scope="col">Username</th>
                                <th scope="col">Average Deviation</th>
                                <th scope="col">Current Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each allPlayers as player, index}
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>
                                        <img
                                            class="robohash-img"
                                            alt="robohash"
                                            src="https://robohash.org/{player.username}.png"
                                            width="50"
                                            height="50"
                                        />
                                    </td>
                                    <td>{player.username}</td>
                                    <td>{player.averageDeviation}%</td>
                                    <td>{player.playerLevelState}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .custom-table {
        background-color: transparent;
        color: white;
    }
    .custom-table thead th {
        border-bottom: 1px solid white;
    }
    .custom-table tbody tr td {
        border-bottom: 1px solid white;
    }
    .top-players {
        border: 2px solid white;
        border-radius: 5px;
        padding: 10px;
        margin: 5px;
    }

    .leaderboard-container {
        margin-top: 40px;
    }

</style>
