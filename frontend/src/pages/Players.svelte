<script>
    import axios from "axios";
    import { querystring } from "svelte-spa-router";
    import { isAuthenticated, user, jwt_token } from "../store";

    const api_root = window.location.origin;

    let currentPage;
    let nrOfPages = 0;
    let defaultPageSize = 4;

    let players = [];
    let player = {
        id: null,
        email: null,
        username: null,
    };

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
            headers: {Authorization: "Bearer "+$jwt_token},
        };

        axios(config)
            .then(function (response) {
                players = response.data.content;
                nrOfPages = response.data.totalPages;
            })
            .catch(function (error) {
                alert("Could not get players");
                console.log(error);
            });
    }

    function createPlayer() {
        var config = {
            method: "post",
            url: api_root + "/api/player",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer "+$jwt_token
            },
            data: player,
        };

        axios(config)
            .then(function (response) {
                alert("Player created");
                getPlayer();
            })
            .catch(function (error) {
                alert("Could not create Player");
                console.log(error);
            });
    }

    function deletePlayer(id) {
    var config = {
        method: "delete",
        url: api_root + "/api/player/" + id,
        headers: {
            Authorization: "Bearer " + $jwt_token
        },
    };

    axios(config)
        .then(function (response) {
            alert("Player deleted");
            getPlayer();
        })
        .catch(function (error) {
            alert("Could not delete Player");
            console.log(error);
        });
}

</script>


<h1 class="mt-3">Create Player</h1>
<form class="mb-5">
    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="name">Username</label>
            <input
                bind:value={player.username}
                class="form-control"
                id="username"
                type="text"
            />
        </div>
    </div>
    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="email">E-Mail</label>
            <input
                bind:value={player.email}
                class="form-control"
                id="email"
                type="email"
            />
        </div>
    </div>
    <button type="button" class="btn btn-primary" on:click={createPlayer}>Submit</button>
</form>

<h1>All Players</h1>
<table class="table">
    <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">E-Mail</th>
            <th scope="col">Current Level</th>
        </tr>
    </thead>
    <tbody>
        {#each players as player}
            <tr>
                <td>{player.username}</td>
                <td>{player.email}</td>
                <td>{player.playerLevelState}</td>
                <button type="button" class="btn btn-danger" on:click={() => deletePlayer(player.id)}>Delete</button>
            </tr>
        {/each}
    </tbody>
</table>
<nav>
    <ul class="pagination">
        {#each Array(nrOfPages) as _, i}
            <li class="page-item">
                <a
                    class="page-link"
                    class:active={currentPage == i + 1}
                    href={"#/players?page=" + (i + 1)}
                    >{i + 1}
                </a>
            </li>
        {/each}
    </ul>
</nav>

