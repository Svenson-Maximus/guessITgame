import Home from "./pages/Home.svelte";
import Play from "./pages/Play.svelte";
import Players from "./pages/Players.svelte";
import Leaderboard from "./pages/Leaderboard.svelte";
import NotLoggedIn from "./pages/NotLoggedIn.svelte";


export default {
    '/': NotLoggedIn,
    '/home': Home,
    '/play': Play,
    '/players': Players,
    '/leaderboards': Leaderboard,
}