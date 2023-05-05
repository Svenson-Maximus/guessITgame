<script>
  import { onMount } from "svelte";
  import { jwt_token } from "../store";
  import axios from "axios";

  const api_root = window.location.origin;

  let allQuestions = []; // Array to store all questions
  let questions = []; // Array to store filtered questions
  let userAnswer = "";
  let playerDetails;
  let playerLevel;
  let currentQuestionIndex = 0;
  let levelCompleted = false;
  let playerId;
  let correctAnswer = null;
  let showNextButton = false;

  onMount(async () => {
    try {
      await getPlayerDetails();
      await getQuestions();
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  });

  async function getQuestions() {
    var config = {
      method: "get",
      url: api_root + "/api/question",
      headers: { Authorization: "Bearer " + $jwt_token },
    };

    try {
      const response = await axios(config);
      allQuestions = response.data.content;
      questions = allQuestions.filter(
        (question) => question.level === playerLevel
      );

      console.log("Questions:", questions);
    } catch (error) {
      alert("Could not get questions");
      console.log(error);
    }
  }

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
      playerId = response.data.id;

      console.log("playerDetails:", playerDetails);
    } catch (error) {
      alert("Could not get Player associated to current user");
      console.log(error);
    }
  }

  async function handleSubmit() {
    await submitAnswer();
    correctAnswer = questions[currentQuestionIndex].correctAnswer;
    showNextButton = true;
  }

  function handleNextQuestion() {
    userAnswer = ""; // clear the input
    showNextButton = false;
    correctAnswer = null;

    // If the player has answered all the questions, update the level and redirect to home
    if (currentQuestionIndex >= questions.length - 1) {
      updatePlayerLevel();
      levelCompleted = true;
    } else {
      currentQuestionIndex++; // move to the next question
    }
  }
  async function submitAnswer() {
    const config = {
      method: "post",
      url: `${api_root}/api/player/answer`,
      headers: {
        "Player-Id": playerDetails.id,
        Authorization: `Bearer ${$jwt_token}`,
        "Content-Type": "application/json",
      },
      data: {
        questionId: questions[currentQuestionIndex].id,
        playerAnswer: userAnswer,
      },
    };

    try {
      const response = await axios(config);
      playerDetails = response.data; // Update playerDetails with the updated player returned from the server
      userAnswer = ""; // Reset the answer input field
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  }

  async function updatePlayerLevel() {
    const playerLeveStateDTO = {
      level: getNextLevel(playerLevel), // Update the player's level
    };

    const config = {
      method: "put",
      url: `${api_root}/api/player/levelstate`,
      headers: {
        "Player-Id": playerId,
        Authorization: `Bearer ${$jwt_token}`,
        "Content-Type": "application/json",
      },
      data: playerLeveStateDTO,
    };

    try {
      const response = await axios(config);
      playerDetails = response.data; // Update playerDetails with the updated player returned from the server
      playerLevel = playerDetails.playerLevelState; // Update the player's level in our local state
    } catch (error) {
      console.error("Failed to update player level:", error);
    }
  }

  function getNextLevel(currentLevel) {
    const levels = [
      "LEVEL_1",
      "LEVEL_2",
      "LEVEL_3",
      "LEVEL_4",
      "LEVEL_5",
      "LEVEL_6",
      "LEVEL_7",
    ];
    const currentIndex = levels.indexOf(currentLevel);

    // Check if we're at the last level
    if (currentIndex === levels.length - 1) {
      // noch ändern
      return currentLevel;
    } else {
      return levels[currentIndex + 1];
    }
  }
</script>

<div>
  {#if levelCompleted}
    <h2>Level Completed!</h2>
  {:else if questions.length > 0}
    <h2>{questions[currentQuestionIndex].questionText}</h2>
    {#if !showNextButton}
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <input
            class="form-control"
            type="number"
            bind:value={userAnswer}
            placeholder="Enter your answer here"
            min="0"
            step="1"
          />
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>
      </form>
    {:else}
      <p>The correct answer was: {correctAnswer}</p>
      <button on:click={handleNextQuestion} class="btn btn-primary">Next</button
      >
    {/if}
  {:else}
    <div class="loader-container">
      <div class="loader" />
    </div>
  {/if}
</div>

<style>
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
