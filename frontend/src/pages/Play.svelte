<script>
  import { onMount } from "svelte";
  import { user, jwt_token } from "../store";
  import axios from "axios";

  const api_root = window.location.origin;

  let allQuestions = []; // Array to store all questions
  let questions = []; // Array to store filtered questions
  let userAnswer = "";
  let playerDetails;
  let playerLevel;
  let currentQuestionIndex = 0;

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

      console.log("playerDetails:", response.data);
      console.log("playerLevel:", playerLevel);
      console.log("QuestionIndex:", currentQuestionIndex);
      
    } catch (error) {
      alert("Could not get Player associated to current user");
      console.log(error);
    }
  }

  async function handleSubmit() {
    await submitAnswer();
    await getPlayerDetails();
    await getQuestions();

    userAnswer = ""; // clear the input
    if (currentQuestionIndex < questions.length - 1) {
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
</script>

<div>
  {#if questions.length > 0}
    <h2>{questions[currentQuestionIndex].questionText}</h2>
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
    <p>Loading questions...</p>
  {/if}
</div>
