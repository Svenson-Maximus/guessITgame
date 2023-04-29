<script>
  import { onMount } from "svelte";
  import { user, jwt_token } from "../store";
  import axios from "axios";

  const api_root = window.location.origin;

  let questionText = "";
  let correctAnswer = 0.0;
  let userAnswer = "";

  let playerId;
  let playerLevel;



  onMount(async () => {
      // Fetch the question from backend and set the questionText and correctAnswer
      try {
          const response = await axios.get("/api/question");
          questionText = response.data.questionText;
          correctAnswer = response.data.correctAnswer;
      } catch (error) {
          console.error("Failed to fetch question:", error);
      }
  });

  function getPlayerId() {
        var config = {
            method: "get",
            url: api_root + "/api/me/freelancer",
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                playerId = response.data.id;
            })
            .catch(function (error) {
                alert("Could not get Player associated to current user");
                console.log(error);
            });
    }
    getPlayerId();

  async function submitAnswer() {
      // Submit the answer to your backend
      try {
          const response = await axios.post("/api/answer", {
              user: $user,
              answer: userAnswer
          });
          // Handle response
      } catch (error) {
          console.error("Failed to submit answer:", error);
      }
  }
</script>

<div>
  <h2>{questionText}</h2>
  <input bind:value={userAnswer} placeholder="Enter your answer here" />
  <button on:click={submitAnswer}>Submit Answer</button>
</div>
