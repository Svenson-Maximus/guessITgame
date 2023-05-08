<script>
    import axios from "axios";
    import { querystring } from "svelte-spa-router";

    const api_root = window.location.origin;

    let currentPage;
    let nrOfPages = 0;
    let defaultPageSize = 4;

    let players = [];
    

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
    let query = "?pageSize=" + defaultPageSize + "&pageNumber=" + currentPage;

    var config = {
        method: "get",
        url: api_root + "/api/player" + query,
    };

    axios(config)
        .then(function (response) {
            let allPlayers = response.data.content;
            let completedPlayers = allPlayers.filter(player => player.playerLevelState === "COMPLETED");
            let leaderboard = completedPlayers.sort((p1, p2) => p1.averageDeviation - p2.averageDeviation);
            players = leaderboard;
            nrOfPages = response.data.totalPages;
        })
        .catch(function (error) {
            alert("Could not get players");
            console.log(error);
        });
}
</script>

<div class="container">
    <div class="row">
        <div class="col col-6">
            <div class="card text-white bg-transparent border-light mb-3">
                <div class="card-body">
                    <h5 class="card-title">Leaderboard - Completed Players</h5>
                    <ul class="list-group">
                        {#each players as player, index}
                            <li class="list-group-item bg-transparent">
                                {index + 1}. {player.username} - Average Deviation:
                                {player.averageDeviation}%
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
        <div class="col col-6">
            <div class="card text-white bg-transparent border-light mb-3">
                <div class="card-body">
                    <h5 class="card-title">All Players</h5>
            <ul class="list-group">
                {#each players as player, index}
                    <li class="list-group-item bg-transparent">
                        {index + 1}. {player.username} - Average Deviation:
                        {player.averageDeviation}% - Player Level State: {player.playerLevelState}
                    </li>
                {/each}
            </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Add any additional CSS styles here */
</style>
